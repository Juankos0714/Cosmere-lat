export function hash2(x: number, y: number, s = 0): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.3) * 43758.5453
  return n - Math.floor(n)
}

export function noise2(x: number, y: number, s = 0): number {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy)
  return (
    hash2(ix, iy, s) * (1 - ux) * (1 - uy) +
    hash2(ix + 1, iy, s) * ux * (1 - uy) +
    hash2(ix, iy + 1, s) * (1 - ux) * uy +
    hash2(ix + 1, iy + 1, s) * ux * uy
  )
}

export function fbm(x: number, y: number, octaves = 6, s = 0): number {
  let v = 0, a = 0.5, f = 1
  for (let i = 0; i < octaves; i++) {
    v += a * noise2(x * f, y * f, s)
    a *= 0.5
    f *= 2.08
  }
  return v
}

export const sm = (lo: number, hi: number, x: number): number =>
  Math.max(0, Math.min(1, (x - lo) / (hi - lo)))

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
