# PS1 Nostalgia Room (React + Three.js)

A playable PS1-in-a-CRT experience built with React, Three.js (`@react-three/fiber`), and EmulatorJS.

## Architecture

- Detailed architecture: `docs/ARCHITECTURE.md`
- Room decor framework: `docs/ROOM_DECOR_FRAMEWORK.md`
- ROM conversion pipeline: `docs/ROM_CONVERSION.md`
- Free asset sources: `docs/ASSET_SOURCES.md`

## What is included

- Nostalgic 90s-style bedroom scene (CRT TV, console, posters, desk, couch, atmosphere)
- Observer camera mode with constrained orbit inside room framing
- Runtime room editor mode (select/move/rotate/scale 3D decor models)
- TV boot flow with PS1-style power chime
- Two bundled legal homebrew PS1 demos:
  - `Bow and Arrow PSX`
  - `Nolibgs Demo Disc`
- Bundled default legal BIOS for testing: `public/bios/openbios.bin` (OpenBIOS)

## Run

```bash
npm install
npm run dev
```

Then open the printed local URL (currently `http://127.0.0.1:5175/`).

## Build

```bash
npm run build
npm run preview
```

## Controls

- Camera selector in HUD:
  - `Observer (Orbit)`: drag to orbit, wheel to zoom
  - `First Person`: click scene to lock pointer, `WASD` move, `Shift` sprint, `Esc` release
- HUD button `Power On / Restart TV`: boot selected disc
- HUD button `Power Off TV`: shut screen down
- Top toolbar `Edit Room`: runtime transform mode for room props
  - Select object
  - Move / Rotate / Scale
  - Center couch quick action

## Custom content

- Load your own legally dumped PS1 ROM from HUD (`.bin/.cue/.iso/.chd/.pbp/.img`)
- Multi-file import is supported and prioritizes:
  - `.chd`
  - `.pbp`
  - `.iso`
  - `.bin`
  - `.img`
- If only `.cue` is selected without data image, HUD shows a compatibility warning.
- Optionally load your own BIOS dump, or keep OpenBIOS default

### Recommended ROM workflow

Use CHD for best stability:

```bash
npm run convert:chd -- "C:\\path\\game.cue"
```

### Room decoration workflow

- Drop `.glb` models in `public/decor/models/`
- Drop painting textures in `public/decor/posters/`
- Edit `public/room-decor.json`
- Reload app

You can also fetch assets via API scripts:

```bash
# Poly Haven model (example: Television_01)
npm run asset:polyhaven -- Television_01 --res 1k

# MET public-domain painting by object id
npm run asset:met -- 436535
```

## Bundled game sources

- Bow and Arrow PSX: https://github.com/ABelliqueux/Bow_and_Arrow_psx
- Nolibgs Demo Disc: https://github.com/ABelliqueux/nolibgs_demo
- OpenBIOS mirror used: https://www.mirrorservice.org/sites/libreboot.org/release/stable/20241206/roms/playstation/

## Important legal note

Commercial PS1 games and BIOS files are **not** included. Use only games/BIOS dumps you legally own.

## GitHub push (first time)

```bash
git init
git add .
git commit -m "Initial commit: PS1 nostalgia room app"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```
