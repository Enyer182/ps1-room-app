# Room Decor Framework

This project supports dynamic room decoration from JSON.

## Config file

Path:

`public/room-decor.json`

Default format:

```json
{
  "version": 1,
  "items": []
}
```

You can provide either:

- an object with `items`
- or a raw array of items

## Item types

### 1) 3D Model

```json
{
  "id": "tv-prop-01",
  "kind": "model",
  "modelUrl": "/decor/models/retro_tv.glb",
  "position": [2.3, 0.75, -1.1],
  "rotation": [0, 1.57, 0],
  "scale": 0.9,
  "enabled": true
}
```

### 2) Poster / Painting

```json
{
  "id": "painting-01",
  "kind": "poster",
  "textureUrl": "/decor/posters/starry_night.jpg",
  "position": [-5.33, 2.15, -0.8],
  "rotation": [0, 1.57, 0],
  "size": [1.2, 1.7],
  "frameColor": "#201812",
  "enabled": true
}
```

## Notes

- If a model/texture fails, it is skipped (scene keeps running).
- `rotation` is in radians.
- `scale` supports `number` or `[x, y, z]`.
- Recommended local folders:
  - `public/decor/models/`
  - `public/decor/posters/`

## Optimization checklist

- Convert models to `.glb` (binary glTF).
- Keep textures to 1K/2K unless close-up.
- Target ~20k-80k tris per decor model.
- Prefer JPG/WEBP for posters.
