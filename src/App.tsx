import { useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { CONTROL_MAP } from './constants/controls'
import { Scene } from './components/scene/Scene'
import { HudPanel } from './components/ui/HudPanel'
import { StartOverlay } from './components/ui/StartOverlay'
import { useEmulatorSession } from './hooks/useEmulatorSession'
import { useGamepadLabel } from './hooks/useGamepadLabel'
import { useStartupProgress } from './hooks/useStartupProgress'
import { playPsOneStyleChime } from './utils/audio'
import { useRoomDecorConfig } from './hooks/useRoomDecorConfig'
import type { DecorModelTransform, DecorTransformMode, RoomDecorItem, RoomDecorModelItem } from './types/room-decor'
import './App.css'

function App() {
  const [experienceStarted, setExperienceStarted] = useState(false)
  const [hudOpen, setHudOpen] = useState(true)
  const [editorEnabled, setEditorEnabled] = useState(false)
  const [transformMode, setTransformMode] = useState<DecorTransformMode>('translate')
  const [selectedDecorId, setSelectedDecorId] = useState<string | null>(null)
  const { progress: startProgress, ready: startReady } = useStartupProgress()
  const loadedDecorItems = useRoomDecorConfig()
  const [decorItems, setDecorItems] = useState<RoomDecorItem[]>([])
  const gamepadLabel = useGamepadLabel()
  const {
    biosUrl,
    bootToken,
    effectiveGame,
    games,
    overrideCore,
    romLoadHint,
    selectedGame,
    selectedGameId,
    tvPoweredOn,
    viewMode,
    loadBiosFile,
    loadRomFiles,
    powerOffTv,
    powerOnOrRestartTv,
    setOverrideCore,
    setSelectedGameId,
    setViewMode,
    toggleDefaultBios,
  } = useEmulatorSession()

  useEffect(() => {
    setDecorItems(loadedDecorItems)
  }, [loadedDecorItems])

  const modelDecorItems = useMemo(
    () => decorItems.filter((item): item is RoomDecorModelItem => item.kind === 'model'),
    [decorItems],
  )

  useEffect(() => {
    if (!editorEnabled) {
      return
    }

    if (!modelDecorItems.length) {
      setSelectedDecorId(null)
      return
    }

    if (!selectedDecorId || !modelDecorItems.some((item) => item.id === selectedDecorId)) {
      setSelectedDecorId(modelDecorItems[0].id)
    }
  }, [editorEnabled, modelDecorItems, selectedDecorId])

  const updateDecorModelTransform = useCallback((id: string, transform: DecorModelTransform) => {
    setDecorItems((current) =>
      current.map((item) =>
        item.id === id && item.kind === 'model'
          ? {
              ...item,
              position: transform.position,
              rotation: transform.rotation,
              scale: transform.scale,
            }
          : item,
      ),
    )
  }, [])

  const centerCouch = useCallback(() => {
    setDecorItems((current) =>
      current.map((item) =>
        item.id === 'sofa-model-main' && item.kind === 'model'
          ? {
              ...item,
              position: [0, 0.06, 2.6],
              rotation: [0, Math.PI, 0],
            }
          : item,
      ),
    )
    setSelectedDecorId('sofa-model-main')
  }, [])

  const dprRange = useMemo<[number, number]>(() => {
    const maxDpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 1.35))
    return [1, maxDpr]
  }, [])

  return (
    <div className="app-shell">
      {experienceStarted ? (
        <section className={`controls-layout ${hudOpen ? 'is-open' : 'is-collapsed'}`}>
          <div className="controls-toolbar">
            <button
              type="button"
              className="controls-toggle"
              onClick={() => setHudOpen((value) => !value)}
              aria-expanded={hudOpen}
              aria-controls="hud-panel"
            >
              {hudOpen ? 'Hide Controls' : 'Show Controls'}
            </button>

            <button
              type="button"
              className={`controls-toggle editor-toggle ${editorEnabled ? 'is-active' : ''}`}
              onClick={() => setEditorEnabled((value) => !value)}
              aria-pressed={editorEnabled}
            >
              {editorEnabled ? 'Exit Edit Mode' : 'Edit Room'}
            </button>
          </div>

          {editorEnabled ? (
            <div className="editor-toolbar-row">
              <label className="editor-field">
                <span>Object</span>
                <select
                  value={selectedDecorId ?? ''}
                  onChange={(event) => setSelectedDecorId(event.target.value || null)}
                >
                  {modelDecorItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id}
                    </option>
                  ))}
                </select>
              </label>

              <div className="editor-mode-group" role="radiogroup" aria-label="Transform mode">
                {(['translate', 'rotate', 'scale'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`controls-toggle editor-mode-button ${transformMode === mode ? 'is-active' : ''}`}
                    onClick={() => setTransformMode(mode)}
                    aria-pressed={transformMode === mode}
                  >
                    {mode === 'translate' ? 'Move' : mode === 'rotate' ? 'Rotate' : 'Scale'}
                  </button>
                ))}
              </div>

              <button type="button" className="controls-toggle editor-action" onClick={centerCouch}>
                Center Couch
              </button>
            </div>
          ) : null}

          <div className="controls-panel-wrap">
            <HudPanel
              gamepadLabel={gamepadLabel}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              games={games}
              selectedGameId={selectedGameId}
              onSelectedGameChange={setSelectedGameId}
              onPowerOnOrRestart={() => {
                playPsOneStyleChime()
                powerOnOrRestartTv()
              }}
              onPowerOff={powerOffTv}
              overrideCore={overrideCore}
              onOverrideCoreChange={setOverrideCore}
              onRomFilesSelected={loadRomFiles}
              romLoadHint={romLoadHint}
              onBiosSelected={loadBiosFile}
              biosUrl={biosUrl}
              onToggleBios={toggleDefaultBios}
              selectedGame={selectedGame}
              onRequestClose={() => setHudOpen(false)}
            />
          </div>
        </section>
      ) : null}

      <div className="scene-shell">
        <KeyboardControls map={CONTROL_MAP}>
          <Canvas camera={{ fov: 50, position: [0, 2.05, 3.2], near: 0.05, far: 32 }} dpr={dprRange} shadows={false}>
            <Scene
              game={effectiveGame}
              biosUrl={biosUrl}
              poweredOn={tvPoweredOn}
              bootToken={bootToken}
              viewMode={viewMode}
              decorItems={decorItems}
              editorEnabled={editorEnabled}
              selectedDecorId={selectedDecorId}
              transformMode={transformMode}
              onSelectDecorItem={setSelectedDecorId}
              onDecorTransformCommit={updateDecorModelTransform}
            />
          </Canvas>
        </KeyboardControls>
      </div>

      {!experienceStarted ? (
        <StartOverlay
          progress={startProgress}
          ready={startReady}
          onStart={() => {
            playPsOneStyleChime()
            setExperienceStarted(true)
          }}
        />
      ) : null}
    </div>
  )
}

export default App
