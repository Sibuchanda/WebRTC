import { createWorker } from "./worker.js";
import { createRouter } from "./router.js";

export const initSFU = async () => {
  await createWorker();
  await createRouter();
};
