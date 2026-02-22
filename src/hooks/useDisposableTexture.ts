import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

export function useDisposableTexture<T extends THREE.Texture>(factory: () => T) {
  const texture = useMemo(() => factory(), [factory])

  useEffect(() => {
    return () => {
      texture.dispose()
    }
  }, [texture])

  return texture
}
