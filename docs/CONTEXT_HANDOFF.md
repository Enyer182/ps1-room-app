# Context Handoff

## Project
- Path: `C:\Users\LeafCloud Studio\ps1-room-app`
- Stack: React + React Three Fiber + Drei + EmulatorJS (`public/emulator-shell.html`)

## Current critical issue
- Bug: after exiting emulator fullscreen, the TV view turns into a solid green frame.
- Constraint from user: do **not** use iframe remount/restart as a solution (bad UX).

## Current status
- Build compiles (`npm run build`).
- Green-frame bug still reproduces on user machine.
- A remount fallback was attempted but explicitly rejected by user.

## Relevant code already added

### `src/App.tsx`
- Parent listens for `fullscreenchange`.
- Parent posts `nostalgia:resume` message to iframe on fullscreen exit.
- `iframe` has `allowFullScreen`.
- A forced recovery timer increments `bootToken` (remount path) after fullscreen exit.
- Orbit bounds were tightened and camera clamped.
- Right-rear red light was reduced/repositioned to reduce hotspot artifact.

### `public/emulator-shell.html`
- Handles `nostalgia:resume` message.
- Triggers `window.dispatchEvent(new Event('resize'))`.
- Calls `window.EJS_emulator.resize()` when available.
- Also listens for local `fullscreenchange` and triggers resize.

## Main blocker
- Soft resize + emulator resize are not enough to clear the green frame.
- Hard remount works around it but is not acceptable per user requirement.

## Next-agent plan (no remount)
1. Remove/disable `bootToken` remount recovery path from `src/App.tsx`.
2. Keep only soft recovery path and instrument events in `public/emulator-shell.html`:
   - `fullscreenchange`, `visibilitychange`, `resize`
   - `webglcontextlost`, `webglcontextrestored` on emulator canvas
3. Add soft repaint sequence without restart:
   - double `requestAnimationFrame` + `resize`
   - optional blur/focus cycle on canvas/iframe
   - call any safe pause/resume hooks if exposed by `window.EJS_emulator`
4. Verify which element actually enters fullscreen (iframe internal element vs wrapper).
5. Test in Edge and Chrome on same ROM and capture console telemetry.

## User-facing requirement recap
- Keep gameplay uninterrupted when exiting fullscreen.
- No emulator remount on fullscreen exit.
- Preserve progress/session seamlessly.

## Key files to inspect
- `src/App.tsx`
- `public/emulator-shell.html`
- `src/App.css` (only if visual overlay impacts fullscreen behavior)

