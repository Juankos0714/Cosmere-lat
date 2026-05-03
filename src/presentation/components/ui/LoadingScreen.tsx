'use client'

import { useUIStore } from '@/presentation/stores/uiStore'
import { useEffect, useRef, useState } from 'react'

export function LoadingScreen() {
  const done = useUIStore(s => s.loadingDone)

  const [showAuthor, setShowAuthor] = useState(false)
  const [showTitle,  setShowTitle]  = useState(false)
  const [showBar,    setShowBar]    = useState(false)
  const [progress,   setProgress]   = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const t1 = setTimeout(() => setShowAuthor(true), 100)
    const t2 = setTimeout(() => setShowTitle(true),  400)
    const t3 = setTimeout(() => setShowBar(true),    900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  useEffect(() => {
    if (!showBar) return
    let start: number | null = null
    function tick(ts: number) {
      if (start === null) start = ts
      const elapsed = (ts - start) / 1000
      // Fill to 80% over 1.5s, then hold until loadingDone
      const next = Math.min(elapsed / 1.5 * 0.8, 0.8)
      setProgress(next)
      if (next < 0.8) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [showBar])

  useEffect(() => {
    if (done) setProgress(1)
  }, [done])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#010306',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: done ? 0 : 1,
      transition: 'opacity 1.2s ease',
      pointerEvents: done ? 'none' : 'all',
    }}>
      <div style={{
        color: '#c8b880', fontSize: 9, letterSpacing: '.28em',
        textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif",
        marginBottom: 18,
        opacity: showAuthor ? 0.8 : 0,
        transition: 'opacity 0.3s ease',
      }}>
        Brandon Sanderson
      </div>

      <h1 style={{
        color: '#f0e8d8', fontSize: 44, fontFamily: "'Cinzel',serif",
        fontWeight: 700, letterSpacing: '.2em', margin: '0 0 6px',
        opacity: showTitle ? 1 : 0,
        transform: showTitle ? 'scale(1)' : 'scale(0.9)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
        willChange: 'transform, opacity',
      }}>
        COSMERE
      </h1>

      <div style={{
        color: '#2a3545', fontSize: 11, letterSpacing: '.2em',
        fontFamily: "'DM Sans',sans-serif", marginBottom: 44,
        opacity: showTitle ? 1 : 0,
        transition: 'opacity 0.4s ease 0.1s',
      }}>
        ATLAS ESTELAR
      </div>

      <div style={{
        width: 180, height: 1, background: 'rgba(255,255,255,.05)',
        borderRadius: 1, overflow: 'hidden',
        opacity: showBar ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: 'linear-gradient(90deg,#c8b880,#4d8fd4)',
          borderRadius: 1,
          transition: done ? 'width 0.3s ease' : undefined,
        }} />
      </div>

      <div style={{
        color: '#223344', fontSize: 10, fontFamily: "'DM Sans',sans-serif",
        marginTop: 14, letterSpacing: '.08em',
        opacity: showBar ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        Inicializando el universo&hellip;
      </div>
    </div>
  )
}
