import type { PlanetTextureStrategy } from './types'
import { fbm, sm, lerp } from '../NoiseUtils'

export class HellworldStrategy implements PlanetTextureStrategy {
  readonly type = 'hellworld' as const

  generate(seed: number, S: number, d: Uint8ClampedArray): void {
    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        const idx = (py * S + px) * 4
        const u = px / S, v = py / S
        const h = fbm(u * 5 + seed, v * 5, 6, seed)
        const crack = fbm(u * 12 + seed * 2, v * 12, 3, seed + 4)
        let r = lerp(80, 160, h), g = lerp(8, 30, h), b = lerp(8, 25, h)
        if (crack > 0.65) { const t = sm(0.65, 0.8, crack); r = lerp(r, 220, t); g = lerp(g, 60, t); b = lerp(b, 0, t * 0.5) }
        d[idx] = Math.min(255, r); d[idx + 1] = Math.min(255, g); d[idx + 2] = Math.min(255, b); d[idx + 3] = 255
      }
    }
  }
}
