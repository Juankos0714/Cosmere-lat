import type { ISystemRepository } from '@/domain/repositories/ISystemRepository'
import type { System, SystemId } from '@/domain/entities/System'
import type { Planet, PlanetId } from '@/domain/entities/Planet'
import type { Book, BookId } from '@/domain/entities/Book'
import type { ShardConnection } from '@/domain/entities/ShardConnection'
import { toSystemId } from '@/domain/entities/System'

interface RawPlanet {
  id: string; name: string; type: string; radius: number; orbitRadius: number
  orbitSpeed: number; color: string; tilt: number; desc: string
  hasAtmosphere?: boolean; atmosphereColor?: string; hasMoon?: boolean
  moonName?: string; moonOrbit?: number; moonRadius?: number; moonSpeed?: number
  hasStorm?: boolean; hasClouds?: boolean; cloudColor?: string
  isTidallyLocked?: boolean; hasSpirits?: boolean; hasExtraMoons?: boolean
}

interface RawBook {
  id: string; title: string; subtitle: string; year: string
  color: string; pov: string[]; summary: string
}

interface RawConnection { targetId: string; label: string; desc: string }

interface RawSystem {
  id: string; name: string; subtitle: string; tagline: string
  description: string; shard: string; magic: string
  galacticPos: { x: number; y: number; z: number }
  color: string; glowHex: number; starType: string
  planets: RawPlanet[]; books: RawBook[]; novellas: string[]
  connections: RawConnection[]
}

let cache: RawSystem[] | null = null

async function load(): Promise<RawSystem[]> {
  if (cache) return cache
  const res = await fetch('/data/systems.json')
  const json = (await res.json()) as { systems: RawSystem[] }
  cache = json.systems
  return cache
}

export class StaticSystemRepository implements ISystemRepository {
  async getAll(): Promise<System[]> {
    const raw = await load()
    return raw.map(r => ({
      id: toSystemId(r.id), name: r.name, subtitle: r.subtitle,
      tagline: r.tagline, description: r.description, shard: r.shard,
      magic: r.magic, galacticPos: r.galacticPos, color: r.color,
      glowHex: r.glowHex, starType: r.starType,
    }))
  }

  async getById(id: SystemId): Promise<System | null> {
    const all = await this.getAll()
    return all.find(s => s.id === id) ?? null
  }

  async getPlanets(systemId: SystemId): Promise<Planet[]> {
    const raw = await load()
    const sys = raw.find(r => r.id === systemId)
    if (!sys) return []
    return sys.planets.map(p => ({
      ...(p as unknown as Omit<Planet, 'id' | 'systemId'>),
      id: p.id as PlanetId,
      systemId,
      type: p.type as Planet['type'],
    }))
  }

  async getBooks(systemId: SystemId): Promise<Book[]> {
    const raw = await load()
    const sys = raw.find(r => r.id === systemId)
    if (!sys) return []
    return sys.books.map(b => ({
      id: b.id as BookId, systemId, title: b.title, subtitle: b.subtitle,
      year: b.year, color: b.color, pov: b.pov, summary: b.summary,
    }))
  }

  async getConnections(systemId: SystemId): Promise<ShardConnection[]> {
    const raw = await load()
    const sys = raw.find(r => r.id === systemId)
    if (!sys) return []
    return sys.connections.map(c => ({
      sourceSystemId: systemId,
      targetSystemId: toSystemId(c.targetId),
      label: c.label,
      desc: c.desc,
    }))
  }

  async getNovellas(systemId: SystemId): Promise<string[]> {
    const raw = await load()
    return raw.find(r => r.id === systemId)?.novellas ?? []
  }
}
