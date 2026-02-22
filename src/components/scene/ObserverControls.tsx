import { useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export function ObserverControls() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  useFrame(() => {
    const camera = controlsRef.current?.object as THREE.Camera | undefined
    if (!camera) {
      return
    }

    const clampedX = THREE.MathUtils.clamp(camera.position.x, -4.35, 4.35)
    const clampedY = THREE.MathUtils.clamp(camera.position.y, 1.7, 3.35)
    const clampedZ = THREE.MathUtils.clamp(camera.position.z, -1.95, 3.25)

    if (clampedX !== camera.position.x || clampedY !== camera.position.y || clampedZ !== camera.position.z) {
      camera.position.set(clampedX, clampedY, clampedZ)
      controlsRef.current?.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[0, 1.44, -3.32]}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={4.5}
      maxDistance={5.9}
      minPolarAngle={1.03}
      maxPolarAngle={1.26}
      minAzimuthAngle={-0.48}
      maxAzimuthAngle={0.48}
    />
  )
}
