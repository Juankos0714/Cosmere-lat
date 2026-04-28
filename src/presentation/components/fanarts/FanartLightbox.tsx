'use client'

import { useEffect } from 'react'
import type { Fanart } from '@/domain/entities/Fanart'
import type { System } from '@/domain/entities/System'
import { hex2rgba } from '@/shared/lib/colors'

interface Props {
  fanart: Fanart
  system: System | undefined
  onClose: () => void
}

export function FanartLightbox({ fanart, system, onClose }: Props) {
  const accentColor = system?.color ?? '#4d8fd4'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(1,3,6,.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn .2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 740, width: '100%',
          background: 'rgba(5,9,20,.98)',
          border: `1px solid ${hex2rgba(accentColor, 0.3)}`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: `0 24px 80px rgba(0,0,0,.8), 0 0 40px ${hex2rgba(accentColor, 0.15)}`,
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', background: hex2rgba(accentColor, 0.05) }}>
          <img src={fanart.thumbnailPath} alt={fanart.title} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(5,9,20,.85)', border: '1px solid rgba(255,255,255,.15)',
            color: '#7788aa', width: 34, height: 34, borderRadius: 8,
            cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Info */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h2 style={{ margin: '0 0 4px', color: '#f0e8d8', fontSize: 18, fontFamily: "'Cinzel',serif", fontWeight: 600 }}>{fanart.title}</h2>
              <div style={{ color: '#7a90a8', fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
                por <span style={{ color: accentColor }}>{fanart.artist}</span>
              </div>
            </div>
            {system && (
              <div style={{
                background: hex2rgba(accentColor, 0.1), border: `1px solid ${hex2rgba(accentColor, 0.3)}`,
                borderRadius: 6, padding: '6px 12px',
                color: accentColor, fontSize: 9,
                fontFamily: "'Cinzel',serif", letterSpacing: '.12em', textTransform: 'uppercase',
              }}>
                {system.name.replace('Sistema ', '')}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
            {fanart.tags.map(tag => (
              <span key={tag} style={{
                background: hex2rgba(accentColor, 0.08), border: `1px solid ${hex2rgba(accentColor, 0.22)}`,
                color: hex2rgba(accentColor, 0.7), fontSize: 9, padding: '2px 8px',
                borderRadius: 20, fontFamily: "'DM Sans',sans-serif",
              }}>{tag}</span>
            ))}
          </div>

          <a
            href={fanart.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: hex2rgba(accentColor, 0.12),
              border: `1px solid ${hex2rgba(accentColor, 0.35)}`,
              color: accentColor, textDecoration: 'none',
              padding: '8px 16px', borderRadius: 8,
              fontSize: 11, fontFamily: "'DM Sans',sans-serif", letterSpacing: '.06em',
              transition: 'all .2s',
            }}
          >
            Ver original →
          </a>
          <div style={{ color: '#334455', fontSize: 9, fontFamily: "'DM Sans',sans-serif", marginTop: 8, letterSpacing: '.04em' }}>
            Añadido el {fanart.addedAt} · Fuente: {fanart.artist} vía {fanart.source}
          </div>
        </div>
      </div>
    </div>
  )
}
