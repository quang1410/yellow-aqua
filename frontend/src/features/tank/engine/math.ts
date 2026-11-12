/** Kẹp `x` vào [min, max]; giá trị không hữu hạn (NaN, Infinity) thì dùng `fallback`. */
export function clampOr(x: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(x)) return fallback
  return Math.min(max, Math.max(min, x))
}
