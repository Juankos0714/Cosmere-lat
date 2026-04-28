import { StaticSystemRepository } from './StaticSystemRepository'
import { StaticFanartRepository } from './StaticFanartRepository'
import { SystemService } from '@/domain/services/SystemService'
import { FanartService } from '@/domain/services/FanartService'

const systemRepo = new StaticSystemRepository()
const fanartRepo = new StaticFanartRepository()

export const systemService = new SystemService(systemRepo)
export const fanartService = new FanartService(fanartRepo)
