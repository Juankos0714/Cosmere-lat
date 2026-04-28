'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { System } from '@/domain/entities/System'
import { useSceneStore } from '@/presentation/stores/sceneStore'
import { hex2rgba } from '@/shared/lib/colors'
import { useState } from 'react'

interface Props {
  systems: System[]
  visible: boolean
}

function MarkerLabel({ sys, onSelect }: { sys: System; onSelect: () => void }) {
  const [hov, setHov] = useState(false)
  const shortName = sys.name.replace('Sistema ', '')

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onSelect}
      style={{ cursor: 'pointer', userSelect: 'none', position: 'relative' }}
    >
      {/* Outer ring */}
      <div style={{
        position: 'absolute',
        width: hov ? 52 : 36, height: hov ? 52 : 36,
        borderRadius: '50%',
        border: `1px solid ${hex2rgba(sys.color, hov ? 0.7 : 0.4)}`,
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        transition: 'all .25s ease',
        boxShadow: `0 0 ${hov ? 24 : 12}px ${hex2rgba(sys.color, hov ? 0.55 : 0.3)}`,
        animation: hov ? 'none' : 'ringPulse 2.5s ease-in-out infinite',
      }} />
      {/* Core dot */}
      <div style={{
        width: hov ? 14 : 10, height: hov ? 14 : 10,
        borderRadius: '50%',
        background: sys.color,
        boxShadow: `0 0 ${hov ? 20 : 10}px ${sys.color}`,
        transition: 'all .22s ease',
        position: 'relative', zIndex: 1,
      }} />
      {/* Label */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 'calc(100% + 14px)',
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        opacity: hov ? 1 : 0.7,
        transition: 'opacity .2s',
        textAlign: 'center',
      }}>
        <div style={{
          color: hov ? sys.color : '#99aabb',
          fontSize: hov ? 12 : 10,
          fontFamily: "'Cinzel', serif",
          fontWeight: 600,
          letterSpacing: '.08em',
          textShadow: '0 0 12px rgba(0,0,0,.8)',
        }}>
          {shortName}
        </div>
        {hov && (
          <div style={{
            color: '#445566', fontSize: 9,
            fontFamily: "'DM Sans', sans-serif",
            marginTop: 3, letterSpacing: '.06em',
          }}>
            {sys.starType}
          </div>
        )}
      </div>
      {/* Tooltip card on hover */}
      {hov && (
        <div style={{
          position: 'absolute',
          left: 'calc(100% + 18px)', top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(6,10,22,.95)',
          border: `1px solid ${hex2rgba(sys.color, 0.35)}`,
          borderLeft: `3px solid ${sys.color}`,
          borderRadius: 8, padding: '10px 14px',
          backdropFilter: 'blur(18px)',
          boxShadow: `0 0 28px ${hex2rgba(sys.color, 0.25)}, 0 6px 24px rgba(0,0,0,.7)`,
          minWidth: 180,
          pointerEvents: 'none', zIndex: 70,
          animation: 'fadeIn .18s ease',
        }}>
          <div style={{ color: sys.color, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', fontFamily: "'Cinzel',serif", marginBottom: 4 }}>{sys.starType}</div>
          <div style={{ color: '#e8e0d0', fontSize: 14, fontFamily: "'Cinzel',serif", fontWeight: 600, marginBottom: 5 }}>{sys.name}</div>
          <div style={{ color: '#556677', fontSize: 10, fontFamily: "'DM Sans',sans-serif", fontStyle: 'italic', lineHeight: 1.4, marginBottom: 6 }}>"{sys.tagline}"</div>
          <div style={{ color: '#446688', fontSize: 9, letterSpacing: '.05em', fontFamily: "'DM Sans',sans-serif" }}>clic para explorar →</div>
        </div>
      )}
    </div>
  )
}

export function SystemMarkers({ systems, visible }: Props) {
  const { requestFlyTo, state } = useSceneStore()
  const groupRef = useRef<THREE.Group>(null)

  if (!visible || state !== 'galaxy') return null

  return (
    <group ref={groupRef}>
      {systems.map(sys => (
        <group
          key={sys.id}
          position={[sys.galacticPos.x, sys.galacticPos.y, sys.galacticPos.z]}
        >
          <Html center zIndexRange={[50, 60]}>
            <MarkerLabel
              sys={sys}
              onSelect={() => {
                requestFlyTo(sys.id, { x: 0, y: 11, z: 17 }, sys.galacticPos)
              }}
            />
          </Html>
        </group>
      ))}
    </group>
  )
}
