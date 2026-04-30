'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUIStore } from '@/presentation/stores/uiStore'

export function HyperframesIntro() {
  const introOpen  = useUIStore(s => s.introOpen)
  const closeIntro = useUIStore(s => s.closeIntro)

  const [fading,   setFading]   = useState(false)
  const [showSkip, setShowSkip] = useState(false)
  const [scale,    setScale]    = useState(1)

  useEffect(() => {
    function update() {
      setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const handleDone = useCallback(() => {
    setFading(true)
    setTimeout(closeIntro, 850)
  }, [closeIntro])

  useEffect(() => {
    if (!introOpen) {
      setFading(false)
      setShowSkip(false)
      return
    }
    const skipTimer = setTimeout(() => setShowSkip(true), 2200)
    const autoTimer = setTimeout(handleDone, 47000)

    function onMsg(e: MessageEvent) {
      if (e.data?.type === 'hyperframes:complete') handleDone()
    }
    window.addEventListener('message', onMsg)

    return () => {
      clearTimeout(skipTimer)
      clearTimeout(autoTimer)
      window.removeEventListener('message', onMsg)
    }
  }, [introOpen, handleDone])

  if (!introOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#010306',
        opacity: fading ? 0 : 1,
        transition: 'opacity .85s ease',
        overflow: 'hidden',
      }}
    >
      {/* Scale the fixed 1920x1080 composition to fill any viewport */}
      <div
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 1920, height: 1080,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <iframe
          src="/hyperframes/index.html"
          style={{ width: 1920, height: 1080, border: 'none', display: 'block' }}
          title="Cosmere Atlas — Intro"
        />
      </div>

      {showSkip && (
        <button
          onClick={handleDone}
          style={{
            position: 'absolute', bottom: 32, right: 40,
            zIndex: 10,
            background: 'rgba(1,3,6,.72)',
            border: '1px solid rgba(200,184,128,.22)',
            color: 'rgba(200,184,128,.62)',
            fontSize: 10, letterSpacing: '.2em',
            fontFamily: "'DM Sans',sans-serif",
            textTransform: 'uppercase',
            padding: '8px 20px', borderRadius: 3,
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'color .2s, border-color .2s',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget
            b.style.color = 'rgba(200,184,128,.9)'
            b.style.borderColor = 'rgba(200,184,128,.45)'
          }}
          onMouseLeave={e => {
            const b = e.currentTarget
            b.style.color = 'rgba(200,184,128,.62)'
            b.style.borderColor = 'rgba(200,184,128,.22)'
          }}
        >
          Omitir intro &rarr;
        </button>
      )}
    </div>
  )
}
