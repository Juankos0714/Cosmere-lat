'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Starfield } from './Starfield'
import { Nebulae } from './Nebulae'
import { SystemMarkers } from './SystemMarkers'
import { PlanetarySystem } from './PlanetarySystem'
import { CameraRig } from './CameraRig'
import { useSceneStore } from '@/presentation/stores/sceneStore'
import { useUIStore } from '@/presentation/stores/uiStore'
import { systemService } from '@/data/container'
import type { System } from '@/domain/entities/System'
import type { Planet } from '@/domain/entities/Planet'

export default function CosmereScene() {
  const [systems, setSystems] = useState<System[]>([])
  const [planets, setPlanets] = useState<Map<string, Planet[]>>(new Map())
  const sceneState    = useSceneStore(s => s.state)
  const activeSystemId = useSceneStore(s => s.activeSystemId)
  const { setLoadingDone } = useUIStore()

  useEffect(() => {
    systemService.getAllSystems().then(async (sysList) => {
      setSystems(sysList)
      const map = new Map<string, Planet[]>()
      await Promise.all(
        sysList.map(async sys => {
          const p = await systemService.getSystemDetail(sys.id)
          if (p) map.set(sys.id, p.planets)
        }),
      )
      setPlanets(map)
      setTimeout(setLoadingDone, 400)
    })
  }, [setLoadingDone])

  const activeSystem = systems.find(s => s.id === activeSystemId)

  return (
    <Canvas
      camera={{ position: [0, 11, 17], fov: 60, near: 0.01, far: 600 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x010306, 1)
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
    >
      <fog attach="fog" args={[0x010306, 60, 400]} />
      <ambientLight intensity={2.5} color={0x111827} />
      <directionalLight position={[5, 3, 5]} intensity={3.5} />

      <Starfield />
      <Nebulae />
      <CameraRig />

      <SystemMarkers
        systems={systems}
        visible={sceneState === 'galaxy'}
      />

      {activeSystem && (
        <PlanetarySystem
          system={activeSystem}
          planets={planets.get(activeSystem.id) ?? []}
          visible={sceneState === 'system'}
        />
      )}
    </Canvas>
  )
}
