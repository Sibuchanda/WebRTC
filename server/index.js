import express from "express";
import dotevn from "dotenv";
dotevn.config();
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

const PORT = process.env.PORT || 8001;
const app = express();
const server = createServer(app);

const emailToSockerMapping = new Map();
const socketToEmailMapping = new Map();

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URI,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {

  socket.on("join-room", ({ roomId, email }) => {
    emailToSockerMapping.set(email, socket.id);
    socketToEmailMapping.set(socket.id, email);

    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-joined", { email });
  });

  socket.on("call-user", ({ email, offer }) => {
    const fromEmail = socketToEmailMapping.get(socket.id); // Sender
    const targetSocketId = emailToSockerMapping.get(email); // Receiver's SocketID

    if (!targetSocketId) return;
    socket.to(targetSocketId).emit("incoming-call", { from: fromEmail, offer });
  });

  socket.on("call-accepted", ({ email, answer }) => {
    const targetSocketId = emailToSockerMapping.get(email);
    if (!targetSocketId) return;
    socket.to(targetSocketId).emit("call-accepted", { answer });
  });

  socket.on("ice-candidate", ({ email, candidate }) => {
  const targetSocketId = emailToSockerMapping.get(email);
  if (!targetSocketId) return;
  socket.to(targetSocketId).emit("ice-candidate", { candidate });
});

});

server.listen(PORT, () => {
  console.log(`Listening to port : ${PORT}`);
});
