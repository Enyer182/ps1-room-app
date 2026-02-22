import { useEffect, useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { makeEmulatorUrl } from '../../utils/emulator'
import type { Ps1Game } from '../../types/emulator'

const TV_IFRAME_WIDTH = 900
const TV_IFRAME_HEIGHT = 675

function postResumeMessage(targetWindow: Window | null) {
  if (!targetWindow) {
    return
  }

  targetWindow.postMessage({ type: 'nostalgia:resume' }, window.location.origin)
  window.setTimeout(() => {
    targetWindow.postMessage({ type: 'nostalgia:resume' }, window.location.origin)
  }, 120)
}

function postIframeMessage(targetWindow: Window | null, payload: Record<string, unknown>) {
  if (!targetWindow) {
    return
  }
  targetWindow.postMessage(payload, window.location.origin)
}

export function ConsoleTV({
  game,
  biosUrl,
  poweredOn,
  bootToken,
}: {
  game: Ps1Game
  biosUrl?: string
  poweredOn: boolean
  bootToken: number
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const iframeSrc = useMemo(() => {
    if (!poweredOn) {
      return ''
    }

    const romSource = game.romPath.startsWith('blob:')
      ? game.romPath
      : `${window.location.origin}${game.romPath}`
    const resolvedBios = biosUrl?.startsWith('blob:')
      ? biosUrl
      : biosUrl
        ? `${window.location.origin}${biosUrl}`
        : undefined

    return makeEmulatorUrl(
      romSource,
      game.title,
      resolvedBios,
      game.core ?? 'psx',
      game.externalFilesToken,
      bootToken,
    )
  }, [biosUrl, game, poweredOn, bootToken])

  useEffect(() => {
    if (!poweredOn) {
      return
    }

    let hadHostFullscreen = false

    const notifyResume = () => {
      postResumeMessage(iframeRef.current?.contentWindow ?? null)
    }

    const onFullscreenChange = () => {
      const iframe = iframeRef.current
      const isIframeFullscreen = Boolean(iframe && document.fullscreenElement === iframe)

      postIframeMessage(iframe?.contentWindow ?? null, {
        type: 'nostalgia:host-fullscreen-state',
        active: isIframeFullscreen,
      })

      if (isIframeFullscreen) {
        hadHostFullscreen = true
        return
      }

      if (!hadHostFullscreen) {
        return
      }

      hadHostFullscreen = false
      notifyResume()
    }

    const onVisibilityChange = () => {
      if (!document.hidden) {
        notifyResume()
      }
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [poweredOn, bootToken])

  return (
    <group>
      <pointLight
        position={[0, 1.52, -3.98]}
        intensity={poweredOn ? 0.72 : 0.22}
        distance={6.6}
        color={poweredOn ? '#75cfff' : '#37495c'}
        decay={1.85}
      />

      <mesh position={[0, 1.52, -3.88]}>
        <boxGeometry args={[3.48, 2.5, 0.34]} />
        <meshStandardMaterial color="#16181d" metalness={0.25} roughness={0.72} />
      </mesh>

      <mesh position={[0, 1.52, -3.7]}>
        <planeGeometry args={[3.2, 2.28]} />
        <meshStandardMaterial color="#0f1217" roughness={0.8} />
      </mesh>

      <mesh position={[0, 1.52, -3.685]}>
        <planeGeometry args={[2.98, 2.08]} />
        <meshStandardMaterial
          color={poweredOn ? '#07090d' : '#040506'}
          emissive={poweredOn ? '#0d1318' : '#0a0c10'}
          emissiveIntensity={poweredOn ? 0.1 : 0.05}
        />
      </mesh>

      <mesh position={[-1.44, 0.52, -3.73]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color={poweredOn ? '#74ff8f' : '#2a4330'} emissive={poweredOn ? '#74ff8f' : '#2a4330'} />
      </mesh>

      {poweredOn ? (
        <Html
          transform
          position={[0, 1.52, -3.68]}
          distanceFactor={2.05}
          style={{ width: TV_IFRAME_WIDTH, height: TV_IFRAME_HEIGHT, pointerEvents: 'auto' }}
        >
          <div className="tv-frame">
            <iframe
              ref={iframeRef}
              key={`${game.id}-${bootToken}`}
              className="tv-iframe"
              title="PS1 Emulator"
              src={iframeSrc}
              allow="autoplay; gamepad; fullscreen"
              allowFullScreen
            />
          </div>
        </Html>
      ) : (
        <Html
          transform
          position={[0, 1.52, -3.68]}
          distanceFactor={2.05}
          style={{ width: TV_IFRAME_WIDTH, height: TV_IFRAME_HEIGHT, pointerEvents: 'none' }}
        >
          <div className="tv-frame tv-off-screen">TV OFF</div>
        </Html>
      )}
    </group>
  )
}
