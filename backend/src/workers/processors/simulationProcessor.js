export const processSimulation = async (data) => {
  console.log(`[Simulation] Starting simulation task (will fail: ${!!data.shouldFail})...`);

  const delay = data.delay || 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (data.shouldFail) {
    throw new Error(data.errorMessage || 'Simulated random failure occurred!');
  }

  console.log(`[Simulation] Task completed successfully`);
  return {
    status: 'Success',
    simulatedDelay: delay,
  };
};
