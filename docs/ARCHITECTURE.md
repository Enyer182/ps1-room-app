# Project Architecture

## 1. Overview

The app has two main layers:

1. `React + @react-three/fiber` for the 3D nostalgia room experience.
2. `EmulatorJS` embedded in a TV `iframe` to run PS1 content.

Main UI entry point is `src/App.tsx`, where the `Canvas` and HUD are mounted.

## 2. Technical Structure

- `src/App.tsx`
  - Builds the 3D scene (room, TV, props, atmosphere).
  - Handles UI state (selected game, BIOS, TV power, core override, view mode).
  - Builds emulator boot URL and passes it to the TV `iframe`.
- `public/emulator-shell.html`
  - Bridge page for EmulatorJS.
  - Reads `rom`, `bios`, `core`, `title` from query params.
  - Validates assets with `HEAD` requests before loading emulator runtime.
- `public/roms/*`
  - Local discs/ROM files (including `YUGIOH.chd`).
- `public/bios/*`
  - BIOS files (`openbios.bin` is default).

## 3. Core Components (App.tsx)

- `App`
  - Owns global state and HUD interactions.
  - Selects game/core/BIOS.
  - Toggles camera mode (`observer` / `first_person`).
  - Powers TV on/off and triggers reboot token.
- `Scene`
  - Hosts lights, fog, room geometry and active camera controls.
- `Room`
  - Contains static room meshes and visual props.
  - Mounts `ConsoleTV`.
- `ConsoleTV`
  - Renders TV shell and emulator `iframe`.
  - Re-mounts emulator via `bootToken`.
- `ObserverControls`
  - Orbit camera profile with strict distance/angle limits.
- `FirstPersonControlsRig`
  - Uses `PointerLockControls` + `KeyboardControls` for WASD movement.
  - Clamps camera position so player cannot exit room bounds.

## 4. Game Boot Flow

1. User selects game/core/BIOS in HUD.
2. User powers TV on (or restarts).
3. `makeEmulatorUrl(...)` creates `/emulator-shell.html?...`.
4. `emulator-shell.html` validates ROM/BIOS URLs.
5. EmulatorJS runtime loader is fetched from:
   `https://cdn.emulatorjs.org/stable/data/loader.js`
6. Emulator boots inside `#game` in TV iframe.

## 5. ROM Import Strategy

ROM input accepts multiple files and uses priority order:

1. `.chd`
2. `.pbp`
3. `.iso`
4. `.bin`
5. `.img`

If only `.cue` is provided without a data image, HUD shows a compatibility hint
instead of trying to boot a likely broken input.

## 6. Camera and Bounds

### Observer mode
- `OrbitControls` with:
  - bounded distance
  - bounded polar angle
  - bounded azimuth angle
- tuned to keep camera framing inside useful room volume.

### First-person mode
- Pointer lock look.
- WASD + Shift movement.
- Position clamps:
  - `x` in `[-4.45, 4.45]`
  - `z` in `[-3.55, 3.05]`
  - `y` in `[1.68, 1.88]`

## 7. State Model

- `selectedGameId`: active catalog entry.
- `customGame`: user-loaded local game entry.
- `biosUrl`: active BIOS URL (default or blob).
- `tvPoweredOn`: TV power state.
- `bootToken`: increments to force iframe remount/reboot.
- `overrideCore`: `auto` or forced `psx`.
- `gamepadLabel`: detected controller telemetry string.
- `viewMode`: `observer` or `first_person`.
- `romLoadHint`: user-facing compatibility/import message.

Blob lifecycle cleanup:
- blob URLs for BIOS/ROM are revoked on replacement/unmount.

## 8. Performance Notes

- Procedural textures are memoized with `useMemo`.
- Dust particle geometry is stable and updated lightly per frame.
- `Canvas` DPI is capped (`dpr={[1, 1.25]}`) to keep GPU load predictable.

## 9. Extension Points

- Add/replace room decoration: `Room`.
- Tune navigation behavior: `ObserverControls`, `FirstPersonControlsRig`.
- Adjust emulator startup behavior: `public/emulator-shell.html`.
- Extend local catalog: `GAMES`.
