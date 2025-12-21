import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URI,{
    withCredentials: true,
});


export default socket;