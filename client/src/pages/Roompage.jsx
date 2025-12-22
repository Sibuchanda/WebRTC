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
  const pendingIceCandidates = useRef([]);

  useEffect(() => {
    if (!email || !roomId) return;

    socket.emit("join-room", { roomId, email });

    // =============== CALLER SIDE (OFFER) ===============
    socket.on("user-joined", async ({ email: joinedEmail }) => {
      pcRef.current = new RTCPeerConnection(RTC_CONFIG); // creating peer connection

      pcRef.current.onicecandidate = (event) => {
        // Sending ICE candidates
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

      const stream = await navigator.mediaDevices.getUserMedia({
        // Getting media
        video: true,
        audio: true,
      });

      stream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, stream);
      });
      localVideoRef.current.srcObject = stream;

      const offer = await pcRef.current.createOffer(); // creating offer
      await pcRef.current.setLocalDescription(offer);
      for (const c of pendingIceCandidates.current) {
        await pcRef.current.addIceCandidate(c);
      }
      pendingIceCandidates.current = [];
      socket.emit("call-user", { email: joinedEmail, offer }); //Seding offer request to the joined user
    });

    // ================= CALLEE SIDE (ANSWER)====================
    socket.on("incoming-call", async ({ from, offer }) => {
      pcRef.current = new RTCPeerConnection(RTC_CONFIG);

      pcRef.current.onicecandidate = (event) => {
        // Sending ICE candidates
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

      for (const c of pendingIceCandidates.current) {
        await pcRef.current.addIceCandidate(c);
      }
      pendingIceCandidates.current = [];

      const answer = await pcRef.current.createAnswer(); // Create answer
      await pcRef.current.setLocalDescription(answer);

      socket.emit("call-accepted", {
        // Send answer back
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
      if (!pcRef.current || !candidate) return;
      if (pcRef.current.remoteDescription) {
        await pcRef.current.addIceCandidate(candidate);
      } else {
        pendingIceCandidates.current.push(candidate);
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
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-gray-100">
        <header className="shrink-0 py-3 text-center">
          <h2 className="text-lg sm:text-xl font-semibold">
            Room ID : {roomId}
          </h2>
          <div className="flex items-center gap-1 bg-black w-fit p-2 rounded-full ml-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-slate-300 text-sm font-medium tracking-wide">
              LIVE
            </span>
          </div>
        </header>

        <main className="relative flex-1 flex items-center justify-center overflow-hidden">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="
            w-full
            h-full
            object-contain
            max-w-[1200px]
            rounded-md
          "
          />
          {/* Local Video  */}
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="
            absolute
            bottom-3
            right-3
            w-28
            sm:w-36
            md:w-44
            aspect-video
            rounded-md
            shadow-md
          "
          />
        </main>
      </div>
    </>
  );
};

export default RoomPage;
