import type { PlanetTextureStrategy } from './types'
import { fbm, lerp } from '../NoiseUtils'

export class GasStrategy implements PlanetTextureStrategy {
  readonly type = 'gas' as const

  generate(seed: number, S: number, d: Uint8ClampedArray): void {
    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        const idx = (py * S + px) * 4
        const u = px / S, v = py / S
        const h = fbm(u * 3 + seed, v * 12, 4, seed)
        d[idx] = Math.min(255, lerp(160, 210, h))
        d[idx + 1] = Math.min(255, lerp(130, 180, h))
        d[idx + 2] = Math.min(255, lerp(60, 100, h))
        d[idx + 3] = 255
      }
    }
  }
}
