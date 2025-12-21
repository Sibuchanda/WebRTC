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

  useEffect(() => {
    if (!email || !roomId) return;

    socket.emit("join-room", { roomId, email });

    socket.on("user-joined", async ({ email: joinedEmail }) => {
      pcRef.current = new RTCPeerConnection(RTC_CONFIG); // creating peer connection
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
      socket.emit("call-user", { email: joinedEmail, offer }); //Seding offer request to the joined user
    });


    socket.on("incoming-call", async ({ from, offer }) => {
      //  console.log(`Incoming call from : ${from}  with offer : ${offer}`)
      pcRef.current = new RTCPeerConnection(RTC_CONFIG);

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


    socket.on("call-accepted", async({answer})=>{
      await pcRef.current.setRemoteDescription(answer);
    })

    // Cleanup functions
    return () => {
      socket.off("user-joined");
      socket.off("incoming-call");
    };
  }, [roomId, email]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h2 className="text-3xl font-bold mb-4">Room: {roomId}</h2>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="w-72 border"
      />
    </div>
  );
};

export default RoomPage;
