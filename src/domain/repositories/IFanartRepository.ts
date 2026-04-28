import type { Fanart, FanartId } from '../entities/Fanart'
import type { SystemId } from '../entities/System'

export interface IFanartRepository {
  getAll(): Promise<Fanart[]>
  getById(id: FanartId): Promise<Fanart | null>
  getBySystem(systemId: SystemId): Promise<Fanart[]>
  getByTag(tag: string): Promise<Fanart[]>
}
