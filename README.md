````markdown name=README.md
## Rights, reuse, and permissions

**All Rights Reserved.**

You may request permission to reuse the **code only** (HTML/CSS/JS). Permission requests: `thisiskristinbauer.com`.

The contents of `assets/` (including **all audio field recordings** and **all processed imagery/artwork**) are **not licensed for reuse** and may not be reused, sampled, redistributed, or included in other works without explicit written permission.
````
````markdown name=README.md
# Vanishing Point

An interactive, browser-based sound map built from field recordings and layered map imagery.

Move through a drifting historical landscape and reveal location-based audio by hovering and clicking “hotspots.” The piece is designed as a small, self-contained web artwork (HTML/CSS/JS) with no build step.

## What it is / what it does

- **Two map layers** (`assets/map1.png`, `assets/map2.png`) crossfade while slowly drifting/rotating/scaling.
- **Six invisible hotspots** sit on top of the map. When sound is enabled, each hotspot:
  - **fades in** a corresponding field recording on hover
  - can be **pinned** on click to keep playing after you leave the area
  - **fades out** when you leave (unless pinned)
- A single **Listen / Silent** button is used to satisfy browser autoplay rules and to globally enable/disable audio.

Hotspot areas (as currently labeled in the HTML) include:
- Arcata
- Humboldt
- Mendocino (lot)
- Mendocino (pitstop)
- Occidental
- San Francisco

## Run it locally

This project is static—open it in a browser.

### Option A: open the file directly
- Double-click `index.html`

Note: some browsers may block or behave differently with local file audio. If you hit issues, use a local server (Option B).

### Option B: run a tiny local server (recommended)
Using Python:

```bash
python3 -m http.server 8000
```

Then visit:

- `http://localhost:8000`

## How to interact

1. Open the page.
2. Click **Listen** (required before audio can play).
3. Hover hotspots to fade audio in/out.
4. Click a hotspot to **pin/unpin** that audio loop.

### Debug controls (optional)
From the page:
- Press **D** to toggle visible hotspot outlines (`debug-hotspots` mode).
- Press **S** to print hotspot positions/sizes to the console (and copy CSS snippets when clipboard access is available).

## Project structure

- `index.html` — page structure (background layers, hotspot buttons, audio elements)
- `style.css` — layout, hotspot positioning, background visuals
- `script.js` — background animation, audio fade logic, hotspot interactions
- `assets/`
  - `map1.png`, `map2.png` — map imagery layers
  - `fieldrecording-*.WAV` — field recordings used by hotspots

## Rights, reuse, and permissions

### Code
**All Rights Reserved.**

If you would like to reuse the *template structure* (the interaction pattern / layout approach) in your own work, please request permission from the author.

### Audio recordings
All field recordings in `assets/fieldrecording-*.WAV` are **original recordings by the repository author** and are **creative property**. **Not licensed for reuse** without explicit permission.

### Processed imagery / artwork
The map imagery used in `assets/map1.png` and `assets/map2.png` is part of the author’s **creative artwork** (including processing/compositing). **Not licensed for reuse** without explicit permission.

The underlying source material includes a public-domain/open-archive **1850s map drawing**, used as a historical base layer; however, the *processed* results included in this repository are the author’s artwork.

### Permission requests
To request permission to reuse:
- the template / structure, or
- any audio recordings, or
- any processed imagery,

please contact the author via:

`thisiskristinbauer.com`

## Notes

- Audio is set to `loop` and is faded in/out in JavaScript for smooth transitions.
- Large `.WAV` files may take time to load depending on connection/device.
````
