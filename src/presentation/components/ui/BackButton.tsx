'use client'

import { useState } from 'react'
import { useSceneStore } from '@/presentation/stores/sceneStore'
export function BackButton() {
  const [hov, setHov] = useState(false)
  const { state, requestFlyBack } = useSceneStore()
  const visible = state === 'system'

  return (
    <button
      onClick={() => requestFlyBack({ x: 0, y: 11, z: 17 })}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'fixed', top: 24, left: 24, zIndex: 300,
        display: 'flex', alignItems: 'center', gap: 9,
        background: hov ? 'rgba(18,26,50,.98)' : 'rgba(8,12,28,.88)',
        border: '1px solid rgba(100,140,200,.22)',
        borderRadius: 10, padding: '9px 18px',
        cursor: 'pointer',
        color: hov ? '#c8d8f0' : '#7788aa',
        fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
        fontFamily: "'DM Sans',sans-serif",
        backdropFilter: 'blur(18px)',
        boxShadow: hov ? '0 4px 24px rgba(0,0,0,.55),0 0 12px rgba(80,130,255,.12)' : '0 2px 12px rgba(0,0,0,.4)',
        transition: 'all .22s ease',
        transform: visible ? 'translateX(0)' : 'translateX(-130%)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'all' : 'none',
      }}
    >
      <span style={{ fontSize: 15 }}>←</span>
      <span>Galaxia</span>
    </button>
  )
}
