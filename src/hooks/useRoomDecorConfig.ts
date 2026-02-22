import { useEffect, useState } from 'react'
import { DEFAULT_ROOM_DECOR_ITEMS, ROOM_DECOR_CONFIG_URL } from '../constants/room-decor'
import type { RoomDecorItem, Vec2Tuple, Vec3Tuple } from '../types/room-decor'

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function asVec3(value: unknown): Vec3Tuple | null {
  if (!Array.isArray(value) || value.length !== 3 || !value.every(isNumber)) {
    return null
  }
  return [value[0], value[1], value[2]]
}

function asVec2(value: unknown): Vec2Tuple | null {
  if (!Array.isArray(value) || value.length !== 2 || !value.every(isNumber)) {
    return null
  }
  return [value[0], value[1]]
}

function normalizeScale(value: unknown): number | Vec3Tuple | undefined {
  if (typeof value === 'undefined') {
    return undefined
  }
  if (isNumber(value)) {
    return value
  }
  const vec = asVec3(value)
  return vec ?? undefined
}

function parseDecorItem(entry: unknown): RoomDecorItem | null {
  if (!entry || typeof entry !== 'object') {
    return null
  }

  const item = entry as Record<string, unknown>
  const id = typeof item.id === 'string' ? item.id : null
  const kind = typeof item.kind === 'string' ? item.kind : null
  const position = asVec3(item.position)

  if (!id || !kind || !position) {
    return null
  }

  const rotation = asVec3(item.rotation) ?? undefined
  const scale = normalizeScale(item.scale)
  const enabled = typeof item.enabled === 'boolean' ? item.enabled : true

  if (kind === 'model') {
    const modelUrl = typeof item.modelUrl === 'string' ? item.modelUrl : null
    if (!modelUrl) {
      return null
    }
    return { id, kind: 'model', modelUrl, position, rotation, scale, enabled }
  }

  if (kind === 'poster') {
    const textureUrl = typeof item.textureUrl === 'string' ? item.textureUrl : null
    if (!textureUrl) {
      return null
    }
    const size = asVec2(item.size) ?? [1.1, 1.6]
    const frameColor = typeof item.frameColor === 'string' ? item.frameColor : '#111216'
    return {
      id,
      kind: 'poster',
      textureUrl,
      position,
      rotation,
      scale,
      size,
      frameColor,
      enabled,
    }
  }

  return null
}

function parseDecorPayload(payload: unknown) {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: unknown[] }).items
      : null

  if (!rawItems) {
    return []
  }

  return rawItems.map(parseDecorItem).filter((item): item is RoomDecorItem => Boolean(item && item.enabled !== false))
}

export function useRoomDecorConfig() {
  const [items, setItems] = useState<RoomDecorItem[]>(DEFAULT_ROOM_DECOR_ITEMS)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const response = await fetch(ROOM_DECOR_CONFIG_URL, { cache: 'no-store' })
        if (!response.ok) {
          return
        }
        const payload = await response.json()
        const parsedItems = parseDecorPayload(payload)
        if (!cancelled) {
          setItems(parsedItems)
        }
      } catch {
        // Keep defaults when room config is missing or invalid.
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return items
}
