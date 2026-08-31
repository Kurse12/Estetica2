import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { onSmoothScroll } from "../lib/smoothScroll";
import { Logo } from "./Sakura";
import "./Nav.css";

const sections = [
  { id: "inicio", key: "inicio" },
  { id: "trabajos", key: "trabajos" },
  { id: "servicios", key: "servicios" },
  { id: "profesionales", key: "profesionales" },
];

export default function Nav() {
  const { t, toggleLang } = useLanguage();
  const [active, setActive] = useState("inicio");
  const [pastHero, setPastHero] = useState(false);
  const [tucked, setTucked] = useState(false);

  // Two different questions, so two different observers. `active` is which link
  // to underline, which is about the middle of the viewport. Whether the bar is
  // invisible or opaque is about the TOP of the viewport: it must stay
  // transparent for exactly as long as the hero photo is the thing behind it.
  //
  // The old `active !== "inicio"` answered neither — the hero is sticky and the
  // dome is pulled up over it, so "trabajos" becomes the active section while
  // the top half of the screen is still photo, and the bar would go solid over
  // it. What actually matters is the dome's top edge reaching the bar, so watch
  // for that directly.
  //
  // The root is squeezed to a band across the top of the viewport, so the dome
  // "enters" it at the moment it rises under the bar. Once the dome has scrolled
  // all the way past, it leaves that band from above rather than from below —
  // hence the second clause, which keeps the bar solid for the rest of the page
  // instead of letting it turn transparent again over the sections below.
  useEffect(() => {
    const dome = document.querySelector(".portfolio-section");
    if (!dome) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(entry.isIntersecting || entry.boundingClientRect.top < 0),
      { rootMargin: "0px 0px -92% 0px", threshold: 0 }
    );
    observer.observe(dome);
    return () => observer.disconnect();
  }, []);

  // On a phone the bar and its link strip cost 132px of a 667px viewport, held
  // for the whole page. So past the hero it tucks away while the visitor reads
  // downward and returns on the first upward flick — the direction a thumb
  // moves when it wants navigation. The threshold exists because a scroll is
  // never one clean direction: without it, the rubber-band at the end of a
  // flick flips the bar back and forth. Over the hero it never tucks, and it
  // always returns near the top of the page.
  const lastScroll = useRef(0);
  // A nav link sends the page downward, which is exactly the gesture that tucks
  // the bar — so without this, clicking "Servicios" made the bar vanish and
  // left the 138px it had reserved above the heading standing empty. The bar
  // holds for the length of the trip, then resumes reading the scroll.
  const holdUntil = useRef(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const THRESHOLD = 8;
    return onSmoothScroll(() => {
      const y = window.scrollY;
      const delta = y - lastScroll.current;
      if (Math.abs(delta) < THRESHOLD) return;
      lastScroll.current = y;
      if (performance.now() < holdUntil.current) return;
      setTucked(y > window.innerHeight * 0.9 && delta > 0);
    });
  }, []);

  function holdBar() {
    holdUntil.current = performance.now() + 1600;
    setTucked(false);
  }

  useEffect(() => {
    const targets = [...sections.map((s) => s.id), "reservar"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`site-nav ${pastHero ? "is-solid" : ""} ${tucked ? "is-tucked" : ""}`}
      onClickCapture={holdBar}
    >
      <div className="site-nav__inner">
        {/* The wordmark is drawn from two spans, so the link carries the brand
            name as its own label rather than leaving a screen reader to run
            "Sakura" and "Bloom" together. */}
        <a href="#inicio" className="site-nav__brand" aria-label={t.nav.brand}>
          <Logo />
        </a>
        <nav className="site-nav__links" aria-label={t.nav.sections}>
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`site-nav__link ${active === s.id ? "is-active" : ""}`}
            >
              {t.nav[s.key]}
            </a>
          ))}
        </nav>
        <div className="site-nav__actions">
          <button type="button" className="lang-pill" onClick={toggleLang} aria-label={t.nav.switchLanguage}>
            {t.langToggle}
          </button>
          <a href="#reservar" className={`site-nav__cta ${active === "reservar" ? "is-active" : ""}`}>
            {t.nav.reservar}
          </a>
        </div>
      </div>
    </header>
  );
}
