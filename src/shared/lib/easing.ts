export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function easeInQuart(t: number): number {
  return t * t * t * t
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5)
}

// Accelerates with inQuart feel then decelerates with outCubic feel
export function easeInQuartOutCubic(t: number): number {
  return t < 0.5
    ? 8 * t * t * t * t
    : 1 - 4 * Math.pow(1 - t, 3)
}
