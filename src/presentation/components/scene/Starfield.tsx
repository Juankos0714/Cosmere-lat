'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { STAR_VERT, STAR_FRAG } from '@/rendering/shaders/star.glsl'

export function Starfield() {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const starCount = useMemo(() => {
    if (typeof window === 'undefined') return 10_000
    return window.devicePixelRatio > 2 || window.innerWidth < 768 ? 6_000 : 10_000
  }, [])

  const [positions, sizes, brights, colors] = useMemo(() => {
    const pos = new Float32Array(starCount * 3)
    const sz  = new Float32Array(starCount)
    const br  = new Float32Array(starCount)
    const col = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      const r  = 45 + Math.random() * 200
      pos[i * 3]     = r * Math.sin(ph) * Math.cos(th)
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.2
      pos[i * 3 + 2] = r * Math.cos(ph)
      sz[i]  = 0.4 + Math.random() * 2
      br[i]  = 0.3 + Math.random() * 0.7
      const w = Math.random()
      col[i * 3] = 0.82 + w * 0.18; col[i * 3 + 1] = 0.86 + w * 0.08; col[i * 3 + 2] = 1
    }
    return [pos, sz, br, col]
  }, [starCount])

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms['uTime']!.value = clock.getElapsedTime()
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes,     1]} />
        <bufferAttribute attach="attributes-aBright"  args={[brights,   1]} />
        <bufferAttribute attach="attributes-aColor"   args={[colors,    3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={STAR_VERT}
        fragmentShader={STAR_FRAG}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
