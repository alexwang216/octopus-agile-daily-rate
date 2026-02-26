/** Cyan color used for negative (plunge) pricing */
export const NEGATIVE_COLOR = "#06b6d4";

/**
 * Returns a color based on where `value` falls between `min` and `max`.
 * Negative values → cyan. Positive values → green→yellow→red gradient.
 */
export function getRateColor(
  value: number,
  min: number,
  max: number,
): string {
  if (value < 0) return NEGATIVE_COLOR;
  if (max === min) return "#22c55e";
  const ratio = (value - min) / (max - min);
  // Interpolate green (#22c55e) -> yellow (#eab308) -> red (#ef4444)
  if (ratio < 0.5) {
    const t = ratio * 2;
    const r = Math.round(0x22 + (0xea - 0x22) * t);
    const g = Math.round(0xc5 + (0xb3 - 0xc5) * t);
    const b = Math.round(0x5e + (0x08 - 0x5e) * t);
    return `rgb(${r},${g},${b})`;
  } else {
    const t = (ratio - 0.5) * 2;
    const r = Math.round(0xea + (0xef - 0xea) * t);
    const g = Math.round(0xb3 + (0x44 - 0xb3) * t);
    const b = Math.round(0x08 + (0x44 - 0x08) * t);
    return `rgb(${r},${g},${b})`;
  }
}
