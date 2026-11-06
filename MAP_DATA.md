# Geographic data and map generation

## Source and licensing

India geometry is extracted without hand-editing from Natural Earth **1:10m Admin 0 countries**:
https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/

Downloaded on 4 November 2026 from the project's GeoJSON mirror:
https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_countries.geojson

The retained feature is `tools/india.geojson` (`ADM0_A3 = IND`), preserving the dataset's default de facto boundary convention. Natural Earth data is public domain: https://www.naturalearthdata.com/about/terms-of-use/. A map credit is included even though attribution is optional. The retained geometry is the reproducible source snapshot; the upstream master URL is mutable.

The dotted internal boundaries come from Natural Earth's public-domain [1:10m Admin 1 boundary lines](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_1_states_provinces_lines.geojson). The local snapshot in `tools/india-admin1-lines.geojson` includes the lines with `ADM0_A3 = IND`, simplified with a Douglas–Peucker tolerance of 0.015 degrees for this display scale. The generator uses the same projection for the national outline and the subdivision lines.

The highlighted Maharashtra, Jharkhand and West Bengal regions use Natural Earth's public-domain [1:10m Admin 1 state polygons](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_1_states_provinces.geojson), downloaded on 6 November 2026. The three retained geometries, simplified to a 0.005-degree Douglas–Peucker tolerance, are in `tools/transition-states.geojson`. The map generator projects them with the same Mercator projection as the India map and exports `statePaths` for the Work, Projects and Education transitions.

The five coordinates were extracted by exact city name from the Natural Earth 1:10m populated places dataset, downloaded on the same date:
https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_populated_places.geojson

| City       | Longitude |  Latitude |
| ---------- | --------: | --------: |
| Gorakhpur  | 83.380016 | 26.750394 |
| Kolkata    | 88.369126 | 22.569579 |
| Jamshedpur | 86.195573 | 22.789481 |
| Pune       | 73.851892 | 18.516394 |
| Mumbai     | 72.875839 | 19.068408 |

## Projection and crop

`tools/generate-map.mjs` uses d3-geo's Mercator projection, centered at [82, 27], scale 1850, translation [600, 280], precision 0.2. The SVG viewBox is 1200 × 690; the geographic layer is clipped at y = 660. The map intentionally crops its northern and southern extremities. All five required city points remain inside the visible area. The dotted connection is a narrative sequence, not a travel route.

The Angular component applies the same Mercator mapping to the typed longitude/latitude coordinates. Label offsets are independent from projected points and are connected with leader lines. The generated file exports projection constants so rendering and point placement stay aligned.

## Regeneration

```sh
npm ci
npm run map:generate
npm run build
```

Commit both the retained source geometry and `src/app/data/map.generated.ts` when updating the geographic source. Bulk world datasets are ignored and are not needed for regeneration. Keep new coordinate provenance with this document. Recheck the close Mumbai/Pune and Kolkata/Jamshedpur pairs at every supported breakpoint after changes.

## Font

Manrope Latin variable WOFF2 is self-hosted in `public/fonts`, sourced from `@fontsource-variable/manrope`. Its SIL Open Font License is retained alongside it as `LICENSE.txt`.
