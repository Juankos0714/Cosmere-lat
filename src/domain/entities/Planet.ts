import type { SystemId, PlanetType } from './System'

export type PlanetId = string & { readonly _brand: 'PlanetId' }

export interface Planet {
  readonly id: PlanetId
  readonly systemId: SystemId
  readonly name: string
  readonly type: PlanetType
  readonly radius: number
  readonly orbitRadius: number
  readonly orbitSpeed: number
  readonly color: string
  readonly tilt: number
  readonly desc: string
  readonly hasAtmosphere?: boolean
  readonly atmosphereColor?: string
  readonly hasMoon?: boolean
  readonly moonName?: string
  readonly moonOrbit?: number
  readonly moonRadius?: number
  readonly moonSpeed?: number
  readonly hasStorm?: boolean
  readonly hasClouds?: boolean
  readonly cloudColor?: string
  readonly isTidallyLocked?: boolean
  readonly hasSpirits?: boolean
  readonly hasExtraMoons?: boolean
}
