export const processImage = async (data) => {
  console.log(`[Image] Resizing image ${data.imageId} to ${data.width}x${data.height}...`);
  // Simulate CPU-intensive delay
  await new Promise((resolve) => setTimeout(resolve, 2500));
  console.log(`[Image] Resize complete`);

  return {
    newUrl: `https://mock-storage.com/images/resized-${data.imageId}.png`,
  };
};
