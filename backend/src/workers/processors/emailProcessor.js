export const processEmail = async (data) => {
  console.log(`[Email] Sending email to ${data.to}...`);
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(`[Email] Sent successfully to ${data.to}`);

  return {
    deliveredAt: new Date().toISOString(),
    messageId: `mock-id-${Math.floor(Math.random() * 10000)}`,
  };
};
