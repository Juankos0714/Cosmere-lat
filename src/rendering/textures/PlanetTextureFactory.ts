import * as THREE from 'three'
import type { PlanetType } from '@/domain/entities/System'
import type { PlanetTextureStrategy } from './strategies/types'
import { RosharStrategy } from './strategies/RosharStrategy'
import { ScadrialStrategy } from './strategies/ScadrialStrategy'
import { SelStrategy } from './strategies/SelStrategy'
import { NalthisStrategy } from './strategies/NalthisStrategy'
import { TaldainStrategy } from './strategies/TaldainStrategy'
import { LumarStrategy } from './strategies/LumarStrategy'
import { KomashiStrategy } from './strategies/KomashiStrategy'
import { CanticleStrategy } from './strategies/CanticleStrategy'
import { GasStrategy } from './strategies/GasStrategy'
import { HellworldStrategy } from './strategies/HellworldStrategy'
import { globalTextureCache } from './TextureCache'

const SIZE = 256

class PlanetTextureFactory {
  private readonly strategies = new Map<PlanetType, PlanetTextureStrategy>()

  constructor() {
    const all: PlanetTextureStrategy[] = [
      new RosharStrategy(), new ScadrialStrategy(), new SelStrategy(),
      new NalthisStrategy(), new TaldainStrategy(), new LumarStrategy(),
      new KomashiStrategy(), new CanticleStrategy(), new GasStrategy(),
      new HellworldStrategy(),
    ]
    all.forEach(s => this.strategies.set(s.type, s))
  }

  create(type: PlanetType, seed: number): THREE.Texture {
    return globalTextureCache.getOrCompute(`planet-${type}-${seed}`, () => {
      const strategy = this.strategies.get(type)
      if (!strategy) throw new Error(`Unknown planet type: ${type}`)

      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = SIZE
      const ctx = canvas.getContext('2d')!
      const img = ctx.createImageData(SIZE, SIZE)
      strategy.generate(seed, SIZE, img.data)
      ctx.putImageData(img, 0, 0)

      // Specular highlight
      const rg = ctx.createRadialGradient(SIZE * 0.38, SIZE * 0.3, 0, SIZE * 0.38, SIZE * 0.3, SIZE * 0.6)
      rg.addColorStop(0, 'rgba(255,255,255,0.12)')
      rg.addColorStop(0.5, 'rgba(255,255,255,0.04)')
      rg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = rg
      ctx.fillRect(0, 0, SIZE, SIZE)

      return new THREE.CanvasTexture(canvas)
    })
  }
}

export const planetTextureFactory = new PlanetTextureFactory()
