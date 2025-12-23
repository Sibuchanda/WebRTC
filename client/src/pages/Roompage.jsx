import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { GoMute, GoUnmute } from "react-icons/go";
import { IoVideocam, IoVideocamOff } from "react-icons/io5";
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
  const localStreamRef = useRef(null);
  const [callLive, setCallLive] = useState(false);
  const [calleeEmail, setCalleeEmail] = useState("");

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  useEffect(() => {
    if (!email || !roomId) return;

    socket.emit("join-room", { roomId, email });

    // =============== CALLER SIDE (OFFER) ===============
    socket.on("user-joined", async ({ email: joinedEmail }) => {
      setCalleeEmail(joinedEmail);
      pcRef.current = new RTCPeerConnection(RTC_CONFIG);

      pcRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            email: joinedEmail,
            candidate: event.candidate,
          });
        }
      };

      pcRef.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
        setCallLive(true);
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      stream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, stream);
      });
      localVideoRef.current.srcObject = stream;

      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      for (const c of pendingIceCandidates.current) {
        await pcRef.current.addIceCandidate(c);
      }
      pendingIceCandidates.current = [];
      socket.emit("call-user", { email: joinedEmail, offer });
    });

    // ================= CALLEE SIDE (ANSWER)====================
    socket.on("incoming-call", async ({ from, offer }) => {
      setCalleeEmail(from); // Set the remote user's email
      pcRef.current = new RTCPeerConnection(RTC_CONFIG);

      pcRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            email: from,
            candidate: event.candidate,
          });
        }
      };

      pcRef.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
        setCallLive(true);
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      stream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, stream);
      });
      localVideoRef.current.srcObject = stream;
      await pcRef.current.setRemoteDescription(offer);

      for (const c of pendingIceCandidates.current) {
        await pcRef.current.addIceCandidate(c);
      }
      pendingIceCandidates.current = [];

      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      socket.emit("call-accepted", {
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

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [roomId, email]);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  return (
    <>
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-gray-100">
        <header className="shrink-0 py-3 text-center">
          <h2 className="text-lg sm:text-xl font-semibold">
            Room ID : {roomId}
          </h2>
          {callLive && (
            <div className="flex items-center gap-1 bg-black w-fit p-2 rounded-full ml-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-slate-300 text-sm font-medium tracking-wide">
                LIVE
              </span>
            </div>
          )}
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
          {calleeEmail && (
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg z-10">
              <span className="text-white text-sm font-medium">
                {calleeEmail}
              </span>
            </div>
          )}

          {/* Local Video  */}
          <div className="absolute bottom-3 right-3 w-28 sm:w-36 md:w-44 aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full rounded-md object-cover shadow-md"
            />
            {email && (
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded z-10">
                <span className="text-white text-xs font-medium">{email}</span>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full shadow-lg transition-all cursor-pointer ${
                isAudioMuted
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {isAudioMuted ? <GoMute /> : <GoUnmute />}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full shadow-lg transition-all cursor-pointer ${
                isVideoMuted
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {isVideoMuted ? <IoVideocamOff /> : <IoVideocam />}
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default RoomPage;