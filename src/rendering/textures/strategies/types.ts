import type { PlanetType } from '@/domain/entities/System'

export interface PlanetTextureStrategy {
  readonly type: PlanetType
  generate(seed: number, S: number, d: Uint8ClampedArray): void
}
