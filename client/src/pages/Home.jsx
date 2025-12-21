import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../config/socket";

const Home = () => {
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to backend:", socket.id);
    });
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!email || !roomId) return;
    navigate(`/room/${roomId}`, { state: {email} });
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Join a Room
        </h2>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Room ID
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="Enter roomID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 text-sm font-medium text-white bg-gray-900 rounded hover:bg-gray-800 transition cursor-pointer"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;