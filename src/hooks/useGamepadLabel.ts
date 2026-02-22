import { useEffect, useState } from 'react'

const NO_CONTROLLER_LABEL = 'No controller detected'

export function useGamepadLabel() {
  const [label, setLabel] = useState<string>(NO_CONTROLLER_LABEL)

  useEffect(() => {
    let lastLabel = ''

    const updateGamepadStatus = () => {
      const pad = navigator.getGamepads?.().find((entry): entry is Gamepad => Boolean(entry))
      const nextLabel = pad ? `${pad.id} (slot ${pad.index + 1})` : NO_CONTROLLER_LABEL
      if (nextLabel !== lastLabel) {
        lastLabel = nextLabel
        setLabel(nextLabel)
      }
    }

    const onConnect = () => updateGamepadStatus()
    const onDisconnect = () => updateGamepadStatus()

    updateGamepadStatus()
    const interval = window.setInterval(updateGamepadStatus, 750)
    window.addEventListener('gamepadconnected', onConnect)
    window.addEventListener('gamepaddisconnected', onDisconnect)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('gamepadconnected', onConnect)
      window.removeEventListener('gamepaddisconnected', onDisconnect)
    }
  }, [])

  return label
}
