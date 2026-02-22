import type { Ps1Game } from '../types/emulator'

export const DEFAULT_BIOS_URL = '/bios/openbios.bin'

export const DEFAULT_GAME_ID = 'bow'

export const GAMES: Ps1Game[] = [
  {
    id: 'bow',
    title: 'Bow and Arrow PSX',
    romPath: '/roms/bow_and_arrow/bow_and_arrow.bin',
    description: 'Homebrew PS1 remake by ABelliqueux/Schnappy.',
    sourceUrl: 'https://github.com/ABelliqueux/Bow_and_Arrow_psx',
    core: 'psx',
  },
  {
    id: 'nolibgs',
    title: 'Nolibgs Demo Disc',
    romPath: '/roms/nolibgs_demo/nolibgs_demo.bin',
    description: 'PS1 demo disc showcasing multiple homebrew features.',
    sourceUrl: 'https://github.com/ABelliqueux/nolibgs_demo',
    core: 'psx',
  },
]
