export function StartOverlay({
  progress,
  ready,
  onStart,
}: {
  progress: number
  ready: boolean
  onStart: () => void
}) {
  return (
    <div className="start-overlay">
      <div className="start-logo-fx" />
      <div className="start-card">
        <p className="start-kicker">Nostalgia Interactive</p>
        <h2>Nostalgia Room PS1</h2>
        <p className="start-subtitle">Loading 3D experience, emulator, and retro environment...</p>

        <div className="start-progress-wrap">
          <div className="start-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="start-progress-label">{progress}%</p>

        <button type="button" className="start-button" onClick={onStart} disabled={!ready}>
          {ready ? 'Click to Start Experience' : 'Loading...'}
        </button>
      </div>
    </div>
  )
}
