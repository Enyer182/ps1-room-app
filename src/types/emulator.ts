export type Ps1Core = 'psx'

export type CoreOverride = 'auto' | Ps1Core

export type ViewMode = 'observer' | 'first_person'

export type ControlAction = 'forward' | 'backward' | 'left' | 'right' | 'sprint'

export type Ps1Game = {
  id: string
  title: string
  romPath: string
  description: string
  sourceUrl: string
  core?: Ps1Core
  externalFilesToken?: string
}
