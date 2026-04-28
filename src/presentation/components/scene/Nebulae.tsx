'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

const CONFIGS = [
  { p: [-22, 3, -35] as const, s: 55, c: 0x1a0f55, o: 0.22 },
  { p: [28, -6, -25] as const, s: 48, c: 0x2a0520, o: 0.18 },
  { p: [-12, 4, 22]  as const, s: 52, c: 0x051828, o: 0.20 },
  { p: [8, -3, -55]  as const, s: 70, c: 0x100838, o: 0.15 },
  { p: [0, 6, -8]    as const, s: 65, c: 0x0d1530, o: 0.12 },
]

export function Nebulae() {
  const meshes = useMemo(() => {
    return CONFIGS.flatMap((cfg, ci) =>
      Array.from({ length: 5 }, (_, i) => ({
        key: `${ci}-${i}`,
        position: [
          cfg.p[0] + (Math.random() - 0.5) * 18,
          cfg.p[1] + (Math.random() - 0.5) * 10,
          cfg.p[2] + (Math.random() - 0.5) * 12,
        ] as [number, number, number],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
        width:  cfg.s + Math.random() * 25,
        height: cfg.s * 0.65 + Math.random() * 18,
        color: cfg.c,
        opacity: cfg.o * (0.5 + Math.random() * 0.5),
      })),
    )
  }, [])

  return (
    <group>
      {meshes.map(m => (
        <mesh key={m.key} position={m.position} rotation={m.rotation}>
          <planeGeometry args={[m.width, m.height]} />
          <meshBasicMaterial
            color={m.color}
            transparent
            opacity={m.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
