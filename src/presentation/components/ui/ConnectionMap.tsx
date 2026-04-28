'use client'

import type { System } from '@/domain/entities/System'
import type { ShardConnection } from '@/domain/entities/ShardConnection'

interface Props {
  system: System
  allSystems: System[]
  connections: ShardConnection[]
}

export function ConnectionMap({ system: sys, allSystems, connections }: Props) {
  const W = 360, H = 140, cx = W / 2, cy = H / 2, r = 50
  const connIds = new Set(connections.map(c => c.targetSystemId))

  const positions: Record<string, { x: number; y: number }> = {}
  allSystems.forEach((s, i) => {
    const angle = (i / allSystems.length) * Math.PI * 2 - Math.PI / 2
    positions[s.id] = { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r }
  })

  const myPos = positions[sys.id]
  if (!myPos) return null

  return (
    <svg width={W} height={H} style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
      {connections.map((conn, i) => {
        const tp = positions[conn.targetSystemId]
        if (!tp) return null
        return (
          <line
            key={i}
            x1={myPos.x} y1={myPos.y} x2={tp.x} y2={tp.y}
            stroke={sys.color} strokeWidth={1} strokeOpacity={0.35}
            strokeDasharray="3 4"
          />
        )
      })}
      {allSystems.map(s => {
        const p = positions[s.id]
        if (!p) return null
        const isMe   = s.id === sys.id
        const isConn = connIds.has(s.id)
        return (
          <g key={s.id}>
            <circle
              cx={p.x} cy={p.y}
              r={isMe ? 8 : isConn ? 5 : 3.5}
              fill={s.color}
              opacity={isMe ? 1 : isConn ? 0.85 : 0.3}
              style={{ filter: isMe || isConn ? `drop-shadow(0 0 4px ${s.color})` : 'none' }}
            />
            <text
              x={p.x} y={p.y + (isMe ? 16 : 12)}
              textAnchor="middle"
              fill={isMe || isConn ? s.color : '#334455'}
              fontSize={isMe ? 9 : 8}
              fontFamily="'DM Sans',sans-serif"
              letterSpacing=".04em"
            >
              {s.name.split(' ')[1] ?? s.name.split(' ')[0]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
