import { DEFAULT_BIOS_URL } from '../../constants/games'
import type { CoreOverride, Ps1Game, ViewMode } from '../../types/emulator'

export function HudPanel({
  gamepadLabel,
  viewMode,
  onViewModeChange,
  games,
  selectedGameId,
  onSelectedGameChange,
  onPowerOnOrRestart,
  onPowerOff,
  overrideCore,
  onOverrideCoreChange,
  onRomFilesSelected,
  romLoadHint,
  onBiosSelected,
  biosUrl,
  onToggleBios,
  selectedGame,
  onRequestClose,
}: {
  gamepadLabel: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  games: Ps1Game[]
  selectedGameId: string
  onSelectedGameChange: (gameId: string) => void
  onPowerOnOrRestart: () => void
  onPowerOff: () => void
  overrideCore: CoreOverride
  onOverrideCoreChange: (value: CoreOverride) => void
  onRomFilesSelected: (files: File[]) => void
  romLoadHint: string
  onBiosSelected: (file: File | undefined) => void
  biosUrl: string
  onToggleBios: () => void
  selectedGame: Ps1Game
  onRequestClose?: () => void
}) {
  return (
    <section id="hud-panel" className="hud-panel">
      <header className="hud-header">
        <div className="hud-header-title-row">
          <h1>Nostalgia Room PS1</h1>
          {onRequestClose ? (
            <button type="button" className="hud-close-button" onClick={onRequestClose}>
              Close
            </button>
          ) : null}
        </div>
        <p className="hud-subtitle">
          {viewMode === 'observer'
            ? 'Observer mode: drag to orbit, wheel to zoom.'
            : 'First-person: click scene to lock mouse, WASD move, Shift sprint, Esc release.'}
        </p>
        <p className="game-desc">Controller: {gamepadLabel}</p>
      </header>

      <div className="hud-body">
        <label htmlFor="view-mode">Camera</label>
        <select
          id="view-mode"
          value={viewMode}
          onChange={(event) => onViewModeChange(event.target.value as ViewMode)}
        >
          <option value="observer">Observer (Orbit)</option>
          <option value="first_person">First Person</option>
        </select>

        <label htmlFor="game-select">Disc</label>
        <select id="game-select" value={selectedGameId} onChange={(event) => onSelectedGameChange(event.target.value)}>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.title}
            </option>
          ))}
        </select>

        <div className="hud-button-grid">
          <button type="button" className="hud-button" onClick={onPowerOnOrRestart}>
            Power On / Restart TV
          </button>
          <button type="button" className="hud-button" onClick={onPowerOff}>
            Power Off TV
          </button>
        </div>

        <label htmlFor="core-select">Core PSX</label>
        <select
          id="core-select"
          value={overrideCore}
          onChange={(event) => onOverrideCoreChange(event.target.value as CoreOverride)}
        >
          <option value="auto">Auto (segun juego)</option>
          <option value="psx">psx</option>
        </select>

        <label htmlFor="rom-input">Load your own legal PS1 ROM</label>
        <input
          id="rom-input"
          type="file"
          multiple
          accept=".bin,.cue,.iso,.chd,.pbp,.img"
          onChange={(event) => onRomFilesSelected(Array.from(event.target.files ?? []))}
        />
        {romLoadHint ? <p className="game-desc">{romLoadHint}</p> : null}

        <label htmlFor="bios-input">BIOS (default: HLE / sin BIOS externo)</label>
        <input
          id="bios-input"
          type="file"
          accept=".bin,.rom,.img"
          onChange={(event) => onBiosSelected(event.target.files?.[0])}
        />

        <button type="button" className="hud-button hud-button-single" onClick={onToggleBios}>
          {biosUrl === DEFAULT_BIOS_URL ? 'Usar HLE (sin BIOS)' : 'Usar OpenBIOS (default)'}
        </button>

        <p className="game-desc">{selectedGame.description}</p>
        {selectedGame.sourceUrl !== 'local-file' && selectedGame.sourceUrl !== 'local-import' ? (
          <a href={selectedGame.sourceUrl} target="_blank" rel="noreferrer">
            Game source / attribution
          </a>
        ) : null}

        <p className="legal-note">
          Commercial PS1 titles are not bundled. Use only games and BIOS files you legally own.
        </p>
      </div>
    </section>
  )
}
