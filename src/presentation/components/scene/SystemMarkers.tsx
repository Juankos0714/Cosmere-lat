'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { System } from '@/domain/entities/System'
import { useSceneStore } from '@/presentation/stores/sceneStore'
import type { MarkerPosition } from '@/presentation/stores/sceneStore'

interface Props {
  systems: System[]
  visible: boolean
}

const _v = new THREE.Vector3()

export function SystemMarkers({ systems, visible }: Props) {
  const setMarkerPositions = useSceneStore(s => s.setMarkerPositions)
  const { camera, size } = useThree()
  const tick = useRef(0)

  useFrame(() => {
    tick.current++
    if (tick.current % 3 !== 0) return

    if (!visible) {
      setMarkerPositions([])
      return
    }

    const positions: MarkerPosition[] = systems.map(sys => {
      _v.set(sys.galacticPos.x, sys.galacticPos.y, sys.galacticPos.z)
      _v.project(camera)
      const behind = _v.z > 1
      const x = (_v.x + 1) / 2 * size.width
      const y = (-_v.y + 1) / 2 * size.height
      return { id: sys.id as string, x, y, behind }
    })

    setMarkerPositions(positions)
  })

  return null
}
