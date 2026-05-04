'use client'

import { useState, useRef, useCallback } from 'react'
import { hex2rgba } from '@/shared/lib/colors'
import type { System } from '@/domain/entities/System'

interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
}

interface Props {
  systems: System[]
  onClose: () => void
  onUploaded: (result: UploadResult & { title: string; artist: string; artistUrl: string; systemId: string; tags: string }) => void
}

type UploadState = 'idle' | 'signing' | 'uploading' | 'done' | 'error'

export function FanartUploadModal({ systems, onClose, onUploaded }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<(UploadResult & { title: string; artist: string; artistUrl: string; systemId: string; tags: string }) | null>(null)

  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [artistUrl, setArtistUrl] = useState('')
  const [systemId, setSystemId] = useState(systems[0]?.id ?? '')
  const [tags, setTags] = useState('')

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setStatus('idle')
    setError(null)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setStatus('idle')
    setError(null)
  }, [])

  const upload = async () => {
    if (!file || !title.trim() || !artist.trim()) return
    setError(null)
    setProgress(0)

    try {
      setStatus('signing')
      const signRes = await fetch('/api/cloudinary/sign')
      if (!signRes.ok) throw new Error('No se pudo obtener la firma de Cloudinary')
      const { signature, timestamp, folder, apiKey, cloudName } = await signRes.json()

      setStatus('uploading')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('signature', signature)
      formData.append('timestamp', String(timestamp))
      formData.append('folder', folder)
      formData.append('api_key', apiKey)

      // XHR to track progress
      const uploadResult = await new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText)
            resolve({ url: data.secure_url, publicId: data.public_id, width: data.width, height: data.height })
          } else {
            reject(new Error(`Cloudinary: ${xhr.statusText}`))
          }
        })
        xhr.addEventListener('error', () => reject(new Error('Error de red al subir')))
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)
        xhr.send(formData)
      })

      const finalResult = { ...uploadResult, title, artist, artistUrl, systemId, tags }
      setResult(finalResult)
      setStatus('done')
      onUploaded(finalResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setStatus('error')
    }
  }

  const canUpload = file && title.trim() && artist.trim() && status !== 'signing' && status !== 'uploading'

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(1,3,6,.88)', backdropFilter: 'blur(12px)' }} />
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 600,
        background: 'rgba(5,8,18,.96)', border: '1px solid rgba(255,255,255,.1)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,.8)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#c8b880', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 2 }}>Cosmere · Fanarts</div>
            <h2 style={{ color: '#f0e8d8', fontSize: 16, fontFamily: "var(--font-cinzel,'Cinzel',serif)", fontWeight: 700 }}>Subir fanart</h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#7788aa', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Drop zone */}
          {status !== 'done' && (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${preview ? 'rgba(77,143,212,.4)' : 'rgba(255,255,255,.1)'}`,
                borderRadius: 12, padding: preview ? 0 : '32px 16px',
                textAlign: 'center', cursor: 'pointer', marginBottom: 20,
                background: preview ? 'none' : 'rgba(255,255,255,.02)',
                overflow: 'hidden', transition: 'border-color .2s',
              }}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }} />
              ) : (
                <>
                  <div style={{ fontSize: 28, marginBottom: 8, opacity: .4 }}>↑</div>
                  <div style={{ color: '#7788aa', fontSize: 12 }}>Arrastra una imagen o haz clic</div>
                  <div style={{ color: '#445566', fontSize: 10, marginTop: 4 }}>JPG · PNG · WEBP · hasta 10MB</div>
                </>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />

          {/* Done state */}
          {status === 'done' && result && (
            <div style={{ marginBottom: 20 }}>
              <img src={result.url} alt={result.title} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: 16 }} />
              <div style={{ background: 'rgba(77,143,212,.06)', border: '1px solid rgba(77,143,212,.2)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ color: '#7cba65', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Imagen subida</div>
                <div style={{ color: '#7788aa', fontSize: 10, marginBottom: 4 }}>URL Cloudinary:</div>
                <div style={{
                  background: 'rgba(0,0,0,.3)', borderRadius: 6, padding: '8px 10px',
                  fontFamily: 'monospace', fontSize: 10, color: '#4d8fd4',
                  wordBreak: 'break-all', userSelect: 'all',
                }}>{result.url}</div>
                <div style={{ color: '#445566', fontSize: 10, marginTop: 10, lineHeight: 1.5 }}>
                  Copia esta URL y usala como <code style={{ color: '#c8b880' }}>thumbnailPath</code> en <code style={{ color: '#c8b880' }}>public/data/fanarts.json</code>
                </div>
              </div>
            </div>
          )}

          {/* Metadata fields */}
          {status !== 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Título" value={title} onChange={setTitle} placeholder="Kaladin en la tormenta" />
              <Field label="Artista" value={artist} onChange={setArtist} placeholder="Nombre del artista" />
              <Field label="URL del artista" value={artistUrl} onChange={setArtistUrl} placeholder="https://artstation.com/..." />

              <div>
                <label style={{ color: '#445566', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Sistema planetario</label>
                <select
                  value={systemId}
                  onChange={e => setSystemId(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '8px 12px', color: '#c8d0d8', fontSize: 12, outline: 'none', cursor: 'pointer' }}
                >
                  {systems.map(s => (
                    <option key={s.id} value={s.id} style={{ background: '#0a0c14' }}>{s.name.replace('Sistema ', '')}</option>
                  ))}
                </select>
              </div>

              <Field label="Tags (separados por coma)" value={tags} onChange={setTags} placeholder="kaladin, windrunner, stormlight" />
            </div>
          )}

          {/* Progress bar */}
          {status === 'uploading' && (
            <div style={{ marginTop: 16, background: 'rgba(255,255,255,.05)', borderRadius: 4, overflow: 'hidden', height: 4 }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#4d8fd4', transition: 'width .2s', borderRadius: 4 }} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(220,80,60,.08)', border: '1px solid rgba(220,80,60,.25)', borderRadius: 8, color: '#e06060', fontSize: 11 }}>{error}</div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            {status === 'done' ? (
              <button
                onClick={onClose}
                style={{ padding: '9px 20px', background: 'rgba(77,143,212,.12)', border: '1px solid rgba(77,143,212,.35)', borderRadius: 8, color: '#4d8fd4', fontSize: 12, cursor: 'pointer' }}
              >
                Cerrar
              </button>
            ) : (
              <>
                <button onClick={onClose} style={{ padding: '9px 20px', background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: '#7788aa', fontSize: 12, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button
                  onClick={upload}
                  disabled={!canUpload}
                  style={{
                    padding: '9px 20px', borderRadius: 8, fontSize: 12, cursor: canUpload ? 'pointer' : 'not-allowed',
                    background: canUpload ? 'rgba(77,143,212,.15)' : 'rgba(255,255,255,.04)',
                    border: canUpload ? '1px solid rgba(77,143,212,.4)' : '1px solid rgba(255,255,255,.08)',
                    color: canUpload ? '#4d8fd4' : '#445566',
                    transition: 'all .2s',
                  }}
                >
                  {status === 'signing' ? 'Firmando…' : status === 'uploading' ? `Subiendo ${progress}%` : 'Subir a Cloudinary'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label style={{ color: '#445566', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '8px 12px', color: '#c8d0d8', fontSize: 12, outline: 'none', fontFamily: 'inherit' }}
      />
    </div>
  )
}
