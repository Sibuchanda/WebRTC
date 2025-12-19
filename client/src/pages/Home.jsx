import React, { useCallback, useEffect, useState } from "react";
import socket from "../config/socket";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleOnSubmit = () => {
    socket.emit("join-room", {
      // email:email, roomId: roomId
      email,
      roomId,
    });
    setEmail("");
    setRoomId("");
  };

  const handleRoomJoined = useCallback(({ roomId }) => {
    navigate(`/room/${roomId}`);
  }, [navigate]);

  useEffect(() => {
    socket.on("joined-room", handleRoomJoined);

    return () => {
      socket.off("joined-room", handleRoomJoined);
    };
  }, [socket]);

  return (
    <>
      <div className="min-h-screen w-screen bg-gray-300 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-md h-60 gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-2 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
          />

          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room code"
            className="w-full p-2 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
          />

          <button
            onClick={handleOnSubmit}
            className="w-full p-2 cursor-pointer rounded-xl font-semibold bg-blue-400 text-white"
          >
            Enter Room
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
