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

export const produceMedia = async (transport, stream) => {
  const audioTrack = stream.getAudioTracks()[0];
  const videoTrack = stream.getVideoTracks()[0];

  if (audioTrack) {
    await transport.produce({ track: audioTrack });
  }

  if (videoTrack) {
    await transport.produce({ track: videoTrack });
  }
};
