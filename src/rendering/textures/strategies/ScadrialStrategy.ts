import type { PlanetTextureStrategy } from './types'
import { fbm, sm, lerp } from '../NoiseUtils'

export class ScadrialStrategy implements PlanetTextureStrategy {
  readonly type = 'scadrial' as const

  generate(seed: number, S: number, d: Uint8ClampedArray): void {
    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        const idx = (py * S + px) * 4
        const u = px / S, v = py / S
        const h = fbm(u * 4 + seed, v * 4, 5, seed)
        const ash = fbm(u * 8 + seed * 3, v * 8, 3, seed)
        let r = lerp(55, 100, h), g = lerp(42, 78, h), b = lerp(28, 55, h)
        r = lerp(r, 25, ash * 0.4); g = lerp(g, 18, ash * 0.4); b = lerp(g, 12, ash * 0.4)
        if (ash > 0.68) { const t = sm(0.68, 0.78, ash) * 0.6; r = lerp(r, 160, t); g = lerp(g, 130, t); b = lerp(b, 80, t) }
        d[idx] = Math.min(255, r); d[idx + 1] = Math.min(255, g); d[idx + 2] = Math.min(255, b); d[idx + 3] = 255
      }
    }
  }
}
