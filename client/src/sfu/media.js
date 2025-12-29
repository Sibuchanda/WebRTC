export const getLocalStream = async () => {
  return await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
};
