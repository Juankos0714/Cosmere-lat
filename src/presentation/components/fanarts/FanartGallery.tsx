'use client'

import { useState } from 'react'
import type { Fanart } from '@/domain/entities/Fanart'
import type { System } from '@/domain/entities/System'
import { FanartCard } from './FanartCard'
import { FanartLightbox } from './FanartLightbox'
import { FanartUploadModal } from './FanartUploadModal'
import { hex2rgba } from '@/shared/lib/colors'

interface Props {
  fanarts: Fanart[]
  systems: System[]
}

export function FanartGallery({ fanarts, systems }: Props) {
  const [filter, setFilter] = useState<string | null>(null)
  const [selected, setSelected] = useState<Fanart | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const filtered = filter ? fanarts.filter(f => f.systemId === filter) : fanarts
  const systemMap = new Map(systems.map(s => [s.id, s]))

  return (
    <>
      {/* Filter bar + upload button */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28, alignItems: 'center' }}>
        <button
          onClick={() => setFilter(null)}
          style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 10,
            letterSpacing: '.08em', textTransform: 'uppercase',
            fontFamily: "'DM Sans',sans-serif", cursor: 'pointer',
            background: !filter ? 'rgba(200,180,120,.12)' : 'rgba(255,255,255,.04)',
            border: !filter ? '1px solid rgba(200,180,120,.4)' : '1px solid rgba(255,255,255,.1)',
            color: !filter ? '#c8b880' : '#445566',
            transition: 'all .18s',
          }}
        >
          Todos
        </button>
        {systems.map(sys => {
          const active = filter === sys.id
          return (
            <button
              key={sys.id}
              onClick={() => setFilter(active ? null : sys.id)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 10,
                letterSpacing: '.08em', textTransform: 'uppercase',
                fontFamily: "'DM Sans',sans-serif", cursor: 'pointer',
                background: active ? hex2rgba(sys.color, 0.12) : 'rgba(255,255,255,.04)',
                border: active ? `1px solid ${hex2rgba(sys.color, 0.5)}` : '1px solid rgba(255,255,255,.1)',
                color: active ? sys.color : '#445566',
                transition: 'all .18s',
              }}
            >
              {sys.name.replace('Sistema ', '')}
            </button>
          )
        })}
        <button
          onClick={() => setShowUpload(true)}
          style={{
            marginLeft: 'auto', padding: '5px 14px', borderRadius: 20, fontSize: 10,
            letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer',
            background: 'rgba(77,143,212,.08)', border: '1px solid rgba(77,143,212,.25)',
            color: '#4d8fd4', transition: 'all .18s', whiteSpace: 'nowrap',
          }}
        >
          + Subir
        </button>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
      }}>
        {filtered.map(fanart => (
          <FanartCard
            key={fanart.id}
            fanart={fanart}
            system={systemMap.get(fanart.systemId)}
            onClick={() => setSelected(fanart)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#334455', fontFamily: "'DM Sans',sans-serif", padding: '60px 0' }}>
          Sin fanarts para este sistema aún.
        </div>
      )}

      {selected && (
        <FanartLightbox
          fanart={selected}
          system={systemMap.get(selected.systemId)}
          onClose={() => setSelected(null)}
        />
      )}

      {showUpload && (
        <FanartUploadModal
          systems={systems}
          onClose={() => setShowUpload(false)}
          onUploaded={() => setShowUpload(false)}
        />
      )}
    </>
  )
}
