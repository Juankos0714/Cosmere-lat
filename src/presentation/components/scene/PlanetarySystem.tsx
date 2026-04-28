'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { System } from '@/domain/entities/System'
import type { Planet } from '@/domain/entities/Planet'
import { Planet as PlanetMesh } from './Planet'

interface Props {
  system: System
  planets: Planet[]
  visible: boolean
}

export function PlanetarySystem({ system: sys, planets, visible }: Props) {
  const sysSeed = useMemo(
    () => sys.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0),
    [sys.id],
  )

  if (!visible) return null

  return (
    <group position={[sys.galacticPos.x, sys.galacticPos.y, sys.galacticPos.z]}>
      {/* Central star */}
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color={sys.glowHex} />
      </mesh>
      {/* Star glow halo */}
      <mesh>
        <sphereGeometry args={[0.92, 32, 32]} />
        <meshBasicMaterial
          color={sys.glowHex}
          transparent opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {planets.map((planet, i) => (
        <PlanetMesh
          key={planet.id}
          planet={planet}
          systemSeed={sysSeed}
          planetIndex={i}
        />
      ))}
    </group>
  )
}
