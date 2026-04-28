import type { PlanetTextureStrategy } from './types'
import { fbm, sm, lerp, noise2 } from '../NoiseUtils'

export class TaldainStrategy implements PlanetTextureStrategy {
  readonly type = 'taldain' as const

  generate(seed: number, S: number, d: Uint8ClampedArray): void {
    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        const idx = (py * S + px) * 4
        const u = px / S, v = py / S
        const dayFactor = sm(0.45, 0.55, u)
        const h = fbm(u * 5 + seed, v * 5, 5, seed)
        const sandR = lerp(220, 255, h), sandG = lerp(195, 230, h), sandB = lerp(130, 170, h)
        const nightR = lerp(5, 15, h), nightG = lerp(5, 12, h), nightB = lerp(8, 18, h)
        const termDist = Math.abs(u - 0.5)
        const termGlow = sm(0.08, 0, termDist)
        let r = lerp(sandR, nightR, dayFactor), g = lerp(sandG, nightG, dayFactor), b = lerp(sandB, nightB, dayFactor)
        r = lerp(r, 230, termGlow * 0.8); g = lerp(g, 140, termGlow * 0.8); b = lerp(b, 40, termGlow * 0.6)
        if (u < 0.48) { const dune = sm(0.6, 1, fbm(u * 12, v * 12, 2, seed + 9)) * 0.12 * (1 - dayFactor); r = Math.min(255, r + dune * 40); g = Math.min(255, g + dune * 30) }
        d[idx] = Math.min(255, r); d[idx + 1] = Math.min(255, g); d[idx + 2] = Math.min(255, b); d[idx + 3] = 255
      }
    }
  }
}
