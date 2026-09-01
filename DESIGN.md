---
name: Sakura Bloom
description: Elegant Spa Classic executed entirely in cherry blossom — the salon is named Sakura Bloom, so the motif is the identity, not an ornament laid over it.
colors:
  cream: "#fdf7f6"
  cream-deep: "#f9ecea"
  cream-line: "#f0dcda"
  blush: "#fcf1f2"
  sakura-pale: "#fae6ea"
  sakura: "#f0c2cd"
  sakura-mid: "#e29fb1"
  sakura-deep: "#c2657f"
  cherry: "#a8455f"
  cherry-ink: "#7d3145"
  branch: "#9b7468"
  branch-soft: "#c2a79d"
  sage-pale: "#e4e9dc"
  sage: "#a3b48f"
  sage-deep: "#74855f"
  taupe: "#46383a"
  taupe-soft: "#7a6660"
  taupe-faint: "#a8968f"
  gold: "#b99a63"
  gold-light: "#ddc38f"
  white: "#ffffff"
typography:
  scale:
    fs-micro: "0.7rem"
    fs-label: "0.78rem"
    fs-small: "0.85rem"
    fs-body: "1rem"
    fs-body-lg: "1.05rem"
    fs-title: "1.2rem"
    fs-title-lg: "1.3rem"
  display:
    fontFamily: "Libre Caslon Display, Georgia, Times New Roman, serif"
    fontSize: "clamp(2.85rem, 6.4vw, 5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  display-emphasis:
    fontFamily: "Libre Caslon Text, serif"
    fontStyle: "italic"
    fontWeight: 400
  headline:
    fontFamily: "Libre Caslon Display, Georgia, Times New Roman, serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 400
  title:
    fontFamily: "Libre Caslon Display, Georgia, Times New Roman, serif"
    fontSize: "1.2rem"
    fontWeight: 400
  body:
    fontFamily: "Work Sans, -apple-system, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Work Sans, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.78rem"
    letterSpacing: "0.05em"
rounded:
  sm: "10px"
  md: "18px"
  pill: "999px"
  arch: "999px 999px 12px 12px"
spacing:
  container-max: "1200px"
  section-block: "clamp(3.5rem, 8vw, 7rem)"
  section-inline: "clamp(1.25rem, 5vw, 3.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.cherry}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "1rem 1.7rem"
  button-primary-hover:
    backgroundColor: "{colors.cherry-ink}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.cherry}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1.1rem"
  button-secondary-hover:
    backgroundColor: "{colors.cherry}"
    textColor: "{colors.white}"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "0"
  pro-card:
    backgroundColor: "{colors.cream-deep}"
    rounded: "{rounded.arch}"
    padding: "0"
  tag:
    backgroundColor: "{colors.sakura-pale}"
    textColor: "{colors.cherry}"
    rounded: "{rounded.pill}"
    padding: "0.3rem 0.7rem"
---

# Design System: Sakura Bloom

## Overview

**Creative North Star: "Elegant Spa Classic, executed entirely in cherry blossom"**

The salon is named **Sakura Bloom**, and the user directed the whole personality — name, logo, backgrounds, everything — to be built around the cherry blossom. That changes the motif's job. It is no longer one authored accent laid over the category standard: it *is* what the category standard is executed in. The base look is still Elegant Spa Classic, played straight at full fidelity with no irony — calm, light-filled, trustworthy, generous whitespace, oversized editorial type, real photography carrying more weight than copy. But the blossom now supplies the mark, the favicon, the palette's primary, the ground texture, the section ornament, the card seal, and the booking payoff.

The discipline that replaces "keep it to one accent" is **one shape, many scales**. There is a single drawn blossom — five notched petals, a gold stamen crown — and every appearance of the motif is that same shape at a different size, weight, or opacity. The site never invents a second flower, and the motif never becomes a second typeface, a second layout system, or a reason to spend whitespace.

Two craft-bar references were studied directly (DOM/CSS inspected live, neither copied verbatim): [goldustspa.com](https://goldustspa.com) for its soft italic display type and rounded organic photo shapes, and [venetianspa.ca](https://venetianspa.ca) for its bold tracked headlines, arched photo frames, hero-to-section dome overlap, and ornamental flourish motifs. An earlier bespoke "Appointment Ledger" leather/stamp/ticket concept was built and explicitly rejected as gimmicky and wrong-personality for this category — the standing lesson is that this brand wants to be recognized, not surprised, by its genre.

**Key Characteristics:**
- Blush-cream ground carrying a sparse tiled fallen-petal texture on every full-width surface; a five-step rose ramp is the primary, sage is demoted to a quiet second voice, gold reserved for hairlines and stamens.
- One blossom mark, drawn once (`PETAL_PATH` in `Sakura.jsx`) and reused at every size: the logo, the favicon, the hero canopy, the dome apex, the section divider, the professional-card seal, and the confirmation.
- Line-art boughs enter each section from a different corner — never the top-left, where every heading sits — so the motif recurs without repeating.
- Editorial serif display type (Libre Caslon Display) paired with an italic serif for emphasis words, set against a light humanist sans body (Work Sans).
- The Portfolio section rises over the Hero as a giant domed panel — a true circular arc overlaid on the hero, growing on scroll — lifted directly from venetianspa.ca's hero-to-section technique.
- The branch divider marks every section seam; falling petals run dense in the hero (28) and thin in the booking section (14), so the page's first and last screens rhyme. Both are fully disabled under `prefers-reduced-motion`.
- The hero's background is not a photograph: two mirrored line-art boughs (`HeroCanopy`) enter from the top corners and grow in on load, tapering toward the centered copy — the same stroke-plus-blossom vocabulary as the section watermarks, at the hero's own scale and as its one authored entrance moment.
- Sections stagger their heading/subtitle/content in on independent scroll-reveals rather than fading in as one block.

## Colors

A blush-cream base carries the page and a five-step rose ramp runs the whole interface, from petal-pale surfaces to a dark cherry ink. Sage survives as one quiet secondary note; gold stays in hairline quantities.

### Primary
- **Cherry** (`#a8455f`): the action and ink weight of the rose ramp, and the only color that means "go." Every primary CTA, the active/selected state in booking (dates, slots, chosen pro/service), price figures, the logo mark, focus rings, the active nav underline, and the tick in the confirmation's heart. Chosen at this depth deliberately, measured against the grounds it's actually set on: white text on a cherry button clears WCAG AA (5.7:1), and cherry text on cream — where price figures and the logo mark actually sit, not on white — still clears it (5.4:1). The previous `#d98fa3` cleared neither pairing (2.2:1).
- **Cherry Ink** (`#7d3145`): the hover state for every cherry fill. Primary buttons now darken within the rose family instead of jumping to sage — a hover should deepen a color, not change the subject.
- **Sakura Deep** (`#c2657f`): the decorative mid. Blossom fills at ornament scale, hairline accents. Not used for small text on pale grounds — that is cherry's job.
- **Sakura Mid** (`#e29fb1`) / **Sakura** (`#f0c2cd`) / **Sakura Pale** (`#fae6ea`): branch blossoms, falling petals, hover fills, tag and icon-well grounds.

### Secondary
- **Sage Deep** (`#74855f`) / **Sage Pale** (`#e4e9dc`): the one non-rose voice left in the system, now reduced to the booking demo-notice pill and the "step completed" state. It no longer takes CTA hovers or focus rings — the rose ramp absorbed both.

### Branch
- **Branch** (`#9b7468`) / **Branch Soft** (`#c2a79d`): bark. Only ever a stroke, only in the line-art boughs, always under 0.4 opacity. This is the woody counterweight that stops the pink from going saccharine.

### Tertiary
- **Gold** (`#b99a63`) / **Gold Light** (`#ddc38f`): ornamental only — the blossom's stamen crown and centre, the sakura-divider's branch line, the price-row leader line, the hairline rules flanking the stacked wordmark. Never a fill for text or for a background of any size.

### Neutral
- **Cream** (`#fdf7f6`): the page ground (body background, hero, services, professionals sections). Drifted toward blush from the old `#fdf8f6` — this is petal-paleness, not paper.
- **Cream Deep** (`#f9ecea`): one step warmer, for alternating section backgrounds (booking section, pro-card fill, footer, confirmed-card panel).
- **Cream Line** (`#f0dcda`): hairline borders, dividers, unselected chip/input borders, and the portfolio dome's own fill.
- **Taupe** (`#46383a`): primary ink — all headings and primary body text. Warmed a touch toward the rose family.
- **Taupe Soft** (`#7a6660`): secondary copy (subtitles, descriptions, body text one step down from primary ink).
- **Taupe Faint** (`#a8968f`): tertiary/meta text (durations, captions, placeholder notices, uppercase labels).

### Named Rules
**The One Accent Rule.** Cherry is the only color that signals "primary action" or "selected." Nothing else competes for that role. When a rose surface needs a hover it deepens to cherry-ink; it never changes hue.

**The Contrast Rule.** Any rose carrying white text, or any rose used as text on a pale ground, must be `--cherry` or darker. The mid and pale steps are for fills, ornaments, and petals only. This is the rule that keeps an all-pink interface readable.

**The Gold-Is-Hairline Rule.** Gold and gold-light never fill a shape larger than a 1-2px line or a small ornament stroke. It is a finishing detail, not a palette color.

## Typography

**Display Font:** Libre Caslon Display (with Georgia, Times New Roman, serif fallback)
**Emphasis Font:** Libre Caslon Text, italic (serif fallback) — reserved for single emphasized words inside display headlines
**Body Font:** Work Sans (with -apple-system, Segoe UI, sans-serif fallback)

**Character:** An editorial, slightly formal serif carries every heading at a light, generous size; a humanist sans body keeps everything else calm and legible. The italic serif is used sparingly — one emphasis word per headline — so it reads as a raised voice, not a second typeface family.

Below Display and Headline, every role resolves to one step of a shared scale (`--fs-micro` 0.7rem, `--fs-label` 0.78rem, `--fs-small` 0.85rem, `--fs-body` 1rem, `--fs-body-lg` 1.05rem, `--fs-title` 1.2rem, `--fs-title-lg` 1.3rem, `tokens.css`) rather than scattered literal values — new component type should pick the nearest step instead of writing a fresh `rem` value.

### Hierarchy
- **Display** (400, `clamp(2.85rem, 6.4vw, 5rem)`, 1.1 line-height): hero headline only, max-width 14ch, turned up from an earlier 4.3rem ceiling to spend the brand's one full-volume display moment closer to the type system's actual headroom. The `em` word inside it switches to italic Libre Caslon Text in sakura-deep.
- **Headline** (400, `clamp(2rem, 4vw, 3rem)`, default): section headings (`.section-kicker-free-heading`), max-width 40ch. The Portfolio dome steps this up to `clamp(2.1rem, 5.2vw, 4rem)` — the section is the widest, tallest surface on the page, and the row-title-scale heading it inherited used to float in the pink field like a mislaid label.
- **Title** (400, `--fs-title`/`--fs-title-lg`, 1.2-1.3rem): card and row titles (price-row name, booking panel h3s) — always in the display face even at small size. The professional gallery's name is its own fluid step, `clamp(1.35rem, 1.9vw, 1.7rem)`, scaled against the wide arched portrait it captions rather than pinned to the row-title size.
- **Body** (400, 17px base / `--fs-body`-`--fs-body-lg`, 1.65-1.7 line-height): paragraph copy, 46-52ch max width for readability.
- **Label** (400-600, `--fs-micro`-`--fs-small`, 0.65-0.85rem, uppercase where noted, 0.05-0.06em tracking): meta text — durations, dt labels, the demo-notice pill, day-of-week in date chips.

### Named Rules
**The One Italic Word Rule.** Emphasis inside a display headline is exactly one italicized word in sakura-deep, never a whole phrase and never a second color layered onto it.

**The Real Italic Rule.** Italic is only ever set in Libre Caslon Text or an italic-loaded Work Sans weight, never a synthesized oblique on a face that has no italic glyphs of its own — `--font-emphasis` (`tokens.css`) is the one family every italic use should resolve through.

## Layout

A single centered container (`max-width: 1200px`) holds every section; fluid clamp-based padding (`clamp(3.5rem, 8vw, 7rem)` block, `clamp(1.25rem, 5vw, 3.5rem)` inline) keeps rhythm consistent from mobile to desktop without hard breakpoints for spacing itself. Cards and grids use `repeat(auto-fill/auto-fit, minmax(...))` so galleries and pricing/booking grids reflow naturally rather than snapping at fixed breakpoints; explicit breakpoints (900px, 760px, 720px, 640px, 480px) exist only to change structure (stacking, hiding the connector line, collapsing columns), not spacing scale.

The hero is `position: sticky` on desktop (≥901px) and pins under the nav while the Portfolio section's domed top edge rises over it on scroll — the signature hero-to-section overlap. Two rules make that work and must move together:

- `.hero-pin` is taller than `.hero` by `--hero-pin-travel` (70svh). A sticky element only travels by the slack between it and its containing block, so at equal heights it has none and simply scrolls away — the pin is silently inert. The extra wrapper height is what buys the hero somewhere to hold still.
- `.portfolio-section` reclaims that same travel in its negative `margin-top`, alongside its own `--dome-peek`. Without it the travel would become blank page below the hero.

`--hero-pin-travel` is `0px` wherever the hero doesn't pin (below 901px, and under `prefers-reduced-motion`), which zeroes both rules at once. The hero photo stays a full `100svh` at every scroll position: the dome is drawn *over* it, never beside it, so the arc peeking at rest costs the image no height. Below 900px this collapses to normal document flow (`position: relative`), and it degrades to fully static under `prefers-reduced-motion`. Sections alternate between `--cream` and `--cream-deep` backgrounds to mark transitions without hard borders (Portfolio uses `--cream-line` for the domed panel, since cream-deep sits too close to cream to read as its own shape there).

Content within a section reveals per-child on independent scroll-triggered stagger (`.reveal-page`, 0.1s delay per child, 0.7s cubic-bezier(0.16, 1, 0.3, 1) ease), rather than the section fading in as one block.

## Elevation & Depth

Two soft, warm-tinted shadow tokens carry all elevation — no hard or neutral-gray shadows. Depth is ambient (resting cards) and responsive (deepens on hover), never used to fake a hard material edge.

### Shadow Vocabulary
- **Soft** (`box-shadow: 0 10px 30px -14px rgba(125, 49, 69, 0.2)`, `--shadow-soft`): resting elevation for cards (photo-card, pro-card, pro-card__photo, hero CTA, confirmed panel row).
- **Deep** (`box-shadow: 0 24px 60px -20px rgba(125, 49, 69, 0.26)`, `--shadow-deep`): hover elevation for the same cards, and resting elevation for the highest-emphasis surfaces (booking-card, confirmed-card).

### Named Rules
**The Warm Shadow Rule.** Every shadow is tinted from cherry-ink (`rgba(125, 49, 69, …)`), never pure black or neutral gray — depth stays inside the palette's own ink instead of introducing a color the rose ramp doesn't own.

## Shapes

Three radius languages, each reserved for a specific role:
- **10px (`--radius-sm`)**: default rounding for interactive rows and inputs — photo-card, price-row buttons, booking pick-cards, date-chips, text inputs.
- **18px (`--radius`)**: the highest-emphasis containers — booking-card, confirmed-card.
- **999px (pill)**: every button, tag, and chip-shaped control — CTAs, nav pills, service tags, slot buttons, step numerals.
- **Arch (`999px 999px 12px 12px`, `--radius-arch`)**: the signature portrait frame — fully rounded top, barely rounded bottom — used only for professional photos and their card, echoing the venetianspa.ca arched-frame reference. This shape is reserved for people's portraits; it does not spread to other imagery.

The Portfolio section additionally carries the rising dome silhouette — a one-off structural shape, not part of the general radius scale. It is drawn with a **single uniform px radius on the top two corners** (`border-radius: var(--dome-r) var(--dome-r) 0 0`), never the elliptical `50% / Xpx` form. That distinction is the whole trick: the elliptical form draws a genuine ellipse, which reads as two rounded corners meeting at a flat centre, while a uniform radius past half the width gets clamped by the browser to exactly `width/2` — and the two corners then meet as a **true semicircle**. `--dome-r` is animated from `0.5w` down to a resting `0.27w` on a `(1 - t)^2.2` curve over 0.7 viewport-heights of scroll, unwinding the semicircle into a panel with soft rounded top corners. It starts at exactly `0.5w` because that is the clamp point: any larger radius paints the same semicircle, so starting higher would spend the first part of the scroll on no visible change. The curve is venetianspa.ca's `.radius-section` (`0.836w -> 0.281w`, same `^2.2` ease) with that invisible head — its first 34.5% — reparametrised away; drop it and what remains is exactly `0.5w -> 0.281w`. The pre-JS/reduced-motion fallback is `50vw`, the animation's own start value, so the shape is correct before any script runs.

## Components

### Buttons
- **Shape:** pill (`border-radius: 999px`) on every button, no exceptions.
- **Primary:** cherry background, white text, `~0.65-1rem` vertical / `1.3-1.7rem` horizontal padding depending on context, soft shadow. Hover darkens to cherry-ink and lifts `translateY(-1px to -2px)` — a hover deepens the fill, it never changes hue (nav CTA, hero CTA, booking-nav confirm).
- **Secondary / Ghost:** transparent or bordered (1.5-2px sage-deep or cream-line border), taupe-soft or sage-deep text. Hover fills with sage-deep and flips text to white (`portfolio-book`), or fills with sakura-pale and shifts the border to sakura (`lang-pill`) — sage-deep is reserved for this one ghost-button hover family, it no longer appears as a primary-button state.
- **Compact/Chip buttons** (slot-btn, date-chip): same pill or radius-sm shape at smaller padding, cream-line border at rest, solid cherry fill + white text when selected.

### Chips / Tags
- **Style:** sakura-pale background with cherry text (`pro__tag`), or transparent with cream-line border that fills sage-pale on hover (price-row icon backdrop).
- **State:** two different selected treatments, by weight of commitment. The picker cards a visitor is still choosing between (`pick-pro`, `pick-service`, and the branch pill) stay unfilled — border and background step only to sakura-deep/sakura-pale, keeping the row legible while it's still a candidate. The controls that record a made choice (`date-chip`, `slot-btn`) commit harder: solid cherry fill, white text/border, the same treatment as a pressed primary button.

### Cards / Containers
- **Corner Style:** 10px for content rows and photo tiles, 18px for elevated panels (booking, confirmation), arch for professional portraits.
- **Background:** white (photo-card) or cream-deep (pro-card, confirmed panel) — never a third neutral.
- **Shadow Strategy:** soft at rest, deep on hover, per Elevation & Depth.
- **Border:** none on true cards; 1-2px cream-line hairline on flatter list rows and unselected form controls.
- **Internal Padding:** roughly 1.4-2.5rem for elevated cards, 0.7-1.3rem for compact list rows.

### Inputs / Fields
- **Style:** 2px cream-line border, cream background, radius-sm, Work Sans body font at 1rem.
- **Focus:** border shifts to sakura-deep (component-local), while the page-wide `:focus-visible` rule is a 2px sage-deep outline with 3px offset — inputs override to the accent color, everything else uses the sage focus ring.

### Navigation
- **Style:** transparent over the hero, transitioning to a frosted `rgba(253, 248, 246, 0.88)` bar with `blur(10px)` and a cream-line bottom border once scrolled (`.is-scrolled`). The brand slot carries the inline `Logo`. Links are taupe-soft, darkening to taupe on hover/active, with a cherry underline that wipes in from the left on the active link. The nav CTA is the same cherry pill as every other primary button. Mobile (<760px) drops links into a horizontally-scrolling strip below the bar.

### The Blossom Mark (`Blossom`, `PETAL_PATH`)
The whole identity resolves to one path. A cherry petal is broad, rounded at the shoulder, and notched at the tip — that cleft is what separates sakura from plum or peach. Two measurements make it work: the petal is ~70 degrees wide against 72 degrees of spacing, so adjacent petals nearly touch but leave a hairline gap (wider and the five fuse into a decagon blob), and the notch is a shallow 2.5-unit dimple, not a cleft (deeper puts ten sharp points on the silhouette and the mark reads as a gear at 16px). The stamens are eight gold dots on a tight ring, not drawn filaments — filaments alias into a spider at 30px and vanish at 16px. Petals are composited with group `opacity`, never `fill-opacity`, or the five overlaps compound into dark wedges and the flower reads as a pinwheel.

### Hero Canopy (`HeroCanopy`)
The hero has no photograph. Its whole background is two mirrored instances of this component — a stroke bough plus nine blossoms and four buds, the same vocabulary as `BranchWatermark`, at a scale that owns the viewport instead of sitting in a section corner. One enters top-left, one `flip`s in from top-right, both denser near their entering corner and tapering to nothing as they reach toward the centered copy, so the text always sits on clear cream rather than crossed branches. Opacity (0.62 desktop, 0.5 and a smaller `clamp` under 760px) keeps the canopy a presence behind the copy rather than a second subject competing with it — the mid step in the range between `BranchWatermark`'s 0.4 ambient-watermark ceiling and full strength, because here the branch carries the whole first viewport rather than one section's corner.

The canopy grows in rather than simply appearing, the same technique the old hero seal proved: each stem/branch path draws itself (`stroke-dashoffset` normalized to `pathLength="1"`, so the draw-on timing survives anyone editing the curve later), buds catch up to their nearest point on the stem, then the blossoms open on top — stem at 0ms, the two sub-branches at 380/620ms, buds and blossoms staggered by index from ~420ms through ~1.4s. The right instance carries a 150ms overall offset (`--canopy-delay`) so the two sides read as one structure growing unevenly, not a mirrored effect calling attention to its own symmetry. The nav-style mark above the headline (`.hero__mark-row`) echoes the gesture as a quick 420ms flourish of its own, so the whole entrance reads as one motif blooming at two scales rather than one slow effect and one static holdover. Every piece settles into exactly its resting value (rotate/scale/opacity), so an interrupted or skipped animation still lands correctly, and all of it drops straight to that resting state under `prefers-reduced-motion`, with no draw or bloom at all.

Every animated piece — the canopy's strokes/buds/blossoms and the mark-row blossom — is gated on a `revealed` flag, not on mount: Hero renders behind index.html's own preload curtain, so an animation that starts as soon as its element exists would run its whole course while still covered and finish before the curtain ever lifts. Each keyframe sits `animation-play-state: paused` from the stylesheet, which — combined with the `both` fill mode — holds every element at its frame-0 state (undrawn stem, closed bud, unbloomed flower) for as long as the page is behind the curtain. `HeroCanopy` takes `revealed` as its own prop rather than reading `.hero`'s class directly, so it stays a self-contained component; Hero flips its `revealed` state once `window.SakuraPreloader.lifted` resolves (the same signal `lib/preloader.js` uses to release Lenis), and every delay in the sequence counts from that moment, not from React mount.

The hero background carries a soft radial blush-into-cream wash (`radial-gradient(62% 55% at 50% 40%, var(--blush) ...)`) behind the canopy and the page's own petal texture — the same soft-bloom-behind-the-lockup treatment index.html's own preload curtain already uses, so the curtain lifts onto a hero that continues its exact visual language rather than switching to an unrelated scene.

### Logo (`Logo`)
Built out of the page's own typography, not imported over it: "Sakura" in Libre Caslon Display, "Bloom" in Libre Caslon Text italic in cherry. **Inline** (mark + two-line type) for the nav, where the mark rests at -8 degrees and rights itself on hover. **Stacked** (mark over a 0.14em-tracked uppercase wordmark, italic tail hung between two gold hairlines) for the footer. Below 760px the nav drops the italic tail — the mark already says it. The favicon is the same mark at 0.86 scale on cream.

### Branch Watermark (`BranchWatermark`)
A line-art bough with six blossoms and four buds, real SVG rather than a background image so it inherits the palette tokens and can be flipped per section. One per section, entering from a different corner each time and **never the top-left**, where every heading sits. 0.4 opacity desktop, 0.28 mobile.

### Petal Ground (`--petal-texture`, `.petal-ground`)
A tiled fallen-petal texture under every full-width surface: six petals per 320px tile at 0.11 alpha. Deliberately sparse — denser or darker and it stops being ground and becomes wallpaper that body copy has to be read against.

### Sakura Divider & Falling Petals
- **Sakura Divider:** a gold line-art branch with three blossoms at descending scales, centered as a pure visual boundary between sections — never bound to a heading or carrying text.
- **Falling Petals:** petals (`border-radius: 100% 0 100% 0`) on a linear infinite fall with randomized position, delay, duration, size, drift, spin, and peak opacity. 28 in the hero, 14 at 0.8 scale in the booking section, so the first and last screens rhyme — and with the hero's own branches now visible overhead, the fall reads as literally dropping from them rather than from an implied off-screen source. Fall distance is the `--fall-span` token (default `115vh`) because percentage translations resolve against the petal's own 10px box, not its container. Fully disabled under `prefers-reduced-motion: reduce`.

## Do's and Don'ts

### Do:
- **Do** keep cherry as the only "go/selected/primary" signal across the whole site, and deepen to cherry-ink on hover rather than changing hue.
- **Do** draw every blossom from the single shared `PETAL_PATH` — the motif recurs by rescaling one shape, never by drawing a new flower.
- **Do** reserve the arch radius (`999px 999px 12px 12px`) for professional portraits only.
- **Do** tint every shadow from taupe (`rgba(74, 63, 56, …)`); never introduce a neutral-gray shadow.
- **Do** enter each section's bough from a corner no other section uses, and never from the top-left, where the heading lives.
- **Do** use pill shape (999px) for every button, tag, and chip without exception.
- **Do** honor `prefers-reduced-motion` for every decorative animation (petals, hero pin/scale, scroll-reveal stagger) exactly as the incumbent implementation does.

### Don't:
- **Don't** introduce a second display typeface or a second italic emphasis style — one serif family, one italic accent word per headline.
- **Don't** let gold fill anything larger than a hairline stroke or a small ornament; it is a finishing detail, not a palette color.
- **Don't** read the motif's promotion as permission to fill space: it is one shape at many scales, at low opacity, over the same generous whitespace. Two blossoms competing in one corner is the failure mode, not too few.
- **Don't** put a rose lighter than cherry behind white text, or use one as small text on a pale ground.
- **Don't** reintroduce a bespoke/thematic concept (leather, stamps, tickets, or similar) — that direction was explicitly built and rejected as gimmicky and wrong-personality for this brand.
