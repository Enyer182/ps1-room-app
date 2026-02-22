import type { Ps1Core } from '../types/emulator'

export function makeEmulatorUrl(
  romUrl: string,
  gameTitle: string,
  biosUrl?: string,
  core: Ps1Core = 'psx',
  externalFilesToken?: string,
  sessionToken?: number,
) {
  const params = new URLSearchParams({
    rom: romUrl,
    title: gameTitle,
    core,
  })
  if (biosUrl) {
    params.set('bios', biosUrl)
  }
  if (externalFilesToken) {
    params.set('extrasToken', externalFilesToken)
  }
  if (typeof sessionToken === 'number') {
    params.set('v', String(sessionToken))
  }
  return `/emulator-shell.html?${params.toString()}`
}
