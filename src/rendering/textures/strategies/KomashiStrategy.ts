import type { PlanetTextureStrategy } from './types'
import { fbm, sm, lerp, noise2 } from '../NoiseUtils'

export class KomashiStrategy implements PlanetTextureStrategy {
  readonly type = 'komashi' as const

  generate(seed: number, S: number, d: Uint8ClampedArray): void {
    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        const idx = (py * S + px) * 4
        const u = px / S, v = py / S
        const h = fbm(u * 5 + seed, v * 5, 6, seed)
        const lava = fbm(u * 8 + seed * 2, v * 8, 4, seed + 3)
        let r = lerp(12, 40, h), g = lerp(8, 25, h), b = lerp(10, 20, h)
        if (lava > 0.6) { const t = sm(0.6, 0.82, lava); r = lerp(r, 255, t); g = lerp(g, 100, t * 0.6); b = lerp(b, 20, t * 0.3) }
        const spirit = noise2(u * 15, v * 15, seed + 7)
        if (spirit > 0.82) { const t = sm(0.82, 0.95, spirit); r = lerp(r, 230, t); g = lerp(g, 180, t * 0.8); b = lerp(b, 255, t * 0.6) }
        d[idx] = Math.min(255, r); d[idx + 1] = Math.min(255, g); d[idx + 2] = Math.min(255, b); d[idx + 3] = 255
      }
    }
  }
}
