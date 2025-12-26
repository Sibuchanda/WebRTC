import { getWorker } from "./worker.js";

let router;

const mediaCodecs = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
    parameters: {},
  },
];

export const createRouter = async () => {
  const worker = getWorker();
  router = await worker.createRouter({ mediaCodecs });

  console.log("SFU Router created");
  return router;
};

export const getRouter = () => router;
