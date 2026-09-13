import { useLanguage } from "../i18n/LanguageContext";
import { portfolio } from "../data";
import Reveal from "./Reveal";
import Blossom, { BranchWatermark, FallingPetals } from "./Sakura";
import Icon from "./Icon";
import "./Portfolio.css";

// Every 5th tile runs wide (2 columns) so the grid reads as an editorial
// bento layout — one feature photo plus a companion, then a trio of equal
// tiles — rather than a uniform wall. Row-only spans (never row spans too)
// so this pattern can never leave a gap for grid-auto-flow to fight with.
function isWideTile(index) {
  return index % 5 === 0;
}

export default function Portfolio({ onBook }) {
  const { t, lang } = useLanguage();

  const gridItems = portfolio.map((item) => ({
    id: item.id,
    src: item.photo,
    srcSmall: item.photoSmall,
    srcWidth: item.photoWidth,
    position: item.photoPosition,
    caption: item[lang]?.caption,
    alt: `${t.portfolio.imageAlt} — ${item[lang]?.caption ?? ""}`,
    serviceId: item.serviceId,
    professionalId: item.professionalId,
  }));

  return (
    <section id="trabajos" className="portfolio-section">
      <div className="portfolio-section__ornament">
        <Blossom size={30} color="var(--cherry)" />
      </div>
      {/* Two buds set just off the apex, riding the arc's own curve, so the
          crown reads as a sprig rather than a lone centred stamp. */}
      <div className="portfolio-crown portfolio-crown--left" aria-hidden="true">
        <Blossom size={15} color="var(--sakura-mid)" stamens={false} />
      </div>
      <div className="portfolio-crown portfolio-crown--right" aria-hidden="true">
        <Blossom size={12} color="var(--sakura)" stamens={false} />
      </div>
      {/* Bounded to the dome: the layer inherits the section's animated radius,
          so petals are clipped by the arc instead of by its bounding box. */}
      <FallingPetals className="portfolio-section__petals" count={11} scale={0.85} />
      {/* The bough enters from the right, below the dome's apex, so it never
          crowds the single blossom that crowns the arc. */}
      <BranchWatermark className="portfolio-section__branch" flip />
      {/* A second, smaller bough low on the left — unflipped, so the two never
          mirror each other. */}
      <BranchWatermark className="portfolio-section__branch-left" />

      {/* Scattered blossoms, all kept inside the arc: near the top only the
          centre band is pink, so anything set wide sits low on the section. */}
      <div className="portfolio-blossoms" aria-hidden="true">
        <span className="portfolio-blossom portfolio-blossom--a">
          <Blossom size={26} color="var(--sakura-mid)" />
        </span>
        <span className="portfolio-blossom portfolio-blossom--b">
          <Blossom size={17} color="var(--sakura)" stamens={false} />
        </span>
        <span className="portfolio-blossom portfolio-blossom--c">
          <Blossom size={21} color="var(--sakura-mid)" stamens={false} />
        </span>
        <span className="portfolio-blossom portfolio-blossom--d">
          <Blossom size={14} color="var(--sakura)" stamens={false} />
        </span>
        <span className="portfolio-blossom portfolio-blossom--e">
          <Blossom size={23} color="var(--sakura-mid)" />
        </span>
      </div>
      <Reveal className="section">
        <h2 className="section-kicker-free-heading">{t.portfolio.title}</h2>
        <p className="portfolio-subtitle">{t.portfolio.subtitle}</p>

        <div className="portfolio-grid" aria-label={t.portfolio.carouselLabel}>
          {/* Every tile books straight into the wizard with its own service
              and professional already picked — a grid has no single "active"
              panel the way the old carousel did, so the action moves onto
              whichever photo she's actually looking at. */}
          {gridItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`portfolio-tile${isWideTile(index) ? " portfolio-tile--wide" : ""}`}
              style={{ "--tile-index": index }}
              onClick={() => onBook(item.serviceId, item.professionalId)}
            >
              {/* Width descriptors + sizes, not density (1x/2x) descriptors:
                  a 1x/2x pair leaves the browser guessing a device-pixel-ratio
                  "bucket" with no notion of actual layout size, and on a
                  ~2.6-3x mobile DPR it rounds up to the 2x file even though a
                  480px-wide tile only ever needs the small one. `sizes` gives
                  it the real CSS width so it can pick correctly regardless of
                  DPR — mirrors the grid's own breakpoint at 900px, where a
                  "wide" tile drops back to a single column (Portfolio.css). */}
              <img
                src={item.src}
                srcSet={`${item.srcSmall} 480w, ${item.src} ${item.srcWidth}w`}
                sizes={
                  isWideTile(index)
                    ? "(max-width: 900px) 45vw, 63vw"
                    : "(max-width: 900px) 45vw, 31vw"
                }
                alt={item.alt}
                loading="lazy"
                className="portfolio-tile__image"
                style={item.position ? { objectPosition: item.position } : undefined}
              />
              <span className="portfolio-tile__caption">
                <span className="portfolio-tile__caption-text">{item.caption}</span>
                <span className="portfolio-tile__caption-cta">
                  {t.services.bookThis}
                  <Icon name="arrowRight" size={15} />
                </span>
              </span>
            </button>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
