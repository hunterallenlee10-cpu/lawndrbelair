# Lawn Doctor of Bel Air–Parkville

Single-page marketing site for Lawn Doctor's Bel Air–Parkville franchise. It's a localized take on the
Lawn Doctor redesign (lawndr-iota.vercel.app) and uses the full-bleed video hero pattern from
realestate-orpin-phi.vercel.app.

It's a plain static site with no build step, so Vercel serves it as-is.

```
index.html              page markup
assets/css/styles.css   all styles (design tokens at the top)
assets/js/main.js       hero video, header, menu, reveals, marquee, ZIP check
assets/video/           hero film: hero.mp4 / hero.webm (1080p), hero-720.* (mobile)
assets/img/             optimized WebP images (800w + 1600w), hero poster
vercel.json             cache headers for /assets
```

Local preview: `npx serve .` and open http://localhost:3000

## Hero video

The hero is a 21-second, four-season loop (spring blossoms → turf close-up → summer lawn → October color),
cut, color-graded and crossfaded with ffmpeg from Mixkit stock clips (free for commercial use, no
attribution required): 44970, 26431, 15479, 33237.

The "Now showing" captions follow the film. They're set in `data-captions` on `.hero__place` in
`index.html`; `from` is the start time in seconds.

The sources attach after page load, and visitors with reduced-motion or Save-Data get the poster
image only. To swap in real Bel Air / Parkville drone footage later, replace the four files in
`assets/video/` and `assets/img/hero-poster.webp`, then update the caption timings.

## Before launch: things to confirm

- **Phone number:** the site uses Lawn Doctor's national line (800.845.0580). Swap in the local
  number. Search for `800.845.0580` and `+18008450580` (PHONE_* constants in `main.js`).
- **Quote flow:** the ZIP forms check against the service-area list in `main.js` (`SERVICE_ZIPS`).
  Set `QUOTE_URL` in `main.js` to send confirmed ZIPs to a booking or quote page.
- **Reviews:** the five reviews are the brand-wide Google reviews from the main redesign. Replace them
  with Bel Air–Parkville reviews from the local Google Business Profile.
- **Local facts:** BBB accreditation (2007) and the MDA license come from the public BBB listing for
  Lawn Doctor of Bel Air-Parkville. Confirm them with the owner.
