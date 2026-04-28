'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { LoadingScreen } from '@/presentation/components/ui/LoadingScreen'
import { GalaxyHeader } from '@/presentation/components/ui/GalaxyHeader'
import { BackButton } from '@/presentation/components/ui/BackButton'
import { SystemPanel } from '@/presentation/components/ui/SystemPanel'
import { GalaxyMarkersOverlay } from '@/presentation/components/ui/GalaxyMarkersOverlay'
import { useSceneStore } from '@/presentation/stores/sceneStore'
import { useUIStore } from '@/presentation/stores/uiStore'
import { systemService } from '@/data/container'
import type { System } from '@/domain/entities/System'
import type { Planet } from '@/domain/entities/Planet'
import type { Book } from '@/domain/entities/Book'
import type { ShardConnection } from '@/domain/entities/ShardConnection'

const CosmereCanvas = dynamic(
  () => import('@/presentation/components/scene/CosmereScene'),
  { ssr: false },
)

function GalaxyHint() {
  const done    = useUIStore(s => s.loadingDone)
  const visible = useSceneStore(s => s.state === 'galaxy') && done
  return (
    <div style={{
      position: 'fixed', bottom: 36, left: '50%', transform: 'translateX(-50%)',
      zIndex: 50, pointerEvents: 'none',
      opacity: visible ? 0.55 : 0, transition: 'opacity .7s ease',
      textAlign: 'center',
    }}>
      <div style={{ color: '#556677', fontSize: 11, letterSpacing: '.1em', fontFamily: "'DM Sans',sans-serif" }}>
        Pasa el cursor sobre un sistema · Clic para explorar
      </div>
    </div>
  )
}

interface SystemData {
  system: System
  planets: Planet[]
  books: Book[]
  connections: ShardConnection[]
  novellas: string[]
}

export default function GalaxyPage() {
  const activeSystemId = useSceneStore(s => s.activeSystemId)
  const requestFlyBack = useSceneStore(s => s.requestFlyBack)
  const [allSystems, setAllSystems] = useState<System[]>([])
  const [systemData, setSystemData] = useState<SystemData | null>(null)

  useEffect(() => {
    systemService.getAllSystems().then(setAllSystems)
  }, [])

  useEffect(() => {
    if (!activeSystemId) { setSystemData(null); return }
    systemService.getSystemDetail(activeSystemId).then(detail => {
      if (!detail) return
      setSystemData(detail)
    })
  }, [activeSystemId])

  const activeSystem = allSystems.find(s => s.id === activeSystemId) ?? null

  return (
    <>
      <CosmereCanvas />

      {/* Fixed UI overlay */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        <LoadingScreen />
        <GalaxyHeader />
        <GalaxyHint />
        <GalaxyMarkersOverlay systems={allSystems} />
        <BackButton />
        <SystemPanel
          system={activeSystem}
          planets={systemData?.planets ?? []}
          books={systemData?.books ?? []}
          connections={systemData?.connections ?? []}
          novellas={systemData?.novellas ?? []}
          allSystems={allSystems}
          onClose={() => requestFlyBack({ x: 0, y: 11, z: 17 })}
        />
      </div>
    </>
  )
}
