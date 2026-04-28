import type { SystemId } from './System'

export type FanartId = string & { readonly _brand: 'FanartId' }
export type FanartSource = 'artstation' | 'deviantart' | 'twitter' | 'reddit' | 'other'

export interface Fanart {
  readonly id: FanartId
  readonly systemId: SystemId
  readonly title: string
  readonly artist: string
  readonly artistUrl: string
  readonly source: FanartSource
  readonly sourceUrl: string
  readonly thumbnailPath: string
  readonly tags: readonly string[]
  readonly addedAt: string
}
