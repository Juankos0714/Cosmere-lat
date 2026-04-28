import type { PlanetTextureStrategy } from './types'
import { fbm, sm, lerp, noise2 } from '../NoiseUtils'

export class SelStrategy implements PlanetTextureStrategy {
  readonly type = 'sel' as const

  generate(seed: number, S: number, d: Uint8ClampedArray): void {
    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        const idx = (py * S + px) * 4
        const u = px / S, v = py / S
        const h = fbm(u * 3 + seed, v * 3, 6, seed)
        let r: number, g: number, b: number
        if (h < 0.45) {
          const dep = sm(0, 0.45, h)
          r = lerp(15, 40, dep); g = lerp(60, 120, dep); b = lerp(130, 180, dep)
        } else {
          const elev = sm(0.45, 0.85, h)
          r = lerp(55, 130, elev); g = lerp(110, 160, elev); b = lerp(40, 80, elev)
        }
        const ex = Math.abs(u - 0.62), ey = Math.abs(v - 0.38)
        const eDist = Math.sqrt(ex * ex + ey * ey)
        if (eDist < 0.06) { const t = sm(0.06, 0.01, eDist) * 0.4; r = lerp(r, 220, t); g = lerp(g, 200, t); b = lerp(b, 180, t) }
        d[idx] = Math.min(255, r); d[idx + 1] = Math.min(255, g); d[idx + 2] = Math.min(255, b); d[idx + 3] = 255
      }
    }
  }
}
