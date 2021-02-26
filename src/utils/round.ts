export function roundToPrecision(n: number, decimalPlaces: number): number {
  const x = (10 ** decimalPlaces);
  return Math.round(n * x) / x;
}
