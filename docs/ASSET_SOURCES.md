# Free High-Quality Asset Sources

## 3D Models (CC0 / free)

- Poly Haven Models (CC0): https://polyhaven.com/models
- Poly Haven `Television 01` (CC0): https://polyhaven.com/a/television_01
- Poly Haven `Standing Picture Frame 01` (CC0): https://polyhaven.com/a/standing_picture_frame_01
- Poly Pizza free 3D assets: https://poly.pizza/

## Textures / Materials

- Poly Haven Textures (CC0): https://polyhaven.com/textures
- ambientCG (CC0): https://ambientcg.com/
- CGBookcase (free textures): https://www.cgbookcase.com/

## Painting / Artwork Images (free to use)

- The Met Open Access (public domain): https://www.metmuseum.org/about-the-met/policies-and-documents/open-access
- Rijksmuseum API + open collection: https://data.rijksmuseum.nl/object-metadata/api/
- Smithsonian Open Access: https://www.si.edu/openaccess

## Usage flow in this project

1. Put models in `public/decor/models/` (`.glb` recommended)
2. Put painting images in `public/decor/posters/`
3. Edit `public/room-decor.json`
4. Reload app

## API automation scripts in this repo

- Poly Haven model download:
  - `npm run asset:polyhaven -- Television_01 --res 1k`
- MET public-domain painting download:
  - `npm run asset:met -- 436535`
