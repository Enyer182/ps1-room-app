import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function randomFromSeed(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function buildPositions(count: number, spreadX: number, spreadY: number, spreadZ: number, yOffset: number) {
  const vertices = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3
    vertices[i3] = (randomFromSeed(i3 + 1) - 0.5) * spreadX
    vertices[i3 + 1] = randomFromSeed(i3 + 2) * spreadY + yOffset
    vertices[i3 + 2] = (randomFromSeed(i3 + 3) - 0.5) * spreadZ
  }
  return vertices
}

function createDustSpriteTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 58)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.6)')
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.2)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

export function DustParticles() {
  const nearLayer = useMemo(() => buildPositions(380, 11, 4.2, 9.4, 0.2), [])
  const farLayer = useMemo(() => buildPositions(220, 12.6, 4.6, 10.8, 0.1), [])
  const spriteTexture = useMemo(() => createDustSpriteTexture(), [])
  const nearRef = useRef<THREE.Points>(null)
  const farRef = useRef<THREE.Points>(null)

  useEffect(() => {
    return () => {
      spriteTexture.dispose()
    }
  }, [spriteTexture])

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    if (nearRef.current) {
      nearRef.current.rotation.y += delta * 0.01
      nearRef.current.position.y = 0.04 + Math.sin(t * 0.23) * 0.02
    }
    if (farRef.current) {
      farRef.current.rotation.y -= delta * 0.006
      farRef.current.position.y = 0.02 + Math.sin(t * 0.19 + 1.1) * 0.015
    }
  })

  return (
    <>
      <points ref={farRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[farLayer, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={spriteTexture}
          transparent
          alphaTest={0.02}
          depthWrite={false}
          opacity={0.12}
          size={0.022}
          color="#a7bfd8"
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={nearRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nearLayer, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={spriteTexture}
          transparent
          alphaTest={0.02}
          depthWrite={false}
          opacity={0.2}
          size={0.03}
          color="#f2d6af"
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}
