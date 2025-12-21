import { useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import socket from "../config/socket";
import RTC_CONFIG from "../config/RtcConfig";

const RoomPage = () => {
  const { id: roomId } = useParams();
  const location = useLocation();
  const { email } = location.state || {};

  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!email || !roomId) return;

    socket.emit("join-room", { roomId, email });

    // =============== CALLER SIDE (OFFER) ===============
    socket.on("user-joined", async ({ email: joinedEmail }) => {
      pcRef.current = new RTCPeerConnection(RTC_CONFIG); // creating peer connection

      pcRef.current.onicecandidate = (event) => { // Sending ICE candidates
        if (event.candidate) {
          socket.emit("ice-candidate", {
            email: joinedEmail,
            candidate: event.candidate,
          });
        }
      };
      // Receiving remote stream
      pcRef.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      const stream = await navigator.mediaDevices.getUserMedia({ // Getting media
        video: true,
        audio: true,
      });

      stream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, stream);
      });
      localVideoRef.current.srcObject = stream;

      const offer = await pcRef.current.createOffer(); // creating offer
      await pcRef.current.setLocalDescription(offer);
      socket.emit("call-user", { email: joinedEmail, offer }); //Seding offer request to the joined user
    });

    // ================= CALLEE SIDE (ANSWER)====================
    socket.on("incoming-call", async ({ from, offer }) => {
      pcRef.current = new RTCPeerConnection(RTC_CONFIG);

      pcRef.current.onicecandidate = (event) => { // Sending ICE candidates
        if (event.candidate) {
          socket.emit("ice-candidate", {
            email: from,
            candidate: event.candidate,
          });
        }
      };
      // Receiving remote stream
      pcRef.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, stream);
      });
      localVideoRef.current.srcObject = stream;
      await pcRef.current.setRemoteDescription(offer); // Accept offer

      const answer = await pcRef.current.createAnswer(); // Create answer
      await pcRef.current.setLocalDescription(answer);

      socket.emit("call-accepted", { // Send answer back
        email: from,
        answer,
      });
    });

    // ================= CALLER RECEIVES ANSWER ==============
    socket.on("call-accepted", async ({ answer }) => {
      await pcRef.current.setRemoteDescription(answer);
    });

    // ================== ICE CANDIDATE RECEIVE =================
    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate && pcRef.current) {
        await pcRef.current.addIceCandidate(candidate);
      }
    });

    // Cleanup functions
    return () => {
      socket.off("user-joined");
      socket.off("incoming-call");
      socket.off("ice-candidate");
      socket.off("call-accepted");
    };
  }, [roomId, email]);


  
  return (
    <>
      <h2 className="text-3xl font-bold mb-4">Room: {roomId}</h2>
      <div className="min-h-screen flex gap-6 items-center justify-center bg-gray-100">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-64 border"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-64 border"
        />
      </div>
    </>
  );
};

export default RoomPage;
