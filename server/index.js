import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { initSFU } from "./SFU/index.js";
import { createWebRtcTransport } from "./SFU/transport.js";


const PORT = process.env.PORT || 8001;

dotenv.config();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URI,
    credentials: true,
  },
});

await initSFU();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("create-transport", async (_, callback) => {
    try {
      const { transport, params } = await createWebRtcTransport();
      socket.transport = transport; // storing transport on socket (temporary)
      callback({ success: true, params });
    } catch (err) {
      callback({ success: false });
    }
  });


});

server.listen(process.env.PORT || 8001, () => {
  console.log(`Listening to PORT : ${PORT}`);
});
