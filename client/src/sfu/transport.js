import { getDevice } from "./device.js";

export const createSendTransport = async (socket, transportParams) => {
  const device = getDevice();

  const transport = device.createSendTransport(transportParams);

  transport.on("connect", ({ dtlsParameters }, callback) => {
    socket.emit("connect-transport", { dtlsParameters }, callback);
  });

  transport.on("produce", ({ kind, rtpParameters }, callback) => {
    socket.emit(
      "produce",
      { kind, rtpParameters },
      ({ id }) => callback({ id })
    );
  });

  return transport;
};
