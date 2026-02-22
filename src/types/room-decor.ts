export type Vec3Tuple = [number, number, number]
export type Vec2Tuple = [number, number]
export type DecorTransformMode = 'translate' | 'rotate' | 'scale'

export type DecorModelTransform = {
  position: Vec3Tuple
  rotation: Vec3Tuple
  scale: Vec3Tuple
}

type RoomDecorBase = {
  id: string
  enabled?: boolean
  position: Vec3Tuple
  rotation?: Vec3Tuple
  scale?: number | Vec3Tuple
}

export type RoomDecorModelItem = RoomDecorBase & {
  kind: 'model'
  modelUrl: string
}

export type RoomDecorPosterItem = RoomDecorBase & {
  kind: 'poster'
  textureUrl: string
  size?: Vec2Tuple
  frameColor?: string
}

export type RoomDecorItem = RoomDecorModelItem | RoomDecorPosterItem
