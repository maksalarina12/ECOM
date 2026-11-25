# External 3D assets and attribution

## Furnished platform bed

- Name: Low platform bed 160 x 200, oak
- Source: https://www.innerscene.com/tools/library/3d-parts/low-platform-bed-160-x-200-oak-20c5fc2e
- Provider: Innerscene 3D Parts Library (original)
- License stated by provider: CC0 public domain dedication (commercial reuse allowed without credit)
- Format: GLB; published size approximately 4.8 MB
- Recommended file: `public/models/low-platform-bed.glb`
- Download helper: `npm run assets:fetch`
- Status: sudah terunduh di `public/models/low-platform-bed.glb` (±5.1 MB) saat build terakhir
- Description: oiled-oak platform deck and headboard with mattress, duvet, pillows and sage throw as separate nodes.
- Caveat: illustrative furniture model. Its dimensions, materials, certifications or construction must not be represented as statements from an ECOM merchant.

## Brand logos

The official ECOM-Black.png and ECOM-White.png were not accessible in this session.
Place supplied originals under `public/logos/`. Do not alter artwork.

## Fallback geometry

Procedural mattress layers, foam textures, wood textures and spring geometry are locally authored in `src/scenes/Scene.tsx` and do not reference outside assets.
