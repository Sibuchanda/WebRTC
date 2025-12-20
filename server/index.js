import express from 'express'
import dotevn from 'dotenv';
dotevn.config();
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';

const PORT = process.env.PORT || 8001;
const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URI,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

app.get('/',(req,res)=>{
    res.send("Hello");
});

io.on('connection',(socket)=>{

   socket.on("join-room",(data)=>{
     const {email, roomId } = data;
    //  console.log(`User email : ${email} and Id : ${roomId}`);
     emailToSocketMapping.set(email, socket.id);
     socketToEmailMapping.set(socket.id, email);
     socket.join(roomId);
     socket.emit("joined-room", {roomId});
     socket.broadcast.to(roomId).emit("user-joined", {email});
   });

   socket.on("call-user", (data)=>{
      const {email, offer} = data;
      const fromEmail = socketToEmailMapping.get(socket.id);
      const socketId = emailToSocketMapping.get(email);
      socket.to(socketId).emit("Incomming-call", {from: fromEmail, offer });
   });

   socket.on("call-accepted", (data)=>{
     const {email, ans} = data;
     const socketId = emailToSocketMapping.get(email);
     socket.to(socketId).emit("call-accepted", {ans});

   })
})

server.listen(PORT,()=>{
    console.log(`Listening to port : ${PORT}`);
})