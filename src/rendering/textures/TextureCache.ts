import * as THREE from 'three'

export class TextureCache {
  private readonly cache = new Map<string, THREE.Texture>()
  private readonly maxSize: number

  constructor(maxSize = 32) {
    this.maxSize = maxSize
  }

  getOrCompute(key: string, compute: () => THREE.Texture): THREE.Texture {
    const cached = this.cache.get(key)
    if (cached) return cached

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as string
      this.cache.get(firstKey)?.dispose()
      this.cache.delete(firstKey)
    }

    const texture = compute()
    this.cache.set(key, texture)
    return texture
  }

  dispose(): void {
    this.cache.forEach(t => t.dispose())
    this.cache.clear()
  }
}

export const globalTextureCache = new TextureCache(64)
