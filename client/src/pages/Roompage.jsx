import React, { useCallback, useEffect, useState } from "react";
import socket from "../config/socket";
import { usePeer } from "../providers/peer";
import ReactPlayer from "react-player";

export const Roompage = () => {
  const {
    peer,
    createOffer,
    createAnswere,
    setRemoteAns,
    sendStream,
    remoteStream,
  } = usePeer();
  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState(null);

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { email } = data;
      console.log("New user joined : ", email);
      const offer = await createOffer();
      socket.emit("call-user", { email, offer });
      setRemoteEmailId(email);
    },
    [socket, createOffer]
  );

  const handleIncommingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("Incoming call from :", from, offer);
      const ans = await createAnswere(offer);
      socket.emit("call-accepted", { email: from, ans });
      setRemoteEmailId(from);
    },
    [createAnswere, socket]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      const { ans } = data;
      console.log("call accepted", ans);
      await setRemoteAns(ans);
    },
    [setRemoteAns]
  );

  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
  }, []);

  const handleNegotiation = useCallback(() => {
    const localOffer = peer.localDescription;
    socket.emit('call-user', {email: remoteEmailId, offer: localOffer});
  }, [peer.localDescription, remoteEmailId, socket]);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("Incomming-call", handleIncommingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("Incomming-call", handleIncommingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [handleNewUserJoined, handleIncommingCall, handleCallAccepted, socket]);

  useEffect(() => {
     peer.addEventListener('negotiationneeded', handleNegotiation)
     return()=>{
      peer.removeEventListener('negotiationneeded', handleNegotiation)
     }
  }, []);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  return (
    <>
      <div className="min-h-screen w-full bg-gray-500 flex flex-col items-center">
        <h1 className="text-4xl font-bold mt-4">Welcome to ZoomeR</h1>
        <h4>`You are connected to : {remoteEmailId}`</h4>
        <button
          onClick={(e) => sendStream(myStream)}
          className="w-md p-2 cursor-pointer rounded-xl font-semibold bg-blue-400 text-white"
        >
          Send my Video
        </button>
        <ReactPlayer url={myStream} playing />
        <ReactPlayer url={remoteStream} playing />
      </div>
    </>
  );
};
