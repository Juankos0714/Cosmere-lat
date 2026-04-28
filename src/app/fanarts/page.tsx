'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FanartGallery } from '@/presentation/components/fanarts/FanartGallery'
import { fanartService, systemService } from '@/data/container'
import type { Fanart } from '@/domain/entities/Fanart'
import type { System } from '@/domain/entities/System'

export default function FanartsPage() {
  const [fanarts, setFanarts]   = useState<Fanart[]>([])
  const [systems, setSystems]   = useState<System[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      fanartService.getAll(),
      systemService.getAllSystems(),
    ]).then(([fa, sys]) => {
      setFanarts(fa)
      setSystems(sys)
      setLoading(false)
    })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', overflowY: 'auto',
      background: '#010306',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Radial vignette */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 0%, rgba(77,143,212,.04) 0%, transparent 60%)', zIndex: 0 }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 48 }}>
          <div>
            <div style={{ color: '#c8b880', fontSize: 9, letterSpacing: '.25em', textTransform: 'uppercase', marginBottom: 6, opacity: 0.75 }}>
              Brandon Sanderson
            </div>
            <h1 style={{ margin: 0, color: '#f0e8d8', fontSize: 28, fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: '.12em' }}>
              COSMERE
            </h1>
            <div style={{ color: '#4d8fd4', fontSize: 10, letterSpacing: '.2em', marginTop: 4, textTransform: 'uppercase' }}>
              Galería de Fanarts
            </div>
          </div>
          <Link href="/" style={{
            color: '#446688', fontSize: 10, letterSpacing: '.1em',
            textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif",
            textDecoration: 'none', padding: '8px 16px',
            border: '1px solid rgba(100,140,200,.2)', borderRadius: 8,
            background: 'rgba(8,12,28,.8)',
            backdropFilter: 'blur(8px)',
          }}>
            ← Atlas
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#334455', fontFamily: "'DM Sans',sans-serif", padding: '80px 0', fontSize: 13 }}>
            Cargando fanarts…
          </div>
        ) : (
          <FanartGallery fanarts={fanarts} systems={systems} />
        )}

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.05)', color: '#223344', fontSize: 10, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>
          Todos los fanarts son propiedad de sus respectivos artistas. Se muestran con fines de atribución y apreciación. Para añadir una obra, abre un PR en el repositorio con los metadatos del artista y enlace a la fuente original.
        </div>
      </div>
    </div>
  )
}
