import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import socket from "../config/socket";

const RoomPage = () => {
  const { id: roomId } = useParams();
  const location = useLocation();
  console.log("Location is : ",location);
  const { email } = location.state || {};

  useEffect(() => {
    if (!email || !roomId) return;
    socket.emit("join-room", {roomId,email});

  }, [roomId, email]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100">
      <h2 className="text-4xl font-bold">Room Page</h2>
      <p>Room ID: {roomId}</p>
      <p>Email: {email}</p>
    </div>
  );
};

export default RoomPage;
