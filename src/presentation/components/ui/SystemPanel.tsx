'use client'

import { useState, useEffect, useRef } from 'react'
import type { System } from '@/domain/entities/System'
import type { Planet } from '@/domain/entities/Planet'
import type { Book } from '@/domain/entities/Book'
import type { ShardConnection } from '@/domain/entities/ShardConnection'
import { hex2rgba } from '@/shared/lib/colors'
import { BookCard } from './BookCard'
import { ConnectionMap } from './ConnectionMap'

type Tab = 'libros' | 'planetas' | 'conexiones'

interface Props {
  system: System | null
  planets: Planet[]
  books: Book[]
  connections: ShardConnection[]
  novellas: string[]
  allSystems: System[]
  onClose: () => void
}

function MetaPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: hex2rgba(color, 0.08), border: `1px solid ${hex2rgba(color, 0.22)}`, borderRadius: 6, padding: '5px 10px', flexShrink: 0, maxWidth: '100%' }}>
      <div style={{ color: hex2rgba(color, 0.6), fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif", marginBottom: 2 }}>{label}</div>
      <div style={{ color: '#a0b4c8', fontSize: 11, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.3 }}>{value}</div>
    </div>
  )
}

function MiniTag({ label, c }: { label: string; c: string }) {
  return (
    <span style={{ fontSize: 9, letterSpacing: '.07em', textTransform: 'uppercase', background: hex2rgba(c, 0.1), border: `1px solid ${hex2rgba(c, 0.28)}`, color: c, padding: '2px 8px', borderRadius: 20, fontFamily: "'DM Sans',sans-serif" }}>
      {label}
    </span>
  )
}

function ConnBadge({ conn, accentColor, allSystems }: { conn: ShardConnection; accentColor: string; allSystems: System[] }) {
  const [hov, setHov] = useState(false)
  const target = allSystems.find(s => s.id === conn.targetSystemId)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? hex2rgba(accentColor, 0.12) : hex2rgba(accentColor, 0.06),
        border: `1px solid ${hex2rgba(accentColor, hov ? 0.45 : 0.22)}`,
        borderRadius: 8, padding: '10px 14px',
        cursor: 'default', transition: 'all .2s ease', position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
        {target && <div style={{ width: 7, height: 7, borderRadius: '50%', background: target.color, boxShadow: `0 0 6px ${target.color}`, flexShrink: 0 }} />}
        <span style={{ color: accentColor, fontSize: 10, fontFamily: "'DM Sans',sans-serif", letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 500 }}>{conn.label}</span>
        {target && <span style={{ marginLeft: 'auto', color: '#334455', fontSize: 9, letterSpacing: '.05em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>{target.name.split(' ')[1] ?? target.name}</span>}
      </div>
      {hov && <div style={{ color: '#8899bb', fontSize: 11, lineHeight: 1.55, fontFamily: "'DM Sans',sans-serif", animation: 'fadeIn .18s ease' }}>{conn.desc}</div>}
    </div>
  )
}

export function SystemPanel({ system: sys, planets, books, connections, novellas, allSystems, onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const [tab, setTab] = useState<Tab>('libros')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sys) { setTimeout(() => setVisible(true), 120); setTab('libros'); if (scrollRef.current) scrollRef.current.scrollTop = 0 }
    else setVisible(false)
  }, [sys])

  if (!sys) return null

  const TABS: { id: Tab; label: string }[] = [
    { id: 'libros', label: 'Libros' },
    { id: 'planetas', label: 'Planetas' },
    { id: 'conexiones', label: 'Conexiones' },
  ]

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: visible ? 420 : 0,
      zIndex: 200,
      transition: 'width .55s cubic-bezier(.22,1,.36,1)',
      overflow: 'hidden',
      pointerEvents: visible ? 'all' : 'none',
    }}>
      <div style={{
        width: 420, height: '100%',
        background: 'rgba(5,9,20,.95)',
        backdropFilter: 'blur(28px)',
        borderLeft: `1px solid ${hex2rgba(sys.color, 0.2)}`,
        boxShadow: `-12px 0 60px rgba(0,0,0,.7),-4px 0 20px ${hex2rgba(sys.color, 0.08)}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 28px 0', background: `linear-gradient(180deg,${hex2rgba(sys.color, 0.08)} 0%,transparent 100%)`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: sys.color, boxShadow: `0 0 14px ${sys.color}`, flexShrink: 0 }} />
                <span style={{ color: sys.color, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>{sys.starType}</span>
              </div>
              <h2 style={{ margin: 0, color: '#f0e8d8', fontSize: 20, fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: '.04em' }}>{sys.name}</h2>
              <div style={{ color: '#556688', fontSize: 11, marginTop: 4, fontFamily: "'DM Sans',sans-serif", fontStyle: 'italic', lineHeight: 1.4 }}>"{sys.tagline}"</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#7788aa', width: 34, height: 34, borderRadius: 8, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>✕</button>
          </div>

          <p style={{ color: '#7a90a8', fontSize: 11.5, lineHeight: 1.65, margin: '0 0 14px', fontFamily: "'DM Sans',sans-serif" }}>{sys.description}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
            <MetaPill label="Esquirla" value={sys.shard} color={sys.color} />
            <MetaPill label="Magia"    value={sys.magic}  color={sys.color} />
          </div>

          <div style={{ display: 'flex', borderBottom: `1px solid ${hex2rgba(sys.color, 0.15)}` }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '7px 16px 8px', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase',
                fontFamily: "'DM Sans',sans-serif",
                color: tab === t.id ? sys.color : '#445566',
                borderBottom: tab === t.id ? `2px solid ${sys.color}` : '2px solid transparent',
                transition: 'all .18s', marginBottom: -1,
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 28px 32px', scrollbarWidth: 'thin', scrollbarColor: `${hex2rgba(sys.color, 0.3)} transparent` }}>

          {tab === 'libros' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'fadeIn .3s ease' }}>
              <div style={{ color: '#334455', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif", marginBottom: 4 }}>
                {books.length} {books.length === 1 ? 'libro' : 'libros'} · clic para ver resumen
              </div>
              {books.map((book, i) => <BookCard key={book.id} book={book} accentColor={sys.color} index={i} />)}
              {novellas.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ color: '#334455', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif", marginBottom: 8 }}>Novellas</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {novellas.map(n => (
                      <span key={n} style={{ background: hex2rgba(sys.color, 0.08), border: `1px solid ${hex2rgba(sys.color, 0.25)}`, color: sys.color, fontSize: 10, padding: '4px 12px', borderRadius: 20, fontFamily: "'DM Sans',sans-serif" }}>{n}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'planetas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn .3s ease' }}>
              {planets.map((p, i) => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,.025)', border: `1px solid ${hex2rgba(sys.color, 0.2)}`, borderRadius: 10, padding: '14px 16px', animation: `slideUp .38s ease ${i * 0.1}s both` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: p.color, boxShadow: `0 0 10px ${p.color}99`, flexShrink: 0 }} />
                    <span style={{ color: '#e0d8c8', fontSize: 14, fontFamily: "'Cinzel',serif", fontWeight: 600 }}>{p.name}</span>
                    {p.isTidallyLocked && <span style={{ fontSize: 8, color: sys.color, letterSpacing: '.1em', textTransform: 'uppercase', background: hex2rgba(sys.color, 0.1), padding: '2px 6px', borderRadius: 4 }}>bloqueado</span>}
                  </div>
                  <p style={{ color: '#7a90a8', fontSize: 12, lineHeight: 1.6, margin: '0 0 10px', fontFamily: "'DM Sans',sans-serif" }}>{p.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {p.hasAtmosphere && <MiniTag label="Atmósfera" c={sys.color} />}
                    {p.hasMoon && p.moonName && <MiniTag label={`Luna: ${p.moonName}`} c={sys.color} />}
                    {p.hasStorm && <MiniTag label="Altas Tormentas" c={sys.color} />}
                    {p.isTidallyLocked && <MiniTag label="Dayside / Darkside" c={sys.color} />}
                    {p.hasSpirits && <MiniTag label="Espíritus yoki-hijo" c={sys.color} />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'conexiones' && (
            <div style={{ animation: 'fadeIn .3s ease' }}>
              <div style={{ color: '#334455', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif", marginBottom: 12 }}>
                Hilos de Investidura con otros mundos
              </div>
              <ConnectionMap system={sys} allSystems={allSystems} connections={connections} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {connections.length === 0 ? (
                  <div style={{ color: '#334455', fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontStyle: 'italic', padding: '20px 0' }}>Conexiones no documentadas aún.</div>
                ) : connections.map((conn, i) => (
                  <ConnBadge key={i} conn={conn} accentColor={sys.color} allSystems={allSystems} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
