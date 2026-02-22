import * as THREE from 'three'
import { useDisposableTexture } from '../../hooks/useDisposableTexture'
import { createCarpetTexture, createWallpaperTexture } from '../../utils/texture-factory'
import type { Ps1Game } from '../../types/emulator'
import { ConsoleTV } from './ConsoleTV'
import { DustParticles } from './DustParticles'
import { DynamicRoomDecor } from './DynamicRoomDecor'
import type { DecorModelTransform, DecorTransformMode, RoomDecorItem } from '../../types/room-decor'

export function Room({
  game,
  biosUrl,
  poweredOn,
  bootToken,
  decorItems,
  editorEnabled,
  selectedDecorId,
  transformMode,
  onSelectDecorItem,
  onDecorTransformCommit,
}: {
  game: Ps1Game
  biosUrl?: string
  poweredOn: boolean
  bootToken: number
  decorItems: RoomDecorItem[]
  editorEnabled: boolean
  selectedDecorId: string | null
  transformMode: DecorTransformMode
  onSelectDecorItem: (id: string) => void
  onDecorTransformCommit: (id: string, transform: DecorModelTransform) => void
}) {
  const carpetTexture = useDisposableTexture(createCarpetTexture)
  const wallpaperTexture = useDisposableTexture(createWallpaperTexture)

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[11.2, 8.8]} />
        <meshStandardMaterial map={carpetTexture} roughness={0.95} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.3]}>
        <planeGeometry args={[6.3, 3.8]} />
        <meshStandardMaterial color="#2a242d" roughness={0.92} />
      </mesh>

      <mesh position={[0, 2.12, -4.02]}>
        <boxGeometry args={[11.2, 4.24, 0.15]} />
        <meshStandardMaterial map={wallpaperTexture} color="#f2d9bf" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.52, -3.95]}>
        <boxGeometry args={[11.2, 1.04, 0.08]} />
        <meshStandardMaterial color="#3b2d2e" roughness={0.8} />
      </mesh>

      <mesh position={[0, 2.12, 4.02]}>
        <boxGeometry args={[11.2, 4.24, 0.15]} />
        <meshStandardMaterial map={wallpaperTexture} color="#cdb6a4" roughness={0.93} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[-5.53, 2.12, 0]}>
        <boxGeometry args={[0.15, 4.24, 8.5]} />
        <meshStandardMaterial map={wallpaperTexture} color="#b7a3a8" roughness={0.94} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[5.53, 2.12, 0]}>
        <boxGeometry args={[0.15, 4.24, 8.5]} />
        <meshStandardMaterial map={wallpaperTexture} color="#ba9f96" roughness={0.93} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 4.25, 0]}>
        <boxGeometry args={[11.2, 0.12, 8.5]} />
        <meshStandardMaterial color="#2b2f36" side={THREE.DoubleSide} />
      </mesh>

      <ConsoleTV game={game} biosUrl={biosUrl} poweredOn={poweredOn} bootToken={bootToken} />

      <DustParticles />
      <DynamicRoomDecor
        items={decorItems}
        editorEnabled={editorEnabled}
        selectedDecorId={selectedDecorId}
        transformMode={transformMode}
        onSelectDecorItem={onSelectDecorItem}
        onModelTransformCommit={onDecorTransformCommit}
      />
    </group>
  )
}
