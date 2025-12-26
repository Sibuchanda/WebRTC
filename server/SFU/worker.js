import mediasoup from "mediasoup";

let worker;

export const createWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 40000,
    rtcMaxPort: 49999,
  });

  console.log("SFU Worker created");

  worker.on("died", () => {
    console.error("Mediasoup worker died");
    process.exit(1);
  });

  return worker;
};

export const getWorker = () => worker;
