'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { hex2rgba } from '@/shared/lib/colors'

// ── Data ──────────────────────────────────────────────────
interface Book {
  id: string; title: string; series: string; num: number; year: number
  color: string; accent: string; world: string; difficulty: 'fácil' | 'media' | 'alta'
  hours: number; essential: boolean; optional: boolean; summary: string
  connections: string[]; pubOrder: number; recOrder: number; universe: number
}

const BOOKS: Book[] = [
  { id:'elantris',    title:'Elantris',                series:'Sel',          num:1, year:2005, color:'#1a3010', accent:'#7cba65', world:'sel',     difficulty:'media',  hours:18, essential:true,  optional:false, summary:'La ciudad de los dioses cayó hace diez años. Raoden despierta transformado en un Elantrino.',    connections:[], pubOrder:1,  recOrder:1,  universe:1  },
  { id:'imperio',     title:'El Imperio Final',         series:'Mistborn',     num:1, year:2006, color:'#1a0e04', accent:'#c8a855', world:'scadrial', difficulty:'media',  hours:24, essential:true,  optional:false, summary:'Kelsier y Vin conspiran para derrocar al Lord Legislador, un dios-emperador inmortal.',          connections:[], pubOrder:2,  recOrder:3,  universe:3  },
  { id:'pozo',        title:'El Pozo de la Ascensión', series:'Mistborn',     num:2, year:2007, color:'#130a02', accent:'#c8a855', world:'scadrial', difficulty:'media',  hours:26, essential:true,  optional:false, summary:'Con el Imperio caído, Elend intenta gobernar mientras algo antiguo despierta bajo Luthadel.',    connections:['imperio'], pubOrder:3, recOrder:4, universe:4 },
  { id:'heroe',       title:'El Héroe de las Eras',    series:'Mistborn',     num:3, year:2008, color:'#0a0701', accent:'#c8a855', world:'scadrial', difficulty:'alta',   hours:28, essential:true,  optional:false, summary:'El apocalipsis se acerca. Ruina es libre. La verdad sobre el Cosmere comienza a revelarse.',        connections:['pozo'], pubOrder:4, recOrder:5, universe:6 },
  { id:'aliento',     title:'El Aliento de los Dioses',series:'Warbreaker',   num:1, year:2009, color:'#200c02', accent:'#d47c4d', world:'nalthis',  difficulty:'fácil',  hours:20, essential:true,  optional:false, summary:'Siri y Vivenna llegan a la ciudad de los dioses Retornados. Vasher porta la espada Nightblood.',   connections:[], pubOrder:5, recOrder:2, universe:2 },
  { id:'camino',      title:'El Camino de los Reyes',  series:'Stormlight',   num:1, year:2010, color:'#0a1420', accent:'#4d8fd4', world:'roshar',   difficulty:'alta',   hours:45, essential:true,  optional:false, summary:'Kaladin cae a la esclavitud. Shallan busca robar. Dalinar tiene visiones. Las Altas Tormentas barren Roshar.', connections:['aliento'], pubOrder:6, recOrder:6, universe:7 },
  { id:'aleacion',    title:'Aleación de Ley',          series:'Wax & Wayne', num:1, year:2011, color:'#1a1408', accent:'#c8a855', world:'scadrial', difficulty:'fácil',  hours:12, essential:false, optional:true,  summary:'300 años después. Waxillium Ladrian, sheriff alomántico, regresa a la alta sociedad de Elendel.',  connections:['heroe'], pubOrder:7, recOrder:9, universe:10 },
  { id:'palabras',    title:'Palabras Radiantes',       series:'Stormlight',   num:2, year:2014, color:'#0c1830', accent:'#4d8fd4', world:'roshar',   difficulty:'alta',   hours:48, essential:true,  optional:false, summary:'Kaladin jura el Tercer Ideal. Shallan llega a Urithiru. El pasado de Szeth es revelado.',          connections:['camino'], pubOrder:8, recOrder:7, universe:8 },
  { id:'emperor',     title:'El Alma del Emperador',   series:'Sel',          num:2, year:2012, color:'#0a1a08', accent:'#7cba65', world:'sel',      difficulty:'fácil',  hours:5,  essential:false, optional:true,  summary:'Shai debe recrear el alma del Emperador en 100 días o morir. Hugo Award. Joya del Cosmere.',        connections:[], pubOrder:9, recOrder:10, universe:5 },
  { id:'juramentada', title:'Juramentada',              series:'Stormlight',   num:3, year:2017, color:'#060e20', accent:'#4d8fd4', world:'roshar',   difficulty:'alta',   hours:55, essential:true,  optional:false, summary:'La gran Desolación llega. Dalinar une los reinos. Shallan descubre su identidad fragmentada.',     connections:['palabras','aliento'], pubOrder:10, recOrder:8, universe:9 },
  { id:'sombras',     title:'Sombras de Identidad',    series:'Wax & Wayne', num:2, year:2016, color:'#141008', accent:'#c8a855', world:'scadrial', difficulty:'media',  hours:14, essential:false, optional:true,  summary:'Kelsier regresa del Reino Cognitivo. Los Colmillos usan hemalurgia para crear armas.',           connections:['aleacion'], pubOrder:11, recOrder:11, universe:11 },
  { id:'brazales',    title:'Brazales de Duelo',       series:'Wax & Wayne', num:3, year:2017, color:'#181208', accent:'#c8a855', world:'scadrial', difficulty:'media',  hours:14, essential:false, optional:false, summary:'Wax se enfrenta al Superviviente. Un avatar de Autonomía aparece en Scadrial.',                  connections:['sombras'], pubOrder:12, recOrder:12, universe:12 },
  { id:'ritmo',       title:'El Ritmo de la Guerra',   series:'Stormlight',   num:4, year:2020, color:'#040a18', accent:'#4d8fd4', world:'roshar',   difficulty:'alta',   hours:58, essential:true,  optional:false, summary:'Urithiru cae. Navani descubre la Luz Siniestra. Kaladin enfrenta su oscuridad interior.',          connections:['juramentada'], pubOrder:13, recOrder:13, universe:13 },
  { id:'metal',       title:'El Metal Perdido',        series:'Wax & Wayne', num:4, year:2022, color:'#100c06', accent:'#c8a855', world:'scadrial', difficulty:'media',  hours:16, essential:true,  optional:false, summary:'La conclusión de Era 2. Por primera vez, el viaje entre mundos es central para la trama.',         connections:['brazales','ritmo'], pubOrder:14, recOrder:14, universe:14 },
  { id:'trenza',      title:'Trenza del Mar Esmeralda',series:'Secretas',     num:1, year:2023, color:'#060310', accent:'#8a5fd4', world:'lumar',    difficulty:'fácil',  hours:10, essential:false, optional:true,  summary:'Tress cruza los mares de esporas para rescatar a Charlie. Hoid narra. Una joya del Cosmere.',      connections:['ritmo'], pubOrder:15, recOrder:15, universe:15 },
  { id:'yumi',        title:'Yumi y el Pintor de Pesadillas', series:'Secretas', num:2, year:2023, color:'#200612', accent:'#d44d8a', world:'komashi', difficulty:'media', hours:12, essential:false, optional:true,  summary:'Una santa y un pintor intercambian mundos. Amor, identidad y el sacrificio por los demás.',       connections:['ritmo'], pubOrder:16, recOrder:16, universe:16 },
  { id:'viento',      title:'Viento y Verdad',         series:'Stormlight',   num:5, year:2024, color:'#040818', accent:'#4d8fd4', world:'roshar',   difficulty:'alta',   hours:60, essential:true,  optional:false, summary:'La conclusión de la primera mitad del Archivo. El Cosmere cambia para siempre.',                  connections:['ritmo','metal'], pubOrder:17, recOrder:17, universe:17 },
  { id:'iluminado',   title:'El Hombre Iluminado',     series:'Secretas',     num:3, year:2023, color:'#1a0c02', accent:'#d4804d', world:'canticle', difficulty:'media',  hours:10, essential:false, optional:true,  summary:'Sigzil/Nomad huye por el Cosmere. En Canticle, bajo un sol letal, encuentra su redención.',       connections:['metal','viento'], pubOrder:18, recOrder:18, universe:18 },
  { id:'whitesand',   title:'White Sand',              series:'Taldain',      num:1, year:2016, color:'#1a1004', accent:'#d4c44d', world:'taldain',  difficulty:'fácil',  hours:6,  essential:false, optional:true,  summary:'Kenton es el único Sand Master superviviente. Khriss cruza el mundo para investigar la magia.',   connections:[], pubOrder:19, recOrder:19, universe:20 },
]

const SERIES_COLORS: Record<string, string> = {
  'Sel':'#7cba65','Mistborn':'#c8a855','Warbreaker':'#d47c4d',
  'Stormlight':'#4d8fd4','Wax & Wayne':'#b89040','Secretas':'#8a5fd4',
  'Taldain':'#d4c44d',
}
const DIFFICULTY_COLOR: Record<string, string> = { 'fácil':'#7cba65','media':'#c8a855','alta':'#e06040' }

// ── Book Node (SVG) ───────────────────────────────────────
function BookNode({ book, x, y, selected, onSelect }: { book: Book; x: number; y: number; selected: boolean; onSelect: (b: Book) => void }) {
  const [hov, setHov] = useState(false)
  const isActive = hov || selected
  return (
    <g transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onSelect(book)}>
      <rect x={-55} y={-32} width={110} height={64} rx={8}
        fill={book.color} stroke={isActive ? book.accent : 'rgba(255,255,255,.1)'}
        strokeWidth={isActive ? 1.5 : .8}
        filter={isActive ? `url(#glow-${book.world})` : undefined} />
      {book.essential && <rect x={-55} y={-32} width={3} height={64} rx={1.5} fill={book.accent} />}
      <text x={0} y={-16} textAnchor="middle" fontSize={7} fontFamily="'DM Sans',sans-serif"
        fill={book.accent} letterSpacing=".08em" opacity={.8}>
        {book.series.toUpperCase()}
      </text>
      <text x={0} y={-3} textAnchor="middle" fontSize={8.5} fontFamily="'Cinzel',serif"
        fontWeight="600" fill="#e8e0d0">
        {book.title.length > 18 ? book.title.substring(0, 17) + '…' : book.title}
      </text>
      <text x={0} y={13} textAnchor="middle" fontSize={7} fontFamily="'DM Sans',sans-serif" fill="rgba(150,160,180,.7)">
        {book.year} · ~{book.hours}h
      </text>
      <circle cx={40} cy={-20} r={3.5} fill={DIFFICULTY_COLOR[book.difficulty]} opacity={.9} />
    </g>
  )
}

// ── Tree View ─────────────────────────────────────────────
const COLUMNS = [
  { label: 'Sel',           books: ['elantris','emperor'],                            x: 80  },
  { label: 'Nalthis',       books: ['aliento'],                                       x: 230 },
  { label: 'Scadrial Era 1',books: ['imperio','pozo','heroe'],                        x: 390 },
  { label: 'Taldain',       books: ['whitesand'],                                     x: 550 },
  { label: 'Stormlight',    books: ['camino','palabras','juramentada','ritmo','viento'], x: 710 },
  { label: 'Scadrial Era 2',books: ['aleacion','sombras','brazales','metal'],         x: 880 },
  { label: 'Secretas',      books: ['trenza','yumi','iluminado'],                     x: 1050 },
]

const DEPS = [
  { from:'imperio', to:'pozo' }, { from:'pozo', to:'heroe' },
  { from:'heroe', to:'aleacion' }, { from:'aleacion', to:'sombras' },
  { from:'sombras', to:'brazales' }, { from:'brazales', to:'metal' },
  { from:'camino', to:'palabras' }, { from:'palabras', to:'juramentada' },
  { from:'juramentada', to:'ritmo' }, { from:'ritmo', to:'viento' },
  { from:'ritmo', to:'trenza', optional: true }, { from:'ritmo', to:'yumi', optional: true },
  { from:'metal', to:'iluminado', optional: true },
  { from:'viento', to:'iluminado', optional: true },
  { from:'aliento', to:'juramentada', optional: true, cross: true },
  { from:'heroe', to:'camino', optional: true, cross: true },
  { from:'metal', to:'viento', optional: true, cross: true },
]

function posOf(id: string): { x: number; y: number } | null {
  for (const col of COLUMNS) {
    const i = col.books.indexOf(id)
    if (i >= 0) return { x: col.x, y: 120 + i * 100 }
  }
  return null
}

function TreeView({ onSelectBook }: { onSelectBook: (b: Book) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const select = useCallback((b: Book) => {
    setSelected(prev => prev === b.id ? null : b.id)
    onSelectBook(b)
  }, [onSelectBook])

  const W = 1160, H = 680

  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
      <svg width={W} height={H} style={{ display: 'block', minWidth: W }}>
        <defs>
          {Object.entries(SERIES_COLORS).map(([s, c]) => {
            const world = ({ 'Sel':'sel','Mistborn':'scadrial','Warbreaker':'nalthis','Stormlight':'roshar','Wax & Wayne':'scadrial','Secretas':'lumar','Taldain':'taldain' } as Record<string,string>)[s] || s
            return (
              <filter key={s} id={`glow-${world}`}>
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={c} floodOpacity=".6" />
              </filter>
            )
          })}
        </defs>

        {COLUMNS.map(col => (
          <g key={col.label}>
            <text x={col.x} y={45} textAnchor="middle" fontSize={9} fontFamily="'DM Sans',sans-serif"
              fill={SERIES_COLORS[col.label] || '#888'} letterSpacing=".12em">
              {col.label.toUpperCase()}
            </text>
            <line x1={col.x} y1={55} x2={col.x} y2={H - 20}
              stroke={SERIES_COLORS[col.label] || 'rgba(255,255,255,.08)'} strokeWidth={.5} opacity={.3}
              strokeDasharray="4 6" />
          </g>
        ))}

        {DEPS.map((dep, i) => {
          const f = posOf(dep.from), t = posOf(dep.to)
          if (!f || !t) return null
          return (
            <path key={i}
              d={`M ${f.x} ${f.y + 32} C ${f.x} ${(f.y + t.y) / 2}, ${t.x} ${(f.y + t.y) / 2}, ${t.x} ${t.y - 32}`}
              fill="none"
              stroke={dep.cross ? 'rgba(200,184,128,.25)' : 'rgba(255,255,255,.12)'}
              strokeWidth={dep.cross ? 1 : .8}
              strokeDasharray={dep.optional ? '4 4' : dep.cross ? '6 4' : undefined} />
          )
        })}

        {COLUMNS.map(col => col.books.map((bid, i) => {
          const book = BOOKS.find(b => b.id === bid)
          if (!book) return null
          return <BookNode key={bid} book={book} x={col.x} y={120 + i * 100} selected={selected === bid} onSelect={select} />
        }))}

        <g transform={`translate(20,${H - 50})`}>
          {([['Esencial para el Cosmere','#4d8fd4',true],['Recomendado','#c8a855',false],['Opcional','#7cba65',false]] as const).map(([label, c, ess], i) => (
            <g key={label} transform={`translate(${i * 180},0)`}>
              <rect x={0} y={0} width={10} height={10} rx={2} fill={ess ? c : 'rgba(255,255,255,.1)'} stroke={c} strokeWidth={1} />
              <text x={14} y={9} fontSize={9} fontFamily="'DM Sans',sans-serif" fill="rgba(150,160,180,.7)">{label}</text>
            </g>
          ))}
          {(['fácil','media','alta'] as const).map((d, i) => (
            <g key={d} transform={`translate(${540 + i * 60},0)`}>
              <circle cx={5} cy={5} r={3.5} fill={DIFFICULTY_COLOR[d]} />
              <text x={12} y={9} fontSize={9} fontFamily="'DM Sans',sans-serif" fill="rgba(150,160,180,.7)">
                {d === 'fácil' ? 'Fácil' : d === 'media' ? 'Media' : 'Densa'}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

// ── Detail (label/value row) ──────────────────────────────
function Detail({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ color: '#445566', fontSize: 10 }}>{label}</span>
      <span style={{ color: accent || '#9ab0c8', fontSize: 10 }}>{value}</span>
    </div>
  )
}

// ── List View ─────────────────────────────────────────────
function ListView({ mode }: { mode: string }) {
  const sorted = [...BOOKS].sort((a, b) => {
    if (mode === 'pub') return a.pubOrder - b.pubOrder
    if (mode === 'rec') return a.recOrder - b.recOrder
    return a.universe - b.universe
  })
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sorted.map((book, i) => {
        const isOpen = expanded === book.id
        return (
          <div key={book.id}
            onClick={() => setExpanded(isOpen ? null : book.id)}
            style={{
              background: `linear-gradient(135deg, ${book.color}cc, rgba(5,5,10,.95))`,
              border: `1px solid ${hex2rgba(book.accent, isOpen ? .4 : .15)}`,
              borderLeft: `3px solid ${book.accent}`,
              borderRadius: 10, padding: '14px 18px', cursor: 'pointer',
              boxShadow: isOpen ? `0 4px 24px rgba(0,0,0,.5),0 0 16px ${hex2rgba(book.accent,.15)}` : 'none',
              transition: 'all .25s ease',
              animation: `fadeUp .4s ease ${i * .03}s both`,
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: hex2rgba(book.accent,.12), border: `1px solid ${hex2rgba(book.accent,.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: book.accent, fontSize: 12, fontFamily: "var(--font-cinzel,'Cinzel',serif)", fontWeight: 700 }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ color: '#e8e0d0', fontSize: 14, fontFamily: "var(--font-cinzel,'Cinzel',serif)", fontWeight: 600 }}>{book.title}</span>
                  {book.essential && <span style={{ fontSize: 8, color: book.accent, background: hex2rgba(book.accent,.12), border: `1px solid ${hex2rgba(book.accent,.3)}`, padding: '1px 7px', borderRadius: 10, letterSpacing: '.08em', textTransform: 'uppercase' }}>Esencial</span>}
                  {book.optional && <span style={{ fontSize: 8, color: '#6677aa', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', padding: '1px 7px', borderRadius: 10, letterSpacing: '.08em', textTransform: 'uppercase' }}>Opcional</span>}
                </div>
                <div style={{ color: '#445566', fontSize: 10, marginTop: 2 }}>
                  {book.series} #{book.num} · {book.year}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
                <div style={{ color: DIFFICULTY_COLOR[book.difficulty], fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase' }}>{book.difficulty}</div>
                <div style={{ color: '#7788aa', fontSize: 10 }}>~{book.hours}h</div>
                <span style={{ color: '#334455', fontSize: 14, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s', display: 'inline-block' }}>▾</span>
              </div>
            </div>

            {isOpen && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${hex2rgba(book.accent,.15)}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ color: '#445566', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Resumen</div>
                    <p style={{ color: '#9ab0c8', fontSize: 12, lineHeight: 1.65 }}>{book.summary}</p>
                  </div>
                  <div>
                    <div style={{ color: '#445566', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Detalles</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Detail label="Mundo" value={book.world} accent={book.accent} />
                      <Detail label="Dificultad" value={book.difficulty} accent={DIFFICULTY_COLOR[book.difficulty] ?? '#c8a855'} />
                      <Detail label="Tiempo estimado" value={`~${book.hours} horas`} accent={book.accent} />
                      <Detail label="Año publicación" value={String(book.year)} accent={book.accent} />
                      {book.connections.length > 0 && (
                        <div>
                          <span style={{ color: '#445566', fontSize: 9, letterSpacing: '.06em' }}>Requiere: </span>
                          {book.connections.map(c => {
                            const b = BOOKS.find(x => x.id === c)
                            return b ? <span key={c} style={{ color: b.accent, fontSize: 10, marginRight: 6 }}>{b.title}</span> : null
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Link href="/" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14,
                  color: book.accent, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase',
                  textDecoration: 'none', background: hex2rgba(book.accent,.08),
                  border: `1px solid ${hex2rgba(book.accent,.25)}`, borderRadius: 6, padding: '7px 14px',
                }}>↗ Ver sistema en el Atlas</Link>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Book Detail Panel (tree view) ─────────────────────────
function BookDetail({ book, onClose }: { book: Book; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      width: 340, background: 'rgba(5,8,18,.96)', backdropFilter: 'blur(24px)',
      border: `1px solid ${hex2rgba(book.accent,.3)}`,
      borderLeft: `3px solid ${book.accent}`,
      borderRadius: 12, padding: '20px 22px',
      boxShadow: `0 8px 40px rgba(0,0,0,.7),0 0 24px ${hex2rgba(book.accent,.15)}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ color: book.accent, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>{book.series} #{book.num} · {book.year}</div>
          <h3 style={{ color: '#f0e8d8', fontSize: 16, fontFamily: "var(--font-cinzel,'Cinzel',serif)", fontWeight: 700, lineHeight: 1.25 }}>{book.title}</h3>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#7788aa', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>✕</button>
      </div>
      <p style={{ color: '#8899bb', fontSize: 11.5, lineHeight: 1.65, marginBottom: 16 }}>{book.summary}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 9, color: DIFFICULTY_COLOR[book.difficulty] ?? '#c8a855', background: hex2rgba(DIFFICULTY_COLOR[book.difficulty] ?? '#c8a855',.1), border: `1px solid ${hex2rgba(DIFFICULTY_COLOR[book.difficulty] ?? '#c8a855',.3)}`, padding: '2px 8px', borderRadius: 10, letterSpacing: '.06em', textTransform: 'uppercase' }}>{book.difficulty}</span>
        <span style={{ fontSize: 9, color: '#7788aa', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', padding: '2px 8px', borderRadius: 10 }}>~{book.hours}h</span>
        {book.essential && <span style={{ fontSize: 9, color: book.accent, background: hex2rgba(book.accent,.1), border: `1px solid ${hex2rgba(book.accent,.3)}`, padding: '2px 8px', borderRadius: 10, letterSpacing: '.06em', textTransform: 'uppercase' }}>Esencial</span>}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────
type Mode = 'tree' | 'pub' | 'rec' | 'universe'
const MODES: { id: Mode; label: string }[] = [
  { id: 'tree',     label: 'Árbol de Dependencias' },
  { id: 'pub',      label: 'Publicación' },
  { id: 'rec',      label: 'Recomendado' },
  { id: 'universe', label: 'In-Universe' },
]

const MODE_DESCRIPTIONS: Record<Mode, string> = {
  tree:     'El árbol muestra las dependencias entre libros. Una línea continua = necesario. Línea discontinua = conexiones cruzadas. Clic en cualquier libro para ver detalles.',
  rec:      'Orden recomendado para nuevos lectores del Cosmere. Empieza por los independientes y construye hacia los libros más conectados.',
  pub:      'Orden de publicación original. Útil para seguir la evolución de la narrativa como fue concebida.',
  universe: 'Cronología in-universe del Cosmere. Los libros ordenados según la línea temporal del universo compartido.',
}

export default function GuiaPage() {
  const [mode, setMode] = useState<Mode>('tree')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: '#010306' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}`}</style>

      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(1,3,6,.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        padding: '0 40px',
      }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/" style={{ color: '#7788aa', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none' }}>← Atlas</Link>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.1)' }} />
            <div>
              <div style={{ color: '#c8b880', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase' }}>Cosmere</div>
              <h1 style={{ color: '#f0e8d8', fontSize: 18, fontFamily: "var(--font-cinzel,'Cinzel',serif)", fontWeight: 700, letterSpacing: '.1em' }}>Guía de Lectura</h1>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); setSelectedBook(null) }} style={{
                background: mode === m.id ? 'rgba(200,184,128,.1)' : 'none',
                border: mode === m.id ? '1px solid rgba(200,184,128,.3)' : '1px solid transparent',
                color: mode === m.id ? '#c8b880' : '#445566',
                borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
                fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase',
                transition: 'all .2s',
              }}>{m.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 40px 24px' }}>
        <p style={{ color: '#445566', fontSize: 12, maxWidth: 600 }}>{MODE_DESCRIPTIONS[mode]}</p>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 40px 80px' }}>
        {mode === 'tree'
          ? <TreeView onSelectBook={setSelectedBook} />
          : <ListView mode={mode} />
        }
      </div>

      {mode === 'tree' && selectedBook && (
        <BookDetail book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  )
}
