export const createProducer = async (transport, kind, rtpParameters) => {
  const producer = await transport.produce({
    kind,
    rtpParameters,
  });

  return producer;
};
