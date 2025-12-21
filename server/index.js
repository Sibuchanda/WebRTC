import express from 'express'
import dotevn from 'dotenv';
dotevn.config();
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';

const PORT = process.env.PORT || 8001;
const app = express();
const server = createServer(app);

const emailToSockerMapping = new Map();
const socketToEmailMapping = new Map();

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URI,
    methods: ["GET", "POST"],
    credentials: true
  }
});


io.on('connection',(socket)=>{
     socket.on("join-room", ({roomId, email})=>{
      emailToSockerMapping.set(email, socket.id);
      socketToEmailMapping.set(socket.id, email);
      
      socket.join(roomId);
      console.log(`User ${email} joined room no : ${roomId}`);
      socket.broadcast.to(roomId).emit("user-joined", {email});
     })
})

server.listen(PORT,()=>{
    console.log(`Listening to port : ${PORT}`);
})