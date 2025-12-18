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

app.get('/',(req,res)=>{
    res.send("Hello");
});

io.on('connection',(socket)=>{
    console.log("New connection")
   socket.on("join-room",(data)=>{
     const {email, roomId } = data;
     console.log(`User email : ${email} and Id : ${roomId}`)
     emailToSocketMapping.set(email, socket.id);
     socket.join(roomId);
     socket.broadcast.to(roomId).emit("User-joined", {email});
   })
})

server.listen(PORT,()=>{
    console.log(`Listening to port : ${PORT}`);
})