

## Problem

The Google Maps links in the app trigger `ERR_BLOCKED_BY_RESPONSE` because Google blocks requests from embedded preview environments (via `X-Frame-Options` and CORS headers). This affects the "View on map" links in both the slot cards (`LiveSlotsFeed.tsx`) and the slot detail modal (`SlotDetailModal.tsx`).

## Solution

Replace all Google Maps references with **OpenStreetMap** (OSM), which is free, open, and does not block embedded contexts. This involves:

### Changes

**1. `src/lib/vendor-addresses.ts`** -- Update the URL helper
- Replace `getGoogleMapsUrl` with `getOpenStreetMapUrl` that generates `https://www.openstreetmap.org/search?query=...` links
- These links work in all contexts without blocking

**2. `src/components/LiveSlotsFeed.tsx`** -- Update map link references
- Change import from `getGoogleMapsUrl` to `getOpenStreetMapUrl`
- Update the map link `href` and any tooltip/label text (e.g. "View on Google Maps" becomes "View on map")

**3. `src/components/SlotDetailModal.tsx`** -- Same updates
- Change import and usage from `getGoogleMapsUrl` to `getOpenStreetMapUrl`
- Update link text/labels

All three files are the only places referencing Google Maps. The `index.html` references to `storage.googleapis.com` are unrelated OG image URLs and are unaffected.

### Technical Details

```
Old:  https://www.google.com/maps/search/?api=1&query=...
New:  https://www.openstreetmap.org/search?query=...
```

OpenStreetMap search URLs follow the same pattern (URL-encoded address as query param) and open reliably in all browsers without CORS/frame restrictions.

