import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { ViewMode } from '../../types/emulator'

export function CameraModeInitializer({ mode }: { mode: ViewMode }) {
  const { camera } = useThree()

  useEffect(() => {
    if (mode === 'observer') {
      camera.position.set(0, 2.05, 3.2)
      camera.lookAt(0, 1.45, -2.95)
      return
    }

    camera.position.set(0, 1.72, 2.35)
    camera.lookAt(0, 1.72, -2.2)
  }, [camera, mode])

  return null
}
