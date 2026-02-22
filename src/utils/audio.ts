export function playPsOneStyleChime() {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) {
    return
  }

  const ctx = new AudioContextClass()
  const now = ctx.currentTime

  const master = ctx.createGain()
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.25, now + 0.04)
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.15)
  master.connect(ctx.destination)

  const notes = [220, 329.63, 493.88, 659.25]
  notes.forEach((frequency, index) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = index % 2 === 0 ? 'sine' : 'triangle'
    osc.frequency.setValueAtTime(frequency, now + index * 0.14)

    const start = now + index * 0.14
    const end = start + 0.34

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.42, start + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)

    osc.connect(gain)
    gain.connect(master)
    osc.start(start)
    osc.stop(end)
  })

  window.setTimeout(() => {
    void ctx.close()
  }, 1800)
}
