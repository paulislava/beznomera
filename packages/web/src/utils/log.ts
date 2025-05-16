const counterId = 99937060;

export const handleEvent = (event: string, userParams?: Record<string, any>) => {
  console.log(`Event goal: ${event}`);
  try {
    ym(counterId, 'reachGoal', event, { defer: true, userParams });
  } catch (error) {
    console.error(error);
  }
};
