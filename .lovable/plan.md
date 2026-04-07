

# Hero Video Background + Premium Section Images

## Overview
Add a real looping stock video as the hero background and premium stock images to each section, all sourced from free CDNs (Pexels/Unsplash) that allow hotlinking.

## Step 1: Hero Video Background

Add a real looping video behind the hero content. Source: a dark, cinematic abstract/tech video from Pexels (free, no attribution required, direct MP4 links available).

**Recommended video options** (dark, atmospheric, matches "Urgent Luxury"):
- Abstract dark particles/bokeh with blue tones
- Data visualization / network nodes animation
- Dark cityscape aerial at night

**Integration in `HeroSection.tsx`:**
- Add a `<video>` element with `autoPlay muted loop playsInline` behind all content
- Style: `absolute inset-0 w-full h-full object-cover opacity-30`
- Add a dark overlay div on top of video (`bg-background/60`) to maintain text legibility
- Keep existing radial gradient effects layered above the overlay for depth

## Step 2: Premium Images for Other Sections

Add contextual background/accent images from Unsplash (free CDN, direct URLs):

| Section | Image Theme | Placement |
|---------|------------|-----------|
| **LiveSlotsFeed** | Dark luxury control room / trading floor | Subtle background, `opacity-[0.07]` |
| **HowItWorks** | Abstract network / connected nodes | Decorative side accent |
| **SectorShowcase** | Private jet on tarmac at dusk | Section header image with gradient overlay |
| **PricingSection** | Dark marble / gold abstract texture | Full background, very low opacity |

Each image will be an `<img>` tag with `absolute inset-0 object-cover` and very low opacity so text remains readable. A gradient overlay ensures the glassmorphism design stays intact.

## Files Modified
- `src/components/HeroSection.tsx` — add `<video>` element + dark overlay
- `src/components/LiveSlotsFeed.tsx` — add background image
- `src/components/HowItWorks.tsx` — add decorative image
- `src/components/SectorShowcase.tsx` — add header image
- `src/components/PricingSection.tsx` — add background texture

## Technical Notes
- All media sourced via CDN URLs (Pexels for video, Unsplash for images) — no local files needed
- Video uses `preload="metadata"` and poster frame for fast initial paint
- Images use `loading="lazy"` for performance
- All overlays use Tailwind opacity classes to maintain the dark theme contrast

