import { useLanguage } from "../i18n/LanguageContext";
import Icon from "./Icon";
import { BranchWatermark, Logo, PetalScatter } from "./Sakura";
import LocationMap from "./LocationMap";
import "./Footer.css";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      {/* The bough arrives from the top-left and runs out over the columns —
          the page closes under the same branch the hero opened beneath. */}
      <BranchWatermark className="site-footer__branch" />
      <PetalScatter className="site-footer__fallen" count={6} />

      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Logo variant="stacked" />
          <p className="site-footer__tagline">{t.footer.tagline}</p>
        </div>

        <div className="site-footer__col">
          <span className="site-footer__label">
            <Icon name="clock" size={15} /> {t.footer.hours}
          </span>
          <p>{t.footer.hoursValue}</p>
        </div>

        <div className="site-footer__col">
          <span className="site-footer__label">
            <Icon name="pin" size={15} /> {t.footer.location}
          </span>
          <p>{t.footer.locationValue}</p>
        </div>

        <div className="site-footer__col">
          <span className="site-footer__label">
            <Icon name="leaf" size={15} /> {t.footer.contact}
          </span>
          <p>
            <a href={`mailto:${t.footer.email}`}>{t.footer.email}</a>
          </p>
          <p>
            <a href={`tel:${t.footer.phone.replace(/\s/g, "")}`}>{t.footer.phone}</a>
          </p>
        </div>
      </div>

      <LocationMap />

      <div className="site-footer__rule" />
      <p className="site-footer__rights">
        © {new Date().getFullYear()} {t.nav.brand} — {t.footer.rights}
      </p>
    </footer>
  );
}
