import type { PlanetTextureStrategy } from './types'
import { fbm, sm, lerp, noise2 } from '../NoiseUtils'

export class CanticleStrategy implements PlanetTextureStrategy {
  readonly type = 'canticle' as const

  generate(seed: number, S: number, d: Uint8ClampedArray): void {
    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        const idx = (py * S + px) * 4
        const u = px / S, v = py / S
        const h = fbm(u * 4 + seed, v * 4, 5, seed)
        const rock = fbm(u * 9 + seed * 4, v * 9, 3, seed + 6)
        let r = lerp(220, 255, h), g = lerp(190, 235, h), b = lerp(140, 190, h)
        if (rock > 0.58) { const t = sm(0.58, 0.78, rock); r = lerp(r, 200, t); g = lerp(g, 100, t); b = lerp(b, 60, t) }
        const crystal = noise2(u * 22, v * 22, seed + 8)
        if (crystal > 0.88) { const t = sm(0.88, 0.96, crystal); r = Math.min(255, lerp(r, 255, t)); g = lerp(g, 80, t * 0.8); b = lerp(b, 0, t) }
        const cx = u - 0.5, cy = v - 0.5, cd = Math.sqrt(cx * cx + cy * cy)
        const bloom = sm(0.5, 0, cd) * 0.12
        r = Math.min(255, r + bloom * 50); g = Math.min(255, g + bloom * 30)
        d[idx] = Math.min(255, r); d[idx + 1] = Math.min(255, g); d[idx + 2] = Math.min(255, b); d[idx + 3] = 255
      }
    }
  }
}
