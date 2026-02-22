import { Suspense } from 'react'
import { CameraModeInitializer } from './CameraModeInitializer'
import { FirstPersonControlsRig } from './FirstPersonControlsRig'
import { ObserverControls } from './ObserverControls'
import { Room } from './Room'
import type { Ps1Game, ViewMode } from '../../types/emulator'
import type { DecorModelTransform, DecorTransformMode, RoomDecorItem } from '../../types/room-decor'

export function Scene({
  game,
  biosUrl,
  poweredOn,
  bootToken,
  viewMode,
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
  viewMode: ViewMode
  decorItems: RoomDecorItem[]
  editorEnabled: boolean
  selectedDecorId: string | null
  transformMode: DecorTransformMode
  onSelectDecorItem: (id: string) => void
  onDecorTransformCommit: (id: string, transform: DecorModelTransform) => void
}) {
  return (
    <>
      <color attach="background" args={['#120d16']} />
      <fog attach="fog" args={['#120d16', 6, 18]} />

      <ambientLight intensity={0.34} color="#e2d2b8" />
      <hemisphereLight intensity={0.55} color="#ffe2b8" groundColor="#1c1123" />
      <pointLight position={[0, 3.95, -0.12]} intensity={1.55} distance={13.5} color="#ffdcae" decay={1.7} />
      <pointLight position={[0, 2.08, -2.86]} intensity={2.5} distance={8.2} color="#ffdca5" decay={1.8} />
      <pointLight position={[-4.25, 2.35, -0.4]} intensity={1.15} distance={6.1} color="#5ea9ff" decay={1.9} />
      <pointLight position={[3.65, 2.16, -0.95]} intensity={0.92} distance={5.2} color="#ffb181" decay={2} />
      <spotLight
        position={[0.1, 3.92, -0.1]}
        angle={0.62}
        penumbra={0.7}
        intensity={1.05}
        distance={12}
        decay={1.65}
        color="#ffe2ba"
      />

      <Suspense fallback={null}>
        <Room
          game={game}
          biosUrl={biosUrl}
          poweredOn={poweredOn}
          bootToken={bootToken}
          decorItems={decorItems}
          editorEnabled={editorEnabled}
          selectedDecorId={selectedDecorId}
          transformMode={transformMode}
          onSelectDecorItem={onSelectDecorItem}
          onDecorTransformCommit={onDecorTransformCommit}
        />
      </Suspense>
      <CameraModeInitializer mode={viewMode} />
      {viewMode === 'observer' ? <ObserverControls /> : <FirstPersonControlsRig />}
    </>
  )
}
