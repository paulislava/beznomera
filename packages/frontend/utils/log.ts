const counterId = 99937060;

export const handleEvent = (event: string, userParams?: Record<string, any>) => {
  ym(counterId, 'reachGoal', event, { defer: true, userParams });
};
