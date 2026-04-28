import type { IFanartRepository } from '@/domain/repositories/IFanartRepository'
import type { Fanart, FanartId, FanartSource } from '@/domain/entities/Fanart'
import type { SystemId } from '@/domain/entities/System'
import { toSystemId } from '@/domain/entities/System'

interface RawFanart {
  id: string; systemId: string; title: string; artist: string
  artistUrl: string; source: string; sourceUrl: string
  thumbnailPath: string; tags: string[]; addedAt: string
}

let cache: RawFanart[] | null = null

async function load(): Promise<RawFanart[]> {
  if (cache) return cache
  const res = await fetch('/data/fanarts.json')
  const json = (await res.json()) as { fanarts: RawFanart[] }
  cache = json.fanarts
  return cache
}

function toEntity(r: RawFanart): Fanart {
  return {
    id: r.id as FanartId,
    systemId: toSystemId(r.systemId),
    title: r.title,
    artist: r.artist,
    artistUrl: r.artistUrl,
    source: r.source as FanartSource,
    sourceUrl: r.sourceUrl,
    thumbnailPath: r.thumbnailPath,
    tags: r.tags,
    addedAt: r.addedAt,
  }
}

export class StaticFanartRepository implements IFanartRepository {
  async getAll(): Promise<Fanart[]> {
    return (await load()).map(toEntity)
  }

  async getById(id: FanartId): Promise<Fanart | null> {
    const all = await load()
    const found = all.find(f => f.id === id)
    return found ? toEntity(found) : null
  }

  async getBySystem(systemId: SystemId): Promise<Fanart[]> {
    const all = await load()
    return all.filter(f => f.systemId === systemId).map(toEntity)
  }

  async getByTag(tag: string): Promise<Fanart[]> {
    const all = await load()
    return all.filter(f => f.tags.includes(tag)).map(toEntity)
  }
}
