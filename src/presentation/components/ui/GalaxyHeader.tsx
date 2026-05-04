'use client'

import Link from 'next/link'
import { useUIStore } from '@/presentation/stores/uiStore'
import { useSceneStore } from '@/presentation/stores/sceneStore'

export function GalaxyHeader() {
  const done    = useUIStore(s => s.loadingDone)
  const visible = useSceneStore(s => s.state === 'galaxy') && done

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding: '28px 40px',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transition: 'opacity .7s ease',
    }}>
      <div>
        <div style={{ color: '#c8b880', fontSize: 9, letterSpacing: '.25em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif", marginBottom: 4, opacity: 0.75 }}>
          Brandon Sanderson
        </div>
        <h1 style={{ margin: 0, color: '#f0e8d8', fontSize: 30, fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: '.12em', textShadow: '0 0 40px rgba(200,180,120,.3)' }}>
          COSMERE
        </h1>
        <div style={{ color: '#445566', fontSize: 10, letterSpacing: '.15em', marginTop: 5, fontFamily: "'DM Sans',sans-serif" }}>
          ATLAS ESTELAR INTERACTIVO
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6, pointerEvents: 'all' }}>
        <Link href="/imagenes" style={{
          color: '#446688', fontSize: 10, letterSpacing: '.1em',
          textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif",
          textDecoration: 'none',
          padding: '6px 14px',
          border: '1px solid rgba(100,140,200,.2)',
          borderRadius: 6,
          background: 'rgba(8,12,28,.6)',
          backdropFilter: 'blur(8px)',
          transition: 'all .2s',
          display: 'inline-block',
        }}>
          Imágenes
        </Link>
        <Link href="/galeria" style={{
          color: '#446688', fontSize: 10, letterSpacing: '.1em',
          textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif",
          textDecoration: 'none',
          padding: '6px 14px',
          border: '1px solid rgba(100,140,200,.2)',
          borderRadius: 6,
          background: 'rgba(8,12,28,.6)',
          backdropFilter: 'blur(8px)',
          transition: 'all .2s',
          display: 'inline-block',
        }}>
          Galería →
        </Link>
      </div>
    </div>
  )
}
