import { useLayoutEffect, useRef } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { onSmoothScroll } from "../lib/smoothScroll";
import Icon from "./Icon";
import Blossom, { FallingPetals, PetalScatter } from "./Sakura";
import "./Hero.css";

// Cherry blossoms against blue sky — Weliton Soranzo, Unsplash (free license).
// Mirrored by the <link rel="preload"> in index.html, which starts this
// download on the first frame instead of on mount, and is what the curtain
// there waits for. Change one, change the other.
const HERO_PHOTO =
  "https://images.unsplash.com/photo-1761864534000-337153e88c92?w=2400&q=80&fm=jpg&fit=crop&auto=format";

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

  return (
    // position:sticky releases at the bottom edge of its containing block —
    // that's this wrapper's own box, not <main>. Without it, .hero's nearest
    // block ancestor is <main> (which spans every section), so it would stay
    // pinned across the whole page instead of releasing once Portfolio's
    // dome has risen over it.
    <div className="hero-pin">
      <section id="inicio" className="hero">
        <div className="hero__bg" aria-hidden="true">
          <img src={HERO_PHOTO} alt="" />
          <div className="hero__scrim" />
        </div>
        {/* Thinned from 44. Every petal in the air is a layer the compositor
            moves on every scroll frame, and past about this many the hero is
            paying for density the eye reads as texture rather than as petals. */}
        <FallingPetals count={28} />
        {/* What the fall gave up, at rest: a drift gathered in the cream at the
            foot of the copy, where the scrim is opaque and the photo's own
            blossoms are not already doing this job. Costs one paint, not a
            frame. */}
        <PetalScatter className="hero__fallen" count={7} />
        <div className="hero__inner" ref={innerRef}>
          <div className="hero__copy">
            <Blossom size={34} />
            <h1 className="hero__title">
              {t.hero.titleLead}
              <em>{t.hero.titleEmphasis}</em>
              {t.hero.titleTail}
            </h1>
            <p className="hero__body">{t.hero.body}</p>
            <a href="#reservar" className="hero__cta">
              {t.hero.cta}
              <Icon name="arrowRight" size={18} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
