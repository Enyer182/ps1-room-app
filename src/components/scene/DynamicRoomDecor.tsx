import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { TransformControls, useGLTF, useTexture } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type {
  DecorModelTransform,
  DecorTransformMode,
  RoomDecorItem,
  RoomDecorModelItem,
  RoomDecorPosterItem,
  Vec3Tuple,
} from '../../types/room-decor'

class DecorItemBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}

function asScaleTuple(scale: RoomDecorItem['scale']): [number, number, number] {
  if (typeof scale === 'number') {
    return [scale, scale, scale]
  }
  if (Array.isArray(scale) && scale.length === 3) {
    return [scale[0], scale[1], scale[2]]
  }
  return [1, 1, 1]
}

function roundTo3(value: number) {
  return Math.round(value * 1000) / 1000
}

function toTuple(vector: THREE.Vector3): Vec3Tuple {
  return [roundTo3(vector.x), roundTo3(vector.y), roundTo3(vector.z)]
}

function toEulerTuple(rotation: THREE.Euler): Vec3Tuple {
  return [roundTo3(rotation.x), roundTo3(rotation.y), roundTo3(rotation.z)]
}

function DecorModel({
  item,
  editorEnabled,
  selected,
  transformMode,
  onSelect,
  onTransformCommit,
}: {
  item: RoomDecorModelItem
  editorEnabled: boolean
  selected: boolean
  transformMode: DecorTransformMode
  onSelect?: (id: string) => void
  onTransformCommit?: (id: string, transform: DecorModelTransform) => void
}) {
  const gltf = useGLTF(item.modelUrl)
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene])
  const groupRef = useRef<THREE.Group>(null)
  const [transformObject, setTransformObject] = useState<THREE.Object3D | null>(null)

  useEffect(() => {
    if (groupRef.current) {
      setTransformObject(groupRef.current)
    }
  }, [])

  useEffect(() => {
    const group = groupRef.current
    if (!group) {
      return
    }

    group.position.set(item.position[0], item.position[1], item.position[2])
    const rotation = item.rotation ?? [0, 0, 0]
    group.rotation.set(rotation[0], rotation[1], rotation[2])
    const scale = asScaleTuple(item.scale)
    group.scale.set(scale[0], scale[1], scale[2])
  }, [item.position, item.rotation, item.scale])

  const commitTransform = useCallback(() => {
    const group = groupRef.current
    if (!group || !onTransformCommit) {
      return
    }

    onTransformCommit(item.id, {
      position: toTuple(group.position),
      rotation: toEulerTuple(group.rotation),
      scale: toTuple(group.scale),
    })
  }, [item.id, onTransformCommit])

  const selectThisModel = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!editorEnabled || !onSelect) {
        return
      }
      event.stopPropagation()
      onSelect(item.id)
    },
    [editorEnabled, item.id, onSelect],
  )

  return (
    <>
      <group ref={groupRef} onPointerDown={selectThisModel}>
        <primitive object={model} />
      </group>
      {editorEnabled && selected && transformObject ? (
        <TransformControls object={transformObject} mode={transformMode} size={0.8} onMouseUp={commitTransform} />
      ) : null}
    </>
  )
}

function DecorPoster({ item }: { item: RoomDecorPosterItem }) {
  const texture = useTexture(item.textureUrl)

  const size = item.size ?? [1.1, 1.6]
  const frameColor = item.frameColor ?? '#111216'
  const posterTexture = useMemo(() => {
    const cloned = texture.clone()
    cloned.colorSpace = THREE.SRGBColorSpace
    cloned.anisotropy = 8
    cloned.minFilter = THREE.LinearMipmapLinearFilter
    cloned.magFilter = THREE.LinearFilter
    cloned.generateMipmaps = true
    cloned.needsUpdate = true
    return cloned
  }, [texture])

  useEffect(() => {
    return () => {
      posterTexture.dispose()
    }
  }, [posterTexture])

  return (
    <group position={item.position} rotation={item.rotation ?? [0, 0, 0]} scale={asScaleTuple(item.scale)}>
      <mesh position={[0, 0, 0.006]} renderOrder={3}>
        <planeGeometry args={size} />
        <meshStandardMaterial
          map={posterTexture}
          roughness={0.78}
          metalness={0.04}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-2}
        />
      </mesh>
      <mesh position={[0, 0, -0.02]} renderOrder={2}>
        <boxGeometry args={[size[0] + 0.05, size[1] + 0.05, 0.02]} />
        <meshStandardMaterial color={frameColor} roughness={0.82} metalness={0.16} />
      </mesh>
    </group>
  )
}

export function DynamicRoomDecor({
  items,
  editorEnabled = false,
  selectedDecorId = null,
  transformMode = 'translate',
  onSelectDecorItem,
  onModelTransformCommit,
}: {
  items: RoomDecorItem[]
  editorEnabled?: boolean
  selectedDecorId?: string | null
  transformMode?: DecorTransformMode
  onSelectDecorItem?: (id: string) => void
  onModelTransformCommit?: (id: string, transform: DecorModelTransform) => void
}) {
  if (!items.length) {
    return null
  }

  return (
    <>
      {items.map((item) => (
        <DecorItemBoundary key={item.id}>
          <Suspense fallback={null}>
            {item.kind === 'model' ? (
              <DecorModel
                item={item}
                editorEnabled={editorEnabled}
                selected={selectedDecorId === item.id}
                transformMode={transformMode}
                onSelect={onSelectDecorItem}
                onTransformCommit={onModelTransformCommit}
              />
            ) : (
              <DecorPoster item={item} />
            )}
          </Suspense>
        </DecorItemBoundary>
      ))}
    </>
  )
}
