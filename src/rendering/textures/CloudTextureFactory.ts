import * as THREE from 'three'
import { fbm, sm } from './NoiseUtils'
import { globalTextureCache } from './TextureCache'

const SIZE = 256

function buildCloudCanvas(seed: number, dark: boolean): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(SIZE, SIZE)
  const d = img.data
  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      const idx = (py * SIZE + px) * 4
      const u = px / SIZE, v = py / SIZE
      const n = fbm(u * 5 + seed, v * 5, 5, seed)
      const cloud = Math.max(0, n - 0.42) / 0.58
      const lat = sm(0, 0.05, v) * sm(1, 0.95, v)
      const a = Math.floor(cloud * lat * (dark ? 160 : 210))
      d[idx] = dark ? 30 : 240
      d[idx + 1] = dark ? 20 : 240
      d[idx + 2] = dark ? 10 : 245
      d[idx + 3] = a
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas
}

export function makeCloudTexture(seed: number, dark = false): THREE.Texture {
  return globalTextureCache.getOrCompute(`cloud-${seed}-${dark}`, () => {
    return new THREE.CanvasTexture(buildCloudCanvas(seed, dark))
  })
}
