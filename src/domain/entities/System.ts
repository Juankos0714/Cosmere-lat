export type SystemId = string & { readonly _brand: 'SystemId' }

export function toSystemId(s: string): SystemId {
  return s as SystemId
}

export type PlanetType =
  | 'roshar' | 'scadrial' | 'sel' | 'nalthis' | 'taldain'
  | 'lumar'  | 'komashi'  | 'canticle' | 'gas' | 'hellworld'

export interface GalacticPos {
  readonly x: number
  readonly y: number
  readonly z: number
}

export interface System {
  readonly id: SystemId
  readonly name: string
  readonly subtitle: string
  readonly tagline: string
  readonly description: string
  readonly shard: string
  readonly magic: string
  readonly galacticPos: GalacticPos
  readonly color: string
  readonly glowHex: number
  readonly starType: string
}
