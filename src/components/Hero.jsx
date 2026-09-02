import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { onSmoothScroll } from "../lib/smoothScroll";
import Icon from "./Icon";
import Blossom, { FallingPetals, HeroCanopy, PetalScatter } from "./Sakura";
import "./Hero.css";

// The dome's top radius, as a fraction of the section's width. START is exactly
// the clamp point: the browser scales any radius pair wider than the box down to
// width/2, so 0.5w is both a true semicircle AND the largest value that still
// paints a distinct shape. Starting there means every pixel of scroll visibly
// opens the arc, instead of the first third being spent on radii that all clamp
// to the same semicircle.
//
// The curve itself is still venetianspa.ca's. Its .radius-section runs
// 1192px -> 400px over 625px of scroll on a 1425px-wide viewport (0.836w ->
// 0.281w) on a (1-t)^2.2 ease — but 0.836w to 0.5w is invisible, so its arc
// only starts opening 34.5% of the way in. Reparametrising away that dead
// stretch leaves 0.5w -> 0.281w on the same exponent, which is what's below.
const DOME_R_START = 0.5;
const DOME_R_REST = 0.27;
const DOME_EASE = 2.2;
const DOME_TRAVEL = 0.7; // of viewport height

// Max pull toward the cursor, in px, along each axis. Y carries the CTA's
// resting -2px hover lift as its own baseline (see the pointermove handler
// below) rather than leaving that lift to a separate :hover rule — a CSS
// :hover transform and a JS-written inline transform both sit at the same
// cascade tier, so whichever runs last would just clobber the other's value
// instead of combining with it.
const MAGNET_RANGE_X = 5;
const MAGNET_RANGE_Y = 4;
const MAGNET_REST_LIFT = -2;

// How far apart each headline word rises after the last one, and how long
// after mount the first word goes — a beat after the mark-row blossom
// (hero-mark-bloom, 80ms delay + 420ms) so the title doesn't fire in the same
// instant as the logo, while still starting well inside the canopy's own
// 850ms stem draw rather than waiting for it to finish. Body and the CTA's
// reveal wrapper are just the next two slots in the same beat: the emphasis
// phrase takes slot leadWords.length, body is leadWords.length + 1, the CTA
// leadWords.length + 2.
const WORD_STEP_MS = 220;
const WORD_START_MS = 180;

function domeRadius(t) {
  const w = window.innerWidth;
  return (DOME_R_REST + (DOME_R_START - DOME_R_REST) * (1 - t) ** DOME_EASE) * w;
}

// Mirrors .portfolio-section's --dome-peek. It can't be read back off the
// section: the peek is folded into a margin-top that also carries the hero's
// pin travel, and a custom property's computed value is still the unresolved
// clamp(). It only shifts the animation's start by a few px, so an approximate
// match is fine — this is not a value worth an @property registration for.
function domePeek() {
  return Math.min(Math.max(window.innerHeight * 0.075, 44), 90);
}

export default function Hero() {
  const { t } = useLanguage();
  const innerRef = useRef(null);
  const ctaRef = useRef(null);
  const sectionRef = useRef(null);
  const petalFieldRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  // Split once per language rather than on every render — the words
  // themselves only change when the visitor flips the language toggle.
  const leadWords = useMemo(() => t.hero.titleLead.trim().split(/\s+/), [t.hero.titleLead]);
  const emphasisDelay = leadWords.length * WORD_STEP_MS;
  const bodyDelay = (leadWords.length + 1) * WORD_STEP_MS;
  const ctaRevealDelay = (leadWords.length + 2) * WORD_STEP_MS;

  // The branch-grow/blossom-bloom entrance plays via CSS animations that sit
  // paused-at-frame-0 until this class starts them — because Hero mounts
  // behind index.html's own preload curtain, well before the visitor can see
  // it. Playing on mount, like a normal entrance would, burns the whole
  // sequence while it's still covered, so the curtain lifts on a scene
  // that's already finished. window.SakuraPreloader.lifted is the same
  // signal lib/preloader.js uses to release Lenis; it resolves immediately
  // if the curtain is already gone (client warm-reload, or the inline
  // script was stripped).
  useEffect(() => {
    const shell = window.SakuraPreloader;
    if (!shell) {
      setRevealed(true);
      return;
    }
    let cancelled = false;
    shell.lifted.then(() => {
      if (!cancelled) setRevealed(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const innerEl = innerRef.current;

    const clearVars = () => {
      innerEl?.style.removeProperty("--curtain-progress");
      domeEl?.style.removeProperty("border-top-left-radius");
      domeEl?.style.removeProperty("border-top-right-radius");
    };

    // The hero itself is position:sticky, so its own getBoundingClientRect()/
    // offsetTop freeze at the stuck position once pinned and can't be used to
    // measure scroll. The dome section right after it is a normal, non-sticky
    // element, so its rect genuinely tracks how far the user has scrolled —
    // measure off that instead.
    let domeEl = document.querySelector(".portfolio-section");

    // Under reduced motion the dome keeps its resting shape — the fully round
    // arc it wears at the top of the page — and simply never unwinds. The CSS
    // fallback already paints that, so there is nothing to write.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Both values are written straight onto the one element that consumes them,
    // never onto <html>. A custom property on the root is inherited, so setting
    // one there every frame invalidates the computed style of the whole
    // document — every card, every one of the 70-odd drifting petals — for two
    // numbers that only two elements read.
    //
    // The radius goes on as the longhands rather than as --dome-r for the same
    // reason one level down: a custom property on the section would invalidate
    // the carousel underneath it, while the longhand touches nothing but the
    // section's own box. Inline wins over the stylesheet's shorthand, so the
    // bottom corners still come from Portfolio.css.
    let lastProgress = -1;
    let lastRadius = -1;

    function apply() {
      if (!domeEl) {
        domeEl = document.querySelector(".portfolio-section");
        if (!domeEl) return;
      }
      const vh = window.innerHeight;
      const domeTop = domeEl.getBoundingClientRect().top;
      // Distance the dome has climbed since its resting position, where it
      // pokes exactly `peek` px above the fold.
      const peek = domePeek();
      const risen = vh - peek - domeTop;

      const t = Math.min(Math.max(risen / (vh * DOME_TRAVEL), 0), 1);
      const progress = Math.min(Math.max(risen / (vh - peek), 0), 1);

      // Quantised, then compared: the radius crosses roughly half a pixel per
      // pixel of scroll, so rounding to whole px drops about half the writes
      // and every one it drops was a full repaint of a 100svh section — a
      // border-radius is not a compositable property, unlike the hero's
      // transform, so each distinct value re-rasterises the whole box.
      const rounded = Math.round(progress * 1000) / 1000;
      if (rounded !== lastProgress) {
        lastProgress = rounded;
        innerEl?.style.setProperty("--curtain-progress", String(rounded));
      }

      const radius = Math.round(domeRadius(t));
      if (radius !== lastRadius) {
        lastRadius = radius;
        domeEl.style.borderTopLeftRadius = `${radius}px`;
        domeEl.style.borderTopRightRadius = `${radius}px`;
      }
    }
    function onResize() {
      // The radius is a fraction of the viewport width and the peek a fraction
      // of its height, so both caches are stale after a resize.
      lastProgress = -1;
      lastRadius = -1;
      apply();
    }

    apply();
    const unsubscribe = onSmoothScroll(apply);
    window.addEventListener("resize", onResize);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", onResize);
      clearVars();
    };
  }, []);

  // The CTA pulls a few px toward the cursor while the pointer is over it —
  // reserved for fine pointers (touch has no hover to key the pull off) and
  // skipped under reduced motion. Written the same way the dome radius above
  // is: straight onto the one element that reads it, rAF-batched, no React
  // state for a value that changes on every pointer sample.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = null;
    let targetX = 0;
    let targetY = 0;

    function apply() {
      raf = null;
      el.style.setProperty("--magnet-x", `${targetX.toFixed(2)}px`);
      el.style.setProperty("--magnet-y", `${targetY.toFixed(2)}px`);
    }

    function schedule() {
      if (raf == null) raf = requestAnimationFrame(apply);
    }

    function onPointerMove(e) {
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = nx * MAGNET_RANGE_X;
      targetY = MAGNET_REST_LIFT + ny * MAGNET_RANGE_Y;
      schedule();
    }

    function onPointerLeave() {
      targetX = 0;
      targetY = 0;
      schedule();
    }

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);
    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      if (raf != null) cancelAnimationFrame(raf);
      el.style.removeProperty("--magnet-x");
      el.style.removeProperty("--magnet-y");
    };
  }, []);

  // The falling-petal layer drifts a few px toward the cursor — same
  // fine-pointer/reduced-motion gating as the CTA's magnet above, written
  // the same rAF-batched, no-React-state way, just onto a different element
  // over a wider trigger area (the whole section instead of one button).
  useEffect(() => {
    const sectionEl = sectionRef.current;
    const fieldEl = petalFieldRef.current;
    if (!sectionEl || !fieldEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = null;
    let targetX = 0;
    let targetY = 0;

    function apply() {
      raf = null;
      fieldEl.style.setProperty("--pointer-x", targetX.toFixed(3));
      fieldEl.style.setProperty("--pointer-y", targetY.toFixed(3));
    }

    function schedule() {
      if (raf == null) raf = requestAnimationFrame(apply);
    }

    function onPointerMove(e) {
      const rect = sectionEl.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2));
      targetY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2));
      schedule();
    }

    function onPointerLeave() {
      targetX = 0;
      targetY = 0;
      schedule();
    }

    sectionEl.addEventListener("pointermove", onPointerMove);
    sectionEl.addEventListener("pointerleave", onPointerLeave);
    return () => {
      sectionEl.removeEventListener("pointermove", onPointerMove);
      sectionEl.removeEventListener("pointerleave", onPointerLeave);
      if (raf != null) cancelAnimationFrame(raf);
      fieldEl.style.removeProperty("--pointer-x");
      fieldEl.style.removeProperty("--pointer-y");
    };
  }, []);

  return (
    // position:sticky releases at the bottom edge of its containing block —
    // that's this wrapper's own box, not <main>. Without it, .hero's nearest
    // block ancestor is <main> (which spans every section), so it would stay
    // pinned across the whole page instead of releasing once Portfolio's
    // dome has risen over it.
    <div className="hero-pin">
      <section id="inicio" className={`hero ${revealed ? "is-revealed" : ""}`} ref={sectionRef}>
        {/* The background is no longer a photograph: two mirrored boughs,
            entering top-left and top-right and tapering as they reach toward
            the centered copy, grow in on load instead of a photo simply
            being there. Same stroke-plus-blossom vocabulary as
            BranchWatermark elsewhere on the site, just the hero's own scale
            and its one entrance moment. The right instance starts 150ms
            after the left rather than in lockstep, so the two sides read as
            one branch structure growing unevenly rather than a mirrored
            effect calling attention to itself — sized unevenly too now
            (--minor/--major, in Hero.css), so the asymmetry reads at a
            glance instead of only revealing itself once the entrance has
            finished. Mobile keeps both at the shared base size: the
            exaggerated size gap is a wide-viewport flourish, not something
            worth the added visual noise on a phone. */}
        <HeroCanopy revealed={revealed} className="hero-canopy--minor" />
        <HeroCanopy revealed={revealed} flip delayMs={150} className="hero-canopy--major" />
        {/* Wrapped so the whole field can drift a few px toward the cursor
            (see the pointermove effect above) without touching the falling
            animation each petal already runs on its own layer. */}
        <div className="hero__petal-field" ref={petalFieldRef}>
          {/* Thinned from 44. Every petal in the air is a layer the compositor
              moves on every scroll frame, and past about this many the hero is
              paying for density the eye reads as texture rather than as petals. */}
          <FallingPetals count={28} />
        </div>
        {/* What the fall gave up, at rest: a drift gathered along the cream
            foot of the section, now spanning both edges since the copy above
            it is centered rather than hugging the left margin. */}
        <PetalScatter className="hero__fallen" count={10} />
        <div className="hero__inner" ref={innerRef}>
          <div className="hero__copy">
            <div className="hero__mark-row">
              <span className="hero__mark-line" aria-hidden="true" />
              <Blossom size={40} />
              <span className="hero__mark-line" aria-hidden="true" />
            </div>
            {/* Each word rises on its own beat instead of the whole line
                arriving at once, timed to start just after the mark blooms
                and land well before the canopy has finished blossoming
                behind it — see WORD_STEP_MS/WORD_START_MS above. */}
            <h1 className="hero__title">
              {leadWords.flatMap((word, i) => [
                // The space is a plain sibling text node, not part of the
                // span: a trailing space *inside* an inline-block gets
                // trimmed as trailing whitespace of that box's own line, so
                // nesting it there silently glues each word to the next.
                <span
                  key={`${word}-${i}`}
                  className="hero__word"
                  style={{ "--word-delay": `${WORD_START_MS + i * WORD_STEP_MS}ms` }}
                >
                  {word}
                </span>,
                " ",
              ])}
              <span
                className="hero__word hero__word--emphasis"
                style={{ "--word-delay": `${WORD_START_MS + emphasisDelay}ms` }}
              >
                <em>{t.hero.titleEmphasis}</em>
                {t.hero.titleTail}
              </span>
            </h1>
            <p className="hero__body" style={{ "--word-delay": `${WORD_START_MS + bodyDelay}ms` }}>
              {t.hero.body}
            </p>
            {/* The entrance fade/rise lives on this wrapper, not on .hero__cta
                itself: a CSS animation's held value for a property outranks
                any other declaration for that same property (even an inline
                style), so if the entrance animated the button's own
                transform, it would permanently block the magnet effect's
                transform once the entrance finished and its `both` fill mode
                kept holding translateY(0). Keeping .hero__cta free of any
                `animation` lets the magnet effect own that property outright. */}
            <span
              className="hero__cta-reveal"
              style={{ "--word-delay": `${WORD_START_MS + ctaRevealDelay}ms` }}
            >
              <a href="#reservar" className="hero__cta" ref={ctaRef}>
                {t.hero.cta}
                <Icon name="arrowRight" size={18} />
              </a>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
