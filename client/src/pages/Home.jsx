import React from "react";
import socket from "../config/socket";

const Home = () => {

  socket.emit("join-room", {
    email: "lester@gmail.com",
    roomId: '1'
  })

 const handleFormSubmit = ()=>{

 }

  return (
    <>
      <div className="min-h-screen w-screen bg-gray-300 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-screen h-60">
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 w-md">
            <input type="email" placeholder="Enter your email" className="w-full p-2 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
            <input type="text" placeholder="Enter room code" className="w-full p-2 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"/>
            <button className="w-full p-2 cursor-pointer rounded-xl font-semibold bg-blue-400 text-white">Enter Room</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Home;
