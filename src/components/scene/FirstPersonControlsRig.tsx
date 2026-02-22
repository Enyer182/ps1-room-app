import { useRef } from 'react'
import { PointerLockControls, useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib'
import type { ControlAction } from '../../types/emulator'

export function FirstPersonControlsRig() {
  const controlsRef = useRef<PointerLockControlsImpl | null>(null)
  const [, getKeys] = useKeyboardControls<ControlAction>()
  const forwardRef = useRef(new THREE.Vector3())
  const rightRef = useRef(new THREE.Vector3())
  const moveRef = useRef(new THREE.Vector3())

  useFrame(({ camera }, delta) => {
    const controls = controlsRef.current
    if (!controls?.isLocked) {
      return
    }

    const move = moveRef.current
    const forward = forwardRef.current
    const right = rightRef.current
    const { forward: goForward, backward, left, right: goRight, sprint } = getKeys()
    move.set(0, 0, 0)

    if (goForward) {
      move.z += 1
    }
    if (backward) {
      move.z -= 1
    }
    if (left) {
      move.x -= 1
    }
    if (goRight) {
      move.x += 1
    }

    if (move.lengthSq() === 0) {
      return
    }

    move.normalize()

    forward.set(0, 0, -1).applyQuaternion(camera.quaternion)
    forward.y = 0
    forward.normalize()
    right.set(-forward.z, 0, forward.x).normalize()

    const speed = sprint ? 3.9 : 2.3
    camera.position.addScaledVector(forward, move.z * speed * delta)
    camera.position.addScaledVector(right, move.x * speed * delta)

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -4.45, 4.45)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -3.55, 3.05)
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 1.68, 1.88)
  })

  return <PointerLockControls ref={controlsRef} makeDefault />
}
