import { useLanguage } from "../i18n/LanguageContext";
import { services } from "../data";
import Icon from "./Icon";
import Reveal from "./Reveal";
import Blossom, { BranchWatermark, PetalScatter } from "./Sakura";
import "./Services.css";

export default function Services({ onBookService }) {
  const { t, lang } = useLanguage();

  return (
    <section id="servicios" className="services-section petal-ground">
      <BranchWatermark className="services-section__branch" />
      {/* The barest surface on the page — one bough in a corner and a price
          list down the middle. The scatter runs the outer margins, which is
          the only room a full-width list leaves. */}
      <PetalScatter className="services-section__fallen" count={10} />
      <Reveal className="section">
        <h2 className="section-kicker-free-heading">{t.services.title}</h2>
        <p className="services-subtitle">{t.services.subtitle}</p>

        <ul className="price-list">
          {services.map((service) => (
            <li key={service.id} className="price-row">
              <button type="button" className="price-row__button" onClick={() => onBookService(service.id)}>
                <span className="price-row__icon">
                  <Icon name={service.icon} size={20} />
                </span>
                <span className="price-row__name">
                  {service[lang].name}
                  <span className="price-row__desc">{service[lang].desc}</span>
                </span>
                {/* A blossom rides the leader line and only opens on hover —
                    the row's own affordance, drawn from the motif rather than
                    bolted on as a generic chevron. */}
                <span className="price-row__leader" aria-hidden="true" />
                <span className="price-row__bloom" aria-hidden="true">
                  <Blossom size={16} color="var(--sakura-mid)" stamens={false} />
                </span>
                <span className="price-row__duration">
                  {service.duration} {t.services.duration}
                </span>
                <span className="price-row__price numerals">${service.price}</span>
              </button>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
