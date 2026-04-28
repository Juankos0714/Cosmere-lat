import type { ISystemRepository } from '../repositories/ISystemRepository'
import type { System, SystemId } from '../entities/System'
import type { Planet } from '../entities/Planet'
import type { Book } from '../entities/Book'
import type { ShardConnection } from '../entities/ShardConnection'

export interface SystemDetail {
  system: System
  planets: Planet[]
  books: Book[]
  connections: ShardConnection[]
  novellas: string[]
}

export class SystemService {
  constructor(private readonly repo: ISystemRepository) {}

  async getAllSystems(): Promise<System[]> {
    return this.repo.getAll()
  }

  async getSystemDetail(id: SystemId): Promise<SystemDetail | null> {
    const system = await this.repo.getById(id)
    if (!system) return null
    const [planets, books, connections, novellas] = await Promise.all([
      this.repo.getPlanets(id),
      this.repo.getBooks(id),
      this.repo.getConnections(id),
      this.repo.getNovellas(id),
    ])
    return { system, planets, books, connections, novellas }
  }

  async getRelatedSystems(id: SystemId): Promise<System[]> {
    const connections = await this.repo.getConnections(id)
    const targetIds = [...new Set(connections.map(c => c.targetSystemId))]
    const all = await this.repo.getAll()
    return all.filter(s => targetIds.includes(s.id))
  }

  async getTotalStats(): Promise<{ systems: number; books: number; planets: number }> {
    const all = await this.repo.getAll()
    let totalBooks = 0
    let totalPlanets = 0
    await Promise.all(
      all.map(async s => {
        const [books, planets] = await Promise.all([
          this.repo.getBooks(s.id),
          this.repo.getPlanets(s.id),
        ])
        totalBooks += books.length
        totalPlanets += planets.length
      }),
    )
    return { systems: all.length, books: totalBooks, planets: totalPlanets }
  }
}
