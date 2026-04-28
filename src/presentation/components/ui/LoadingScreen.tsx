'use client'

import { useUIStore } from '@/presentation/stores/uiStore'

export function LoadingScreen() {
  const done = useUIStore(s => s.loadingDone)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#010306',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: done ? 0 : 1,
      transition: 'opacity 1.2s ease',
      pointerEvents: done ? 'none' : 'all',
    }}>
      <div style={{ color: '#c8b880', fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif", marginBottom: 18, opacity: 0.8 }}>
        Brandon Sanderson
      </div>
      <h1 style={{ color: '#f0e8d8', fontSize: 44, fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: '.2em', margin: '0 0 6px' }}>
        COSMERE
      </h1>
      <div style={{ color: '#2a3545', fontSize: 11, letterSpacing: '.2em', fontFamily: "'DM Sans',sans-serif", marginBottom: 44 }}>
        ATLAS ESTELAR
      </div>
      <div style={{ width: 180, height: 1, background: 'rgba(255,255,255,.05)', borderRadius: 1, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg,#c8b880,#4d8fd4)',
          borderRadius: 1,
          animation: 'load 1.6s ease forwards',
        }} />
      </div>
      <div style={{ color: '#223344', fontSize: 10, fontFamily: "'DM Sans',sans-serif", marginTop: 14, letterSpacing: '.08em' }}>
        Inicializando el universo…
      </div>
    </div>
  )
}
