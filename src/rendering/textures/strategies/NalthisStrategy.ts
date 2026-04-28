import type { PlanetTextureStrategy } from './types'
import { fbm, sm, lerp } from '../NoiseUtils'

export class NalthisStrategy implements PlanetTextureStrategy {
  readonly type = 'nalthis' as const

  generate(seed: number, S: number, d: Uint8ClampedArray): void {
    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        const idx = (py * S + px) * 4
        const u = px / S, v = py / S
        const h = fbm(u * 3.5 + seed, v * 3.5, 5, seed)
        let r: number, g: number, b: number
        if (h < 0.44) {
          const dep = sm(0, 0.44, h)
          r = lerp(20, 60, dep); g = lerp(90, 140, dep); b = lerp(140, 190, dep)
        } else {
          const elev = sm(0.44, 0.82, h)
          const veg = fbm(u * 7 + seed * 2, v * 7, 3, seed + 5)
          r = lerp(170, 220, elev); g = lerp(80, 110, elev); b = lerp(30, 55, elev)
          r = lerp(r, 60, veg * 0.3); g = lerp(g, 130, veg * 0.3); b = lerp(b, 40, veg * 0.25)
        }
        d[idx] = Math.min(255, r); d[idx + 1] = Math.min(255, g); d[idx + 2] = Math.min(255, b); d[idx + 3] = 255
      }
    }
  }
}
