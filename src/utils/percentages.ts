export function getChangedPercentage(before: number, after: number): number {
  if (before === 0) {
    return 0;
  }

  const percentage = ((after - before) / before) * 100;
  return percentage;
}
