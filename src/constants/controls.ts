import type { ControlAction } from '../types/emulator'

export const CONTROL_MAP: { name: ControlAction; keys: string[] }[] = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'sprint', keys: ['ShiftLeft', 'ShiftRight'] },
]
