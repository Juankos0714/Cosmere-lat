'use client'

import { useState } from 'react'
import type { Book } from '@/domain/entities/Book'
import { hex2rgba } from '@/shared/lib/colors'

interface Props {
  book: Book
  accentColor: string
  index: number
}

export function BookCard({ book, accentColor, index }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [hov, setHov] = useState(false)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => setExpanded(e => !e)}
      style={{
        background: expanded
          ? `linear-gradient(145deg,${hex2rgba(book.color, 0.95)},${hex2rgba(book.color, 1)})`
          : `linear-gradient(145deg,${hex2rgba(book.color, 0.7)},${hex2rgba(book.color, 0.85)})`,
        border: `1px solid ${hex2rgba(accentColor, expanded ? 0.45 : hov ? 0.3 : 0.18)}`,
        borderRadius: 10,
        padding: expanded ? '16px 18px' : '12px 18px',
        cursor: 'pointer',
        transition: 'all .3s cubic-bezier(.22,1,.36,1)',
        boxShadow: expanded
          ? `0 8px 32px rgba(0,0,0,.6),0 0 20px ${hex2rgba(accentColor, 0.2)}`
          : hov ? `0 4px 20px rgba(0,0,0,.5),0 0 10px ${hex2rgba(accentColor, 0.12)}` : '0 2px 10px rgba(0,0,0,.35)',
        position: 'relative', overflow: 'hidden',
        animation: `slideUp .38s ease ${index * 0.055}s both`,
        marginBottom: 2,
      }}
    >
      {/* Spine */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: accentColor, opacity: expanded ? 1 : 0.6,
        boxShadow: `0 0 8px ${accentColor}`,
        borderRadius: '10px 0 0 10px',
      }} />

      <div style={{ paddingLeft: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ color: hex2rgba(accentColor, 0.7), fontSize: 10, letterSpacing: '.1em', fontFamily: "'DM Sans',sans-serif" }}>
            {book.year}
          </span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {book.pov.slice(0, 3).map(p => (
              <span key={p} style={{
                background: hex2rgba(accentColor, 0.1), border: `1px solid ${hex2rgba(accentColor, 0.25)}`,
                color: hex2rgba(accentColor, 0.8), fontSize: 8, padding: '1px 6px',
                borderRadius: 10, letterSpacing: '.04em', fontFamily: "'DM Sans',sans-serif",
              }}>{p}</span>
            ))}
          </div>
        </div>

        <div style={{ color: '#e0d8c8', fontSize: 13, fontFamily: "'Cinzel',serif", fontWeight: 600, lineHeight: 1.35, marginBottom: 3 }}>
          {book.title}
        </div>
        <div style={{ color: '#556677', fontSize: 10, fontFamily: "'DM Sans',sans-serif", marginBottom: expanded ? 10 : 0 }}>
          {book.subtitle}
        </div>

        {expanded && (
          <div style={{
            color: '#9ab0c8', fontSize: 12, lineHeight: 1.7,
            fontFamily: "'DM Sans',sans-serif",
            borderTop: `1px solid ${hex2rgba(accentColor, 0.18)}`,
            paddingTop: 10, marginTop: 4,
            animation: 'fadeIn .25s ease',
          }}>
            {book.summary}
          </div>
        )}

        {!expanded && (
          <div style={{ color: '#334455', fontSize: 9, letterSpacing: '.06em', fontFamily: "'DM Sans',sans-serif", marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: hex2rgba(accentColor, 0.4), fontSize: 11 }}>+</span>
            <span>ver resumen</span>
          </div>
        )}
      </div>
    </div>
  )
}
