

# Redesign Hero Video — Cinematic Upgrade

## Overview

Complete redesign of the Remotion hero video with a more cinematic, editorial aesthetic. The current version uses a basic left/right split layout for every vertical scene with simple spring animations. The redesign will introduce varied layouts, more dramatic motion, richer typography, and a stronger visual narrative arc.

## Creative Direction

- **Aesthetic**: Luxury Editorial — refined, high-contrast, dramatic reveals
- **Palette**: Deep navy `#060d1f`, electric blue `#3b82f6`, canary gold `#fbbf24`, warm white `#f1f5f9`
- **Font**: Inter 900 for headlines, Inter 400 for body (keep existing)
- **Motion system**: Clip-path reveals for entrances, scale-up with blur-to-sharp for hero moments, parallax layering throughout
- **Motifs**: Horizontal scan lines, diagonal accent slashes, animated progress rings

## Scene-by-Scene Redesign

### 1. IntroScene (90 frames) — "The Hook"
- Full-screen title with per-word staggered reveal (scale from 1.3 down to 1.0 with slight blur clear)
- Animated horizontal lines sweep across screen before text appears
- Pulsing ring animation behind "Lost Revenue" text
- Tagline types in character-by-character
- Remove the badge — start with pure dramatic typography

### 2. VerticalScene — 3 Layout Variants (rotating)
Instead of the same left-text/right-stat layout for all 6 verticals, cycle through 3 distinct layouts:

- **Layout A (full-bleed image)**: Image fills 65% of frame on left, text content overlaid on right with accent-colored vertical bar. Used for Beauty, Aviation.
- **Layout B (centered dramatic)**: Large centered stat number with title above and description below, image as subtle full background with heavy vignette. Used for Healthcare, Dining.
- **Layout C (split diagonal)**: Diagonal clip-path divides frame — image on one side, content on other, accent slash at the divide. Used for Maritime, Freight.

All layouts share:
- Ken Burns on background images (keep existing, increase to 0.65 opacity)
- Animated stat counter (keep)
- Bottom progress dots (keep)
- Sector label with animated underline reveal

### 3. OutroScene (90 frames) — "The Closer"
- "Zero Dead Air" title does a dramatic scale-from-2x reveal
- Stats appear in a horizontal strip with animated divider lines between them
- Subtle radial pulse emanating from center
- Final frame holds with gentle floating motion

### 4. PersistentBackground — Enhanced
- Add diagonal light streaks that slowly drift across frame
- Increase particle count to 20 with more size variation
- Add subtle noise texture overlay at very low opacity

### 5. Transitions — More Variety
- Intro to first vertical: wipe with diagonal angle
- Between verticals: alternate between `slide`, `wipe`, and `fade` (keep existing pattern but add clockWipe)
- Last vertical to outro: slow fade (1.5x duration)

## Duration Adjustments
- Keep 540 total frames (18s at 30fps)
- Intro: 90 frames
- Each vertical: 65 frames (keep)
- Outro: 90 frames
- Transitions: 15 frames each (keep)

## Files Modified
- `remotion/src/scenes/IntroScene.tsx` — dramatic per-word reveal, remove badge, add scan lines
- `remotion/src/scenes/VerticalScene.tsx` — 3 layout variants based on `index % 3`
- `remotion/src/scenes/OutroScene.tsx` — dramatic scale reveal, animated dividers
- `remotion/src/components/PersistentBackground.tsx` — diagonal streaks, more particles
- `remotion/src/MainVideo.tsx` — add clockWipe transition, slower outro fade

## Rendering
- Re-render to `public/videos/hero-bg.mp4` via the existing render script
- Spot-check key frames before full render

