import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { portfolio } from "../data";
import Reveal from "./Reveal";
import Blossom, { BranchWatermark, FallingPetals } from "./Sakura";
import Carousel3D from "./Carousel3D";
import "./Portfolio.css";

export default function Portfolio({ onBook }) {
  const { t, lang } = useLanguage();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const carouselItems = portfolio.map((item) => ({
    src: item.photo,
    caption: item[lang]?.caption,
    alt: `${t.portfolio.imageAlt} — ${item[lang]?.caption ?? ""}`,
  }));

  const activeItem = portfolio[activeIndex];

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

        <Carousel3D
          className="portfolio-carousel"
          items={carouselItems}
          itemWidth={420}
          itemRatio={0.95}
          autoRotateDuration={90}
          paused={reducedMotion}
          onActiveIndexChange={setActiveIndex}
          groupLabel={t.portfolio.carouselLabel}
          prevLabel={t.portfolio.prev}
          nextLabel={t.portfolio.next}
        />

        {/* Routes the front panel straight into the wizard with its service
            and professional already picked, instead of leaving "I want that"
            with nowhere to go but a cold start at the booking section. */}
        <button
          type="button"
          className="portfolio-book"
          onClick={() => onBook(activeItem.serviceId, activeItem.professionalId)}
        >
          {t.services.bookThis}
        </button>
      </Reveal>
    </section>
  );
}
