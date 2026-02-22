# ROM Conversion Pipeline (PS1)

For better browser stability, prefer `.chd` over raw `.cue/.bin`.

## Convert CUE/BIN to CHD

```bash
npm run convert:chd -- "C:\\path\\game.cue"
```

Optional output path:

```bash
npm run convert:chd -- "C:\\path\\game.cue" "C:\\path\\game.chd"
```

Batch conversion by folder:

```bash
npm run convert:chd -- --dir "C:\\path\\roms"
```

## Why CHD helps

- Single file (simpler loading path)
- Smaller size and better streaming behavior
- Usually faster boot in EmulatorJS

## Recommendation

- Keep your original dump (`.cue/.bin`) as archive.
- Use generated `.chd` for runtime in this app.
