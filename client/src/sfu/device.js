import * as mediasoupClient from "mediasoup-client";

let device;

export const createDevice = async (routerRtpCapabilities) => {
  device = new mediasoupClient.Device();
  await device.load({ routerRtpCapabilities });
  return device;
};

export const getDevice = () => device;
