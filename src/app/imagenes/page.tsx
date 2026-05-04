'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { hex2rgba } from '@/shared/lib/colors'

// ── Palette & Catalog ─────────────────────────────────────
const WORLD_PALETTE: Record<string, { color: string; name: string }> = {
  roshar:   { color: '#4d8fd4', name: 'Roshar' },
  scadrial: { color: '#c8a855', name: 'Scadrial' },
  sel:      { color: '#7cba65', name: 'Sel' },
  nalthis:  { color: '#d47c4d', name: 'Nalthis' },
  taldain:  { color: '#d4c44d', name: 'Taldain' },
  lumar:    { color: '#8a5fd4', name: 'Lumar' },
  komashi:  { color: '#d44d8a', name: 'Komashi' },
  canticle: { color: '#d4804d', name: 'Canticle' },
  yolen:    { color: '#c8b880', name: 'Yolen' },
}

interface CatalogItem { id: string; label: string; world: string; hint: string }

const CATALOG: Record<string, CatalogItem[]> = {
  personajes: [
    { id: 'kaladin',    label: 'Kaladin Stormblessed',  world: 'roshar',   hint: 'Portador del Viento · Stormlight 1-5' },
    { id: 'dalinar',    label: 'Dalinar Kholin',         world: 'roshar',   hint: 'El Unificador · Stormlight 1-5' },
    { id: 'shallan',    label: 'Shallan Davar',          world: 'roshar',   hint: 'Forjadora de Patrones · Stormlight 1-5' },
    { id: 'szeth',      label: 'Szeth-son-Neturo',       world: 'roshar',   hint: 'Asesino de Blanco · Stormlight 1-5' },
    { id: 'navani',     label: 'Navani Kholin',           world: 'roshar',   hint: 'Gran Investigadora · Stormlight 1-5' },
    { id: 'adolin',     label: 'Adolin Kholin',           world: 'roshar',   hint: 'Príncipe duelist · Stormlight 1-5' },
    { id: 'lift',       label: 'Lift',                    world: 'roshar',   hint: 'La que no debe crecer · Edgedancer' },
    { id: 'venli',      label: 'Venli',                   world: 'roshar',   hint: 'Portadora del Despertar · Stormlight 3-5' },
    { id: 'kelsier',    label: 'Kelsier',                 world: 'scadrial', hint: 'El Superviviente · Mistborn Era 1' },
    { id: 'vin',        label: 'Vin',                     world: 'scadrial', hint: 'Heroína de las Eras · Mistborn Era 1' },
    { id: 'sazed',      label: 'Sazed / Armonía',         world: 'scadrial', hint: 'El Terrisano · Mistborn Era 1' },
    { id: 'elend',      label: 'Elend Venture',           world: 'scadrial', hint: 'El Rey Filósofo · Mistborn Era 1' },
    { id: 'wax',        label: 'Waxillium Ladrian',       world: 'scadrial', hint: 'Sheriff · Wax & Wayne' },
    { id: 'wayne',      label: 'Wayne',                   world: 'scadrial', hint: 'El Cambiante · Wax & Wayne' },
    { id: 'raoden',     label: 'Raoden',                  world: 'sel',      hint: 'Rey de Elantris · Elantris' },
    { id: 'sarene',     label: 'Sarene',                  world: 'sel',      hint: 'Princesa diplomática · Elantris' },
    { id: 'shai',       label: 'Shai',                    world: 'sel',      hint: 'Forjadora del Alma · El Alma del Emperador' },
    { id: 'vivenna',    label: 'Vivenna',                 world: 'nalthis',  hint: 'Princesa · Warbreaker' },
    { id: 'siri',       label: 'Siri',                    world: 'nalthis',  hint: 'Reina de dioses · Warbreaker' },
    { id: 'lightsong',  label: 'Lightsong',               world: 'nalthis',  hint: 'El Dios escéptico · Warbreaker' },
    { id: 'vasher',     label: 'Vasher / Zahel',          world: 'nalthis',  hint: 'El Exiliado · Warbreaker + Stormlight' },
    { id: 'tress',      label: 'Tress',                   world: 'lumar',    hint: 'Heroína · Trenza del Mar Esmeralda' },
    { id: 'yumi',       label: 'Yumi',                    world: 'komashi',  hint: 'La Santa · Yumi y el Pintor' },
    { id: 'nikaro',     label: 'Nikaro',                  world: 'komashi',  hint: 'El Pintor · Yumi y el Pintor' },
    { id: 'sigzil',     label: 'Sigzil / Nomad',          world: 'canticle', hint: 'El Hombre Iluminado' },
    { id: 'kenton',     label: 'Kenton',                  world: 'taldain',  hint: 'Sand Master · White Sand' },
    { id: 'khriss',     label: 'Khriss',                  world: 'taldain',  hint: 'La Gran Estudiosa · White Sand + Arcanum' },
  ],
  libros: [
    { id: 'camino',      label: 'El Camino de los Reyes',      world: 'roshar',   hint: 'Stormlight #1 · 2010' },
    { id: 'palabras',    label: 'Palabras Radiantes',           world: 'roshar',   hint: 'Stormlight #2 · 2014' },
    { id: 'juramentada', label: 'Juramentada',                  world: 'roshar',   hint: 'Stormlight #3 · 2017' },
    { id: 'ritmo',       label: 'El Ritmo de la Guerra',        world: 'roshar',   hint: 'Stormlight #4 · 2020' },
    { id: 'viento',      label: 'Viento y Verdad',              world: 'roshar',   hint: 'Stormlight #5 · 2024' },
    { id: 'edgedancer',  label: 'Edgedancer',                   world: 'roshar',   hint: 'Novella · 2016' },
    { id: 'dawnshard',   label: 'Dawnshard',                    world: 'roshar',   hint: 'Novella · 2020' },
    { id: 'imperio',     label: 'El Imperio Final',             world: 'scadrial', hint: 'Mistborn #1 · 2006' },
    { id: 'pozo',        label: 'El Pozo de la Ascensión',      world: 'scadrial', hint: 'Mistborn #2 · 2007' },
    { id: 'heroe',       label: 'El Héroe de las Eras',         world: 'scadrial', hint: 'Mistborn #3 · 2008' },
    { id: 'aleacion',    label: 'Aleación de Ley',              world: 'scadrial', hint: 'Wax & Wayne #1 · 2011' },
    { id: 'sombras',     label: 'Sombras de Identidad',         world: 'scadrial', hint: 'Wax & Wayne #2 · 2016' },
    { id: 'brazales',    label: 'Brazales de Duelo',            world: 'scadrial', hint: 'Wax & Wayne #3 · 2017' },
    { id: 'metal',       label: 'El Metal Perdido',             world: 'scadrial', hint: 'Wax & Wayne #4 · 2022' },
    { id: 'elantris',    label: 'Elantris',                     world: 'sel',      hint: 'Sel #1 · 2005' },
    { id: 'emperor',     label: 'El Alma del Emperador',        world: 'sel',      hint: 'Novella · 2012' },
    { id: 'aliento',     label: 'El Aliento de los Dioses',     world: 'nalthis',  hint: 'Warbreaker · 2009' },
    { id: 'whitesand',   label: 'White Sand',                   world: 'taldain',  hint: 'Novela Gráfica · 2016' },
    { id: 'trenza',      label: 'Trenza del Mar Esmeralda',     world: 'lumar',    hint: 'Secretas Historias #1 · 2023' },
    { id: 'yumipaint',   label: 'Yumi y el Pintor de Pesadillas', world: 'komashi', hint: 'Secretas Historias #2 · 2023' },
    { id: 'iluminado',   label: 'El Hombre Iluminado',          world: 'canticle', hint: 'Secretas Historias #3 · 2023' },
  ],
  mundos: [
    { id: 'map-roshar',   label: 'Mapa de Roshar',          world: 'roshar',   hint: 'El Gran Océano Puuli y los continentes' },
    { id: 'shadesmar',    label: 'El Shadesmar',             world: 'roshar',   hint: 'Reino Cognitivo de Roshar' },
    { id: 'urithiru',     label: 'Torre de Urithiru',         world: 'roshar',   hint: 'La ciudad perdida de los Radiantes' },
    { id: 'map-scadrial', label: 'Mapa de Scadrial',          world: 'scadrial', hint: 'El Imperio Final y las Tierras Exteriores' },
    { id: 'luthadel',     label: 'Luthadel',                  world: 'scadrial', hint: 'La capital del Imperio Final' },
    { id: 'map-sel',      label: 'Mapa de Sel',               world: 'sel',      hint: 'Arelon, Fjorden y los reinos de magia' },
    { id: 'elantris-city',label: 'Elantris',                  world: 'sel',      hint: 'La ciudad caída de los dioses' },
    { id: 'map-nalthis',  label: 'Hallandren y Idris',        world: 'nalthis',  hint: 'Los dos reinos en conflicto' },
    { id: 'taldain-map',  label: 'Dayside y Darkside',        world: 'taldain',  hint: 'El mundo tidalmente bloqueado' },
    { id: 'lumar-seas',   label: 'Los Mares de Éter',         world: 'lumar',    hint: 'Los doce tipos de esporas' },
  ],
  hoid: [
    { id: 'hoid-roshar',   label: 'Hoid como Wit',          world: 'roshar',   hint: 'Bufón de la corte Kholin' },
    { id: 'hoid-scadrial', label: 'Hoid en Scadrial',        world: 'scadrial', hint: 'Drifter · Era de los Metales' },
    { id: 'hoid-lumar',    label: 'Hoid como Ala',           world: 'lumar',    hint: 'Narrador de Tress' },
    { id: 'hoid-general',  label: 'Hoid — Retrato General',  world: 'yolen',    hint: 'El Eterno Viajero' },
    { id: 'hoid-yolen',    label: 'Yolen — El Origen',       world: 'yolen',    hint: 'El mundo natal del Cosmere' },
  ],
  saltamundo: [
    { id: 'kelsier-cog',  label: 'Kelsier en el Reino Cognitivo', world: 'scadrial', hint: 'Supervisando su red inter-mundo' },
    { id: 'vasher-zahel', label: 'Vasher como Zahel en Roshar',   world: 'roshar',   hint: 'Maestro de armas exiliado' },
    { id: 'khriss-arc',   label: 'Khriss — Autora del Arcanum',   world: 'taldain',  hint: 'La mayor estudiosa del Cosmere' },
    { id: 'nazh-maps',    label: 'Nazh y sus Mapas',              world: 'roshar',   hint: 'Los mapas anotados del Archivo' },
  ],
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  personajes: { label: 'Personajes',     icon: '◉', color: '#4d8fd4' },
  libros:     { label: 'Portadas',       icon: '◈', color: '#c8a855' },
  mundos:     { label: 'Mapas y Mundos', icon: '◐', color: '#7cba65' },
  hoid:       { label: 'Hoid',           icon: '✦', color: '#c8b880' },
  saltamundo: { label: 'Saltamundo',     icon: '⟳', color: '#8a5fd4' },
}

const STORAGE_KEY = 'cosmere_images_v1'
type ImageStore = Record<string, string>

function imageKey(cat: string, id: string) { return `${cat}::${id}` }
function loadImages(): ImageStore {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}
function saveImages(imgs: ImageStore) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(imgs)) } catch { /* quota */ }
}

// ── Cloudinary upload helper ──────────────────────────────
async function uploadToCloudinary(file: File, cat: string): Promise<string> {
  const signRes = await fetch(`/api/cloudinary/sign?folder=cosmere/${cat}`)
  if (!signRes.ok) throw new Error('No se pudo obtener firma de Cloudinary')
  const { signature, timestamp, folder, apiKey, cloudName } = await signRes.json()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('signature', signature)
  formData.append('timestamp', String(timestamp))
  formData.append('folder', folder)
  formData.append('api_key', apiKey)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Error al subir a Cloudinary')
  const data = await res.json()
  return data.secure_url as string
}

// ── UploadSlot ────────────────────────────────────────────
interface SlotItem extends CatalogItem { cat: string }

function UploadSlot({ item, images, onUpload, onDelete }: {
  item: SlotItem; images: ImageStore
  onUpload: (key: string, url: string) => void
  onDelete: (key: string) => void
}) {
  const key = imageKey(item.cat, item.id)
  const url = images[key]
  const pal = WORLD_PALETTE[item.world] ?? { color: '#c8b880', name: '' }
  const fileRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [hov, setHov] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setErr(null)
    setUploading(true)
    try {
      const cloudUrl = await uploadToCloudinary(file, item.cat)
      onUpload(key, cloudUrl)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error')
    } finally {
      setUploading(false)
    }
  }, [key, item.cat, onUpload])

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: drag ? hex2rgba(pal.color, .12) : url ? 'transparent' : 'rgba(8,10,20,.9)',
        border: `1px solid ${drag ? pal.color : url ? hex2rgba(pal.color, .35) : hov ? hex2rgba(pal.color, .25) : 'rgba(255,255,255,.08)'}`,
        borderRadius: 10, overflow: 'hidden', transition: 'all .2s ease',
        animation: 'fadeUp .4s ease both', position: 'relative',
      }}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
    >
      <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            {hov && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, animation: 'fadeIn .15s ease' }}>
                <button onClick={() => fileRef.current?.click()} style={{ background: hex2rgba(pal.color, .18), border: `1px solid ${hex2rgba(pal.color, .5)}`, color: pal.color, borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase' }}>Reemplazar</button>
                <button onClick={() => onDelete(key)} style={{ background: 'rgba(200,50,50,.12)', border: '1px solid rgba(200,80,80,.35)', color: '#e06060', borderRadius: 8, padding: '7px 18px', cursor: 'pointer', fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase' }}>Eliminar</button>
              </div>
            )}
            <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)', border: `1px solid ${hex2rgba(pal.color, .4)}`, borderRadius: 6, padding: '2px 7px', color: pal.color, fontSize: 8, letterSpacing: '.08em' }}>✓ Cargada</div>
          </>
        ) : (
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'default' : 'pointer', gap: 10, padding: 16, background: drag ? hex2rgba(pal.color, .08) : 'transparent' }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, border: `1.5px dashed ${uploading ? hex2rgba(pal.color, .6) : drag ? pal.color : hex2rgba(pal.color, .4)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: drag ? pal.color : hex2rgba(pal.color, .5), fontSize: uploading ? 14 : 22, transition: 'all .2s', animation: uploading ? 'pulse 1.2s ease infinite' : 'none' }}>
              {uploading ? '↑' : drag ? '↓' : '+'}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: uploading ? hex2rgba(pal.color, .7) : drag ? pal.color : hex2rgba(pal.color, .5), fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                {uploading ? 'Subiendo…' : drag ? 'Suelta aquí' : 'Subir imagen'}
              </div>
              {!uploading && <div style={{ color: '#334455', fontSize: 9 }}>JPG, PNG, WebP</div>}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 12px', borderTop: `1px solid ${url ? hex2rgba(pal.color, .2) : 'rgba(255,255,255,.06)'}`, background: 'rgba(5,5,12,.85)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: pal.color, flexShrink: 0 }} />
          <span style={{ color: '#e0d8c8', fontSize: 12, fontFamily: "var(--font-cinzel,'Cinzel',serif)", fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
        </div>
        <div style={{ color: '#445566', fontSize: 9, lineHeight: 1.3 }}>{item.hint}</div>
        {err && <div style={{ color: '#e06060', fontSize: 9, marginTop: 4 }}>{err}</div>}
        {!url && !uploading && (
          <button
            onClick={() => fileRef.current?.click()}
            style={{ marginTop: 8, width: '100%', background: hex2rgba(pal.color, .08), border: `1px solid ${hex2rgba(pal.color, .22)}`, color: hex2rgba(pal.color, .8), borderRadius: 6, padding: '6px 0', cursor: 'pointer', fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase', transition: 'all .2s' }}
          >Elegir archivo</button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
    </div>
  )
}

// ── BulkUploadBar ─────────────────────────────────────────
function BulkUploadBar({ cat, items, onUpload, color }: { cat: string; items: CatalogItem[]; onUpload: (key: string, url: string) => void; color: string }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')

  const processAll = useCallback(async (files: FileList) => {
    setLoading(true)
    let done = 0
    const arr = Array.from(files)
    for (const file of arr) {
      const nameBase = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '')
      const matched = items.find(item => {
        const idNorm = item.id.replace(/[^a-z0-9]/g, '').toLowerCase()
        const labelNorm = item.label.toLowerCase().replace(/[^a-z0-9]/g, '')
        return nameBase.includes(idNorm) || idNorm.includes(nameBase) || nameBase.includes(labelNorm.substring(0, 8))
      })
      if (!matched) { done++; setProgress(`${done}/${arr.length}`); continue }
      try {
        const url = await uploadToCloudinary(file, cat)
        onUpload(imageKey(cat, matched.id), url)
      } catch { /* skip failed */ }
      done++
      setProgress(`${done}/${arr.length}`)
    }
    setLoading(false)
    setProgress('')
  }, [cat, items, onUpload])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(6,8,18,.9)', border: `1px solid ${hex2rgba(color, .2)}`, borderRadius: 10, marginBottom: 20 }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#e0d8c8', fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Subida múltiple</div>
        <div style={{ color: '#445566', fontSize: 10 }}>
          Nombra los archivos como el ID (ej: <span style={{ color: hex2rgba(color, .7) }}>kaladin.jpg</span>, <span style={{ color: hex2rgba(color, .7) }}>camino.png</span>) para asignación automática
        </div>
      </div>
      <button onClick={() => fileRef.current?.click()} disabled={loading}
        style={{ background: hex2rgba(color, .1), border: `1px solid ${hex2rgba(color, .35)}`, color: loading ? '#445566' : color, borderRadius: 8, padding: '9px 18px', cursor: loading ? 'default' : 'pointer', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', flexShrink: 0, transition: 'all .2s', opacity: loading ? .6 : 1 }}>
        {loading ? `Subiendo ${progress}…` : 'Subir múltiple'}
      </button>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files?.length) processAll(e.target.files) }} />
    </div>
  )
}

// ── ProgressBar ───────────────────────────────────────────
function ProgressBar({ cat, items, images, color }: { cat: string; items: CatalogItem[]; images: ImageStore; color: string }) {
  const uploaded = items.filter(i => images[imageKey(cat, i.id)]).length
  const pct = items.length ? Math.round(uploaded / items.length * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width .4s ease' }} />
      </div>
      <span style={{ color: pct === 100 ? color : '#445566', fontSize: 10, letterSpacing: '.06em', flexShrink: 0 }}>
        {uploaded}/{items.length} {pct === 100 ? '✓ Completo' : 'subidas'}
      </span>
    </div>
  )
}

// ── FilterBtn ─────────────────────────────────────────────
function FilterBtn({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: active ? hex2rgba(color, .1) : 'rgba(255,255,255,.03)', border: `1px solid ${active ? hex2rgba(color, .35) : 'rgba(255,255,255,.08)'}`, color: active ? color : '#445566', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', transition: 'all .2s' }}>{label}</button>
  )
}

// ── CategoryTab ───────────────────────────────────────────
function CategoryTab({ catId, images, onUpload, onDelete }: { catId: string; images: ImageStore; onUpload: (k: string, url: string) => void; onDelete: (k: string) => void }) {
  const meta = CATEGORY_META[catId]!
  const rawItems = CATALOG[catId] ?? []
  const items: SlotItem[] = rawItems.map(i => ({ ...i, cat: catId }))
  const [worldFilter, setWorldFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [onlyMissing, setOnlyMissing] = useState(false)

  const worlds = useMemo(() => [...new Set(items.map(i => i.world))], [catId])
  const filtered = useMemo(() => items.filter(i => {
    if (worldFilter !== 'all' && i.world !== worldFilter) return false
    if (search && !i.label.toLowerCase().includes(search.toLowerCase())) return false
    if (onlyMissing && images[imageKey(catId, i.id)]) return false
    return true
  }), [items, worldFilter, search, onlyMissing, images, catId])

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <BulkUploadBar cat={catId} items={rawItems} onUpload={onUpload} color={meta.color} />
      <ProgressBar cat={catId} items={rawItems} images={images} color={meta.color} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…"
            style={{ width: '100%', background: 'rgba(8,10,20,.9)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '7px 12px 7px 32px', color: '#e0d8c8', fontSize: 11, outline: 'none', fontFamily: 'inherit' }} />
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#334455', fontSize: 12 }}>⌕</span>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <FilterBtn label="Todos" active={worldFilter === 'all'} color={meta.color} onClick={() => setWorldFilter('all')} />
          {worlds.map(w => {
            const p = WORLD_PALETTE[w] ?? { color: '#888', name: w }
            return <FilterBtn key={w} label={p.name} active={worldFilter === w} color={p.color} onClick={() => setWorldFilter(w)} />
          })}
        </div>
        <button onClick={() => setOnlyMissing(v => !v)} style={{ background: onlyMissing ? hex2rgba(meta.color, .1) : 'rgba(255,255,255,.03)', border: `1px solid ${onlyMissing ? hex2rgba(meta.color, .35) : 'rgba(255,255,255,.08)'}`, color: onlyMissing ? meta.color : '#445566', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase', transition: 'all .2s' }}>Solo pendientes</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>
        {filtered.map(item => (
          <UploadSlot key={item.id} item={item} images={images} onUpload={onUpload} onDelete={onDelete} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#334455', fontSize: 13 }}>
          {search ? `No hay resultados para "${search}"` : 'No hay imágenes pendientes.'}
        </div>
      )}
    </div>
  )
}

// ── DataTools ─────────────────────────────────────────────
function ToolBtn({ label, icon, onClick, color }: { label: string; icon: string; onClick: () => void; color: string }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 6, background: hov ? hex2rgba(color, .14) : hex2rgba(color, .07), border: `1px solid ${hov ? hex2rgba(color, .45) : hex2rgba(color, .22)}`, color: hov ? color : hex2rgba(color, .7), borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase', transition: 'all .2s' }}>
      <span style={{ fontSize: 12 }}>{icon}</span>{label}
    </button>
  )
}

function DataTools({ images, onImport }: { images: ImageStore; onImport: (data: ImageStore) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const usedKB = Math.round(JSON.stringify(images).length / 1024)
  const maxKB = 500

  const exportData = () => {
    const blob = new Blob([JSON.stringify(images, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `cosmere_images_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        onImport(data)
      } catch { alert('Error al leer el archivo JSON.') }
    }
    reader.readAsText(file)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '14px 18px', background: 'rgba(6,8,16,.9)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, marginBottom: 24 }}>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ color: '#e0d8c8', fontSize: 11, marginBottom: 4 }}>
          URLs almacenadas · <span style={{ color: usedKB > 400 ? '#e06060' : '#7cba65' }}>{usedKB} KB</span> / ~{maxKB} KB
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden', maxWidth: 280 }}>
          <div style={{ height: '100%', width: `${Math.min(usedKB / maxKB * 100, 100)}%`, background: usedKB > 400 ? '#e06060' : '#7cba65', borderRadius: 2, transition: 'width .4s' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <ToolBtn label="Exportar JSON" icon="↓" onClick={exportData} color="#7cba65" />
        <ToolBtn label="Importar JSON" icon="↑" onClick={() => fileRef.current?.click()} color="#4d8fd4" />
        <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
        <ToolBtn label="Limpiar todo" icon="✕" onClick={() => { if (confirm('¿Eliminar todas las URLs guardadas?')) onImport({}) }} color="#e06060" />
      </div>
    </div>
  )
}

// ── SummaryPanel ──────────────────────────────────────────
function SummaryPanel({ images }: { images: ImageStore }) {
  const total = Object.values(CATALOG).flat().length
  const uploaded = Object.keys(images).length
  const pct = total ? Math.round(uploaded / total * 100) : 0
  const cats = Object.entries(CATALOG).map(([id, items]) => ({
    id, items, meta: CATEGORY_META[id]!,
    count: items.filter(i => images[imageKey(id, i.id)]).length,
  }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10, marginBottom: 24 }}>
      <div style={{ gridColumn: '1/-1', background: 'rgba(6,8,16,.9)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 28, fontFamily: "var(--font-cinzel,'Cinzel',serif)", fontWeight: 700, color: '#c8b880' }}>{uploaded}</div>
        <div>
          <div style={{ color: '#c8b880', fontSize: 11, fontFamily: "var(--font-cinzel,'Cinzel',serif)", fontWeight: 600 }}>imágenes cargadas</div>
          <div style={{ color: '#445566', fontSize: 10 }}>de {total} disponibles en la galería</div>
        </div>
        <div style={{ marginLeft: 'auto', width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(200,184,128,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8b880', fontSize: 13, fontWeight: 700 }}>{pct}%</div>
      </div>
      {cats.map(({ id, items, meta, count }) => (
        <div key={id} style={{ background: 'rgba(6,8,16,.9)', border: `1px solid ${hex2rgba(meta.color, .15)}`, borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ color: meta.color, fontSize: 14 }}>{meta.icon}</span>
            <span style={{ color: '#e0d8c8', fontSize: 11, fontWeight: 500 }}>{meta.label}</span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
            <div style={{ height: '100%', width: `${items.length ? count / items.length * 100 : 0}%`, background: meta.color, borderRadius: 2, transition: 'width .4s' }} />
          </div>
          <div style={{ color: '#445566', fontSize: 9 }}>{count}/{items.length}</div>
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────
const TABS = Object.entries(CATEGORY_META).map(([id, m]) => ({ id, ...m }))

export default function ImagenesPage() {
  const [images, setImages] = useState<ImageStore>({})
  const [activeTab, setActiveTab] = useState('personajes')

  useEffect(() => { setImages(loadImages()) }, [])
  useEffect(() => { saveImages(images) }, [images])

  const handleUpload = useCallback((key: string, url: string) => {
    setImages(prev => ({ ...prev, [key]: url }))
  }, [])
  const handleDelete = useCallback((key: string) => {
    setImages(prev => { const next = { ...prev }; delete next[key]; return next })
  }, [])
  const handleImport = useCallback((data: ImageStore) => {
    setImages(data)
  }, [])

  const activeMeta = CATEGORY_META[activeTab]!

  return (
    <div style={{ minHeight: '100vh', background: '#010306' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes pulse  { 0%,100% { opacity:.5 } 50% { opacity:1 } }
      `}</style>

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(1,3,6,.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/galeria" style={{ color: '#445566', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none' }}>← Galería</Link>
            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,.08)' }} />
            <span style={{ color: '#c8b880', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase' }}>Cosmere</span>
            <span style={{ color: '#223344' }}>›</span>
            <h1 style={{ color: '#f0e8d8', fontSize: 15, fontFamily: "var(--font-cinzel,'Cinzel',serif)", fontWeight: 700, letterSpacing: '.06em' }}>Gestor de Imágenes</h1>
          </div>
          <Link href="/" style={{ color: '#334455', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none' }}>↗ Atlas</Link>
        </div>

        {/* Category tabs */}
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', borderTop: '1px solid rgba(255,255,255,.04)' }}>
          {TABS.map(t => {
            const items = CATALOG[t.id] ?? []
            const n = items.filter(i => images[imageKey(t.id, i.id)]).length
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', fontSize: 11, letterSpacing: '.07em', textTransform: 'uppercase', color: activeTab === t.id ? t.color : '#445566', borderBottom: activeTab === t.id ? `2px solid ${t.color}` : '2px solid transparent', transition: 'all .18s', marginBottom: -1 }}>
                <span style={{ fontSize: 13 }}>{t.icon}</span>
                {t.label}
                {n > 0 && <span style={{ background: hex2rgba(t.color, .15), color: t.color, borderRadius: 10, padding: '1px 6px', fontSize: 8, letterSpacing: '.04em' }}>{n}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 32px 80px' }}>
        <SummaryPanel images={images} />
        <DataTools images={images} onImport={handleImport} />
        <CategoryTab key={activeTab} catId={activeTab} images={images} onUpload={handleUpload} onDelete={handleDelete} />
      </div>
    </div>
  )
}
