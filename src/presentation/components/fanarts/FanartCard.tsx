'use client'

import { useState } from 'react'
import type { Fanart } from '@/domain/entities/Fanart'
import type { System } from '@/domain/entities/System'
import { hex2rgba } from '@/shared/lib/colors'

interface Props {
  fanart: Fanart
  system: System | undefined
  onClick: () => void
}

const SOURCE_LABELS: Record<string, string> = {
  artstation: 'ArtStation',
  deviantart: 'DeviantArt',
  twitter: 'Twitter/X',
  reddit: 'Reddit',
  other: 'Fuente',
}

export function FanartCard({ fanart, system, onClick }: Props) {
  const [hov, setHov] = useState(false)
  const accentColor = system?.color ?? '#4d8fd4'

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        border: `1px solid ${hex2rgba(accentColor, hov ? 0.45 : 0.18)}`,
        background: 'rgba(8,12,28,.8)',
        transition: 'all .25s ease',
        boxShadow: hov ? `0 8px 32px rgba(0,0,0,.6),0 0 16px ${hex2rgba(accentColor, 0.2)}` : '0 2px 12px rgba(0,0,0,.4)',
        transform: hov ? 'translateY(-3px)' : 'none',
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', paddingBottom: '75%', background: hex2rgba(accentColor, 0.08) }}>
        <img
          src={fanart.thumbnailPath}
          alt={fanart.title}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: hov ? 0.9 : 0.75, transition: 'opacity .25s' }}
          loading="lazy"
        />
        {/* System badge */}
        {system && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'rgba(5,9,20,.85)', backdropFilter: 'blur(8px)',
            border: `1px solid ${hex2rgba(accentColor, 0.4)}`,
            borderRadius: 6, padding: '3px 8px',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, boxShadow: `0 0 5px ${accentColor}` }} />
            <span style={{ color: accentColor, fontSize: 8, letterSpacing: '.1em', fontFamily: "'DM Sans',sans-serif", textTransform: 'uppercase' }}>
              {system.name.replace('Sistema ', '')}
            </span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ color: '#d0c8b8', fontSize: 12, fontFamily: "'Cinzel',serif", fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>
          {fanart.title}
        </div>
        <div style={{ color: '#556677', fontSize: 10, fontFamily: "'DM Sans',sans-serif", marginBottom: 8 }}>
          por {fanart.artist}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {fanart.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              background: hex2rgba(accentColor, 0.08), border: `1px solid ${hex2rgba(accentColor, 0.22)}`,
              color: hex2rgba(accentColor, 0.7), fontSize: 8, padding: '1px 6px',
              borderRadius: 10, fontFamily: "'DM Sans',sans-serif", letterSpacing: '.04em',
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
