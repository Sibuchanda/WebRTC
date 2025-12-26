import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { initSFU } from "./SFU/index.js";

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
});

server.listen(process.env.PORT || 8001, () => {
  console.log(`Listening to PORT : ${PORT}`);
});
