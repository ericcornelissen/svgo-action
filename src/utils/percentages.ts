export function toPercentage(decimal: number): number {
  return Math.round(decimal * 10000) / 100;
}
