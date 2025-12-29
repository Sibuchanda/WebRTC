import { useEffect, useRef, useState } from "react";
import socket from "../config/socket";

import { createDevice } from "../sfu/device";
import { getLocalStream } from "../sfu/media";
import { createSendTransport, produceMedia } from "../sfu/transport";

const RoomPage = () => {
  const localVideoRef = useRef(null);
  const [sendTransport, setSendTransport] = useState(null);

 
  useEffect(() => {
    const initSFU = async () => {
      const rtpCapabilities = await new Promise((resolve) => {
        socket.emit("get-rtp-capabilities", resolve);
      });

      await createDevice(rtpCapabilities);
      const transportParams = await new Promise((resolve) => {
        socket.emit(
          "create-transport",
          null,
          ({ params }) => resolve(params)
        );
      });
      const transport = await createSendTransport(socket, transportParams);
      setSendTransport(transport);
    };

    initSFU();
  }, []);


  useEffect(() => {
    if (!sendTransport) return;

    const startMedia = async () => {
      const stream = await getLocalStream();
      localVideoRef.current.srcObject = stream;
      await produceMedia(sendTransport, stream);
    };
    startMedia();
  }, [sendTransport]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-contain max-w-300 rounded-md"
        />
      </div>
    </div>
  );
};

export default RoomPage;
