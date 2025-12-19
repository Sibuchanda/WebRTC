import React, { useCallback, useEffect } from "react";
import socket from "../config/socket";
import { usePeer } from "../providers/peer";

export const Roompage = () => {
  const { peer, createOffer } = usePeer();

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { email } = data;
      console.log("New user joined : ", email);
      const offer = await createOffer();
      socket.emit("call-user", { email, offer });
    },
    [socket, createOffer]
  );

  const handleIncommingCall = useCallback((data) => {
    const { from, offer } = data;
    console.log("Incoming call from :", from, offer);
  }, []);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("Incomming-call", handleIncommingCall);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("Incomming-call", handleIncommingCall);
    };
  }, [handleNewUserJoined, socket]);

  return (
    <>
      <div className="min-h-screen w-full bg-gray-500 flex flex-col items-center">
        <h1 className="text-4xl font-bold mt-4">Welcome to ZoomeR</h1>
        <div></div>
      </div>
    </>
  );
};
