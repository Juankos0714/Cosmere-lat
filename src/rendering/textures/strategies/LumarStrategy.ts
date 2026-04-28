import type { PlanetTextureStrategy } from './types'
import { fbm, sm, lerp, noise2 } from '../NoiseUtils'

export class LumarStrategy implements PlanetTextureStrategy {
  readonly type = 'lumar' as const

  generate(seed: number, S: number, d: Uint8ClampedArray): void {
    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        const idx = (py * S + px) * 4
        const u = px / S, v = py / S
        const h = fbm(u * 4 + seed, v * 4, 6, seed)
        const sporeType = fbm(u * 2 + seed * 3, v * 2, 3, seed + 11)
        let r: number, g: number, b: number
        if (h < 0.52) {
          if (sporeType < 0.33) { r = lerp(10, 40, h); g = lerp(80, 150, h); b = lerp(40, 90, h) }
          else if (sporeType < 0.66) { r = lerp(100, 170, h); g = lerp(10, 35, h); b = lerp(20, 50, h) }
          else { r = lerp(30, 70, h); g = lerp(20, 55, h); b = lerp(120, 180, h) }
          const shimmer = noise2(u * 20, v * 20, seed) * 0.15
          r = Math.min(255, r + shimmer * 60); g = Math.min(255, g + shimmer * 80); b = Math.min(255, b + shimmer * 100)
        } else {
          const elev = sm(0.52, 0.85, h)
          r = lerp(55, 90, elev); g = lerp(48, 75, elev); b = lerp(62, 95, elev)
        }
        d[idx] = Math.min(255, r); d[idx + 1] = Math.min(255, g); d[idx + 2] = Math.min(255, b); d[idx + 3] = 255
      }
    }
  }
}
