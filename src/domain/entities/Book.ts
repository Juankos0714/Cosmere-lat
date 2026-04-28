import type { SystemId } from './System'

export type BookId = string & { readonly _brand: 'BookId' }

export interface Book {
  readonly id: BookId
  readonly systemId: SystemId
  readonly title: string
  readonly subtitle: string
  readonly year: string
  readonly color: string
  readonly pov: readonly string[]
  readonly summary: string
}
