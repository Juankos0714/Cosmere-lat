import type { PlanetTextureStrategy } from './types'
import { fbm, sm, lerp } from '../NoiseUtils'

export class RosharStrategy implements PlanetTextureStrategy {
  readonly type = 'roshar' as const

  generate(seed: number, S: number, d: Uint8ClampedArray): void {
    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        const idx = (py * S + px) * 4
        const u = px / S, v = py / S
        const h = fbm(u * 3.5 + seed, v * 3.5, 6, seed)
        const isLand = h > 0.48
        const pole = sm(0, 0.07, v) + sm(1, 0.93, v)
        let r: number, g: number, b: number
        if (!isLand) {
          const depth = sm(0, 0.48, h)
          r = lerp(10, 40, depth)
          g = lerp(38, 100, depth)
          b = lerp(120, 175, depth)
          if (h > 0.38) { const sh = sm(0.38, 0.48, h); g = lerp(g, g + 20, sh); b = lerp(b, b - 10, sh) }
        } else {
          const elev = sm(0.48, 0.85, h)
          r = lerp(100, 180, elev); g = lerp(88, 155, elev); b = lerp(72, 130, elev)
        }
        if (pole > 0.3) { const t = sm(0.3, 0.9, pole); r = lerp(r, 230, t); g = lerp(g, 238, t); b = lerp(b, 255, t) }
        d[idx] = Math.min(255, r); d[idx + 1] = Math.min(255, g); d[idx + 2] = Math.min(255, b); d[idx + 3] = 255
      }
    }
  }
}
