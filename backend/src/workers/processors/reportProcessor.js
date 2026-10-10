export const processReport = async (data) => {
  console.log(
    `[Report] Generating ${data.format || 'pdf'} report for ${data.month || 'current month'}...`
  );
  // Simulate heavy processing delay
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log(`[Report] Generation complete`);

  return {
    fileUrl: `https://mock-storage.com/reports/${data.month || 'report'}.${data.format || 'pdf'}`,
  };
};
