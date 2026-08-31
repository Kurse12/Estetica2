import { useLanguage } from "../i18n/LanguageContext";
import { professionals } from "../data";
import Icon from "./Icon";
import Reveal from "./Reveal";
import Blossom, { BranchWatermark, PetalScatter } from "./Sakura";
import "./Professionals.css";

export default function Professionals({ onBookWith }) {
  const { t, lang } = useLanguage();

  return (
    <section id="profesionales" className="pros-section petal-ground">
      <BranchWatermark className="pros-section__branch" flip />
      <PetalScatter className="pros-section__fallen" count={8} />
      <Reveal className="section">
        <h2 className="section-kicker-free-heading">{t.professionals.title}</h2>
        <p className="pros-subtitle">{t.professionals.subtitle}</p>

        {/* Its own Reveal, so the portraits stagger in one by one instead of
            arriving as a single block behind the heading. */}
        <Reveal className="pros-gallery">
          {professionals.map((pro) => (
            <figure key={pro.id} className="pro">
              {/* The frame is the button: clicking anywhere on the portrait
                  books with her, so the veil holds a cue, not a nested button. */}
              <button
                type="button"
                className="pro__frame"
                onClick={() => onBookWith(pro.id)}
                aria-label={`${t.professionals.bookWith} ${pro.name}`}
              >
                <img src={pro.photo} alt="" loading="lazy" width="300" height="405" />
                <span className="pro__veil">
                  <span className="pro__meta">{pro[lang].role}</span>
                  <span className="pro__bio">{pro[lang].bio}</span>
                  <span className="pro__cue">
                    {t.professionals.bookWith} {pro.name.split(" ")[0]}
                    <Icon name="arrowRight" size={15} />
                  </span>
                </span>
              </button>

              {/* On the arch's shoulder, not inside it: the frame clips to the
                  999px dome and would eat anything set in its top corners. */}
              <span className="pro__seal" aria-hidden="true">
                <Blossom size={30} color="var(--sakura)" stamens={false} />
              </span>

              <figcaption className="pro__caption">
                <h3 className="pro__name">{pro.name}</h3>
                <span className="pro__rule" aria-hidden="true" />
                <p className="pro__credits">
                  <span className="pro__tag">{pro[lang].specialty}</span>
                  {/* Experience stays out of the veil: it is a trust signal, and
                      a trust signal that needs a hover to appear is not one. */}
                  <span className="pro__years">
                    <span className="numerals">{pro.years}</span> {t.professionals.yearsSuffix}
                  </span>
                </p>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </Reveal>
    </section>
  );
}
