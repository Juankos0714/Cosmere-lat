import type { SystemId } from './System'

export interface ShardConnection {
  readonly sourceSystemId: SystemId
  readonly targetSystemId: SystemId
  readonly label: string
  readonly desc: string
}
