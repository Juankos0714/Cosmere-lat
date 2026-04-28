import type { IFanartRepository } from '../repositories/IFanartRepository'
import type { Fanart } from '../entities/Fanart'
import type { SystemId } from '../entities/System'

export class FanartService {
  constructor(private readonly repo: IFanartRepository) {}

  async getAll(): Promise<Fanart[]> {
    return this.repo.getAll()
  }

  async getBySystem(systemId: SystemId): Promise<Fanart[]> {
    return this.repo.getBySystem(systemId)
  }

  async getByTag(tag: string): Promise<Fanart[]> {
    return this.repo.getByTag(tag)
  }

  async getGroupedBySystem(): Promise<Map<SystemId, Fanart[]>> {
    const all = await this.repo.getAll()
    const map = new Map<SystemId, Fanart[]>()
    for (const fanart of all) {
      const existing = map.get(fanart.systemId) ?? []
      map.set(fanart.systemId, [...existing, fanart])
    }
    return map
  }
}
