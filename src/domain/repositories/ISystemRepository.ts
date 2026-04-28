import type { System, SystemId } from '../entities/System'
import type { Planet } from '../entities/Planet'
import type { Book } from '../entities/Book'
import type { ShardConnection } from '../entities/ShardConnection'

export interface ISystemRepository {
  getAll(): Promise<System[]>
  getById(id: SystemId): Promise<System | null>
  getPlanets(systemId: SystemId): Promise<Planet[]>
  getBooks(systemId: SystemId): Promise<Book[]>
  getConnections(systemId: SystemId): Promise<ShardConnection[]>
  getNovellas(systemId: SystemId): Promise<string[]>
}
