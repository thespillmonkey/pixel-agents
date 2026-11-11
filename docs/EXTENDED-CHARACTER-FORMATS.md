# Fork extended external character sheets

These are application features of this fork, not standard upstream or Pixel Index formats.
All sheets use native 16x32 frames in three rows: down, up, right; left is mirrored.

| Exact PNG size | Frames per row | Playback |
| --- | --- | --- |
| 112x96 | 7 legacy | Existing legacy adaptation derives v1.6 seated frame |
| 128x96 | 8 upstream | Existing seated, blink and wardrobe behavior |
| 880x96 | 7 legacy + 48 casting = 55 | Work and reading: all 48 phases, 100ms each; standing alignment |
| 896x96 | 7 legacy + 48 reading + 1 reserved = 56 | Reading only: all 48 phases, 100ms each; seated alignment retained |

Extended opt-in requires exact dimensions. Columns 0..6 retain walk/type/read poses; columns 7..54 are the animation. The 896 column 55 is reserved transparent space, never played. Typing on 896 and legacy sheets remains two frames at 300ms; walking remains unchanged. Extended sheets use the legacy typing pose for inactive seated rest, never animation phase 0 or the reserved column. Repeats preserve every phase through the existing external-sheet hue transform; generated profiles keep upstream palette/repeat/blink behavior. Animation normalizes indices when switching reading/typing and wraps at 48. Render, hit-testing and overlays share standing-casting alignment.

External catalogs remain keyed by PNG hash and existing saved name/profile preferences. No new config schema, asset replacement or preference reset is required. The Archivist credit: TheSpillmonkey. This code change grants no artwork redistribution rights and bundles no new production art.
