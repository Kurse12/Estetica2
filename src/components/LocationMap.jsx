import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "../i18n/LanguageContext";
import { locations } from "../data";
import Icon from "./Icon";
import "./LocationMap.css";

const BRANCH_ZOOM = 15;

/* Each pin carries its neighbourhood on a chip that runs to its right, so
   fitting the three coordinates with even padding clips the label of whichever
   branch is furthest east. The right side is given the chip's own width back,
   capped against narrow canvases where 150px would be half the map. */
function overviewFit(map) {
  const width = map.getSize().x;
  return {
    paddingTopLeft: [46, 46],
    paddingBottomRight: [Math.min(150, Math.round(width * 0.34)), 46],
  };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* A blossom rather than Leaflet's default blue teardrop: the marker is drawn
   entirely in CSS off this markup, so it inherits the site's palette and the
   active state is a class toggle instead of a swapped image. */
function pinIcon() {
  return L.divIcon({
    className: "map-pin",
    html: `<span class="map-pin__dot"></span><span class="map-pin__label"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function LocationMap() {
  const { t, lang } = useLanguage();
  const [activeId, setActiveId] = useState(null);

  const canvasRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  /* Built once and torn down with the component. Leaflet owns the DOM inside
     the canvas, so React must never re-render into it — every later change
     (labels, selection, size) is pushed through the refs below. */
  useEffect(() => {
    const map = L.map(canvasRef.current, {
      // The page scrolls under Lenis; a map that ate the wheel would trap the
      // reader at the bottom of the footer. Zoom stays on the buttons and on
      // pinch, where the intent is unambiguous.
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });

    // OSM's own tiles: free and keyless. The palette they ship in is far
    // louder than this page, so the tile pane is desaturated and warmed in CSS
    // rather than swapped for a pale basemap behind an API key.
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    locations.forEach((loc) => {
      const marker = L.marker(loc.coords, { icon: pinIcon(), riseOnHover: true })
        .addTo(map)
        .on("click", () => setActiveId(loc.id));
      markersRef.current[loc.id] = marker;
    });

    map.fitBounds(locations.map((l) => l.coords), { ...overviewFit(map), animate: false });

    mapRef.current = map;

    // The footer sits below a page of reveal animations and late-loading
    // fonts; if the canvas is measured before it settles, Leaflet paints a
    // strip of grey where tiles should be.
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(canvasRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // Pin labels are the only Leaflet-owned text, so they are the only thing a
  // language switch has to reach into the map to change. They are written here
  // rather than at construction so the init effect owes nothing to `lang` and
  // never tears the map down to rebuild it.
  useEffect(() => {
    locations.forEach((loc) => {
      const el = markersRef.current[loc.id]?.getElement();
      if (!el) return;
      el.querySelector(".map-pin__label").textContent = loc[lang]?.area ?? "";
      el.title = loc[lang]?.name ?? "";
    });
  }, [lang]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      marker.getElement()?.classList.toggle("is-active", id === activeId);
    });

    const active = locations.find((l) => l.id === activeId);
    if (!active) {
      map.flyToBounds(locations.map((l) => l.coords), {
        ...overviewFit(map),
        animate: !prefersReducedMotion(),
        duration: 0.9,
      });
      return;
    }
    if (prefersReducedMotion()) map.setView(active.coords, BRANCH_ZOOM, { animate: false });
    else map.flyTo(active.coords, BRANCH_ZOOM, { duration: 1.05 });
  }, [activeId]);

  const copy = t.footer.map;

  return (
    <section className="location-map" aria-labelledby="location-map-title">
      <header className="location-map__head">
        <div>
          <h3 className="location-map__title" id="location-map-title">
            {copy.title}
          </h3>
          <p className="location-map__subtitle">{copy.subtitle}</p>
        </div>
        {activeId && (
          <button type="button" className="location-map__all" onClick={() => setActiveId(null)}>
            {copy.all}
          </button>
        )}
      </header>

      <div className="location-map__body">
        <ul className="location-map__list">
          {locations.map((loc) => {
            const l = loc[lang];
            const isActive = loc.id === activeId;
            return (
              <li key={loc.id}>
                <div className={`branch-card${isActive ? " is-active" : ""}`}>
                  {/* The whole card is the button: the map is the card's
                      payoff, so there is no smaller target to hunt for. */}
                  <button
                    type="button"
                    className="branch-card__select"
                    onClick={() => setActiveId(isActive ? null : loc.id)}
                    aria-pressed={isActive}
                  >
                    <span className="branch-card__area">
                      <Icon name="pin" size={15} /> {l.area}
                    </span>
                    <span className="branch-card__name">{l.name}</span>
                    <span className="branch-card__address">{l.address}</span>
                  </button>

                  <dl className="branch-card__meta">
                    <div>
                      <dt>
                        <Icon name="clock" size={13} /> {copy.hoursLabel}
                      </dt>
                      <dd>{l.hours}</dd>
                    </div>
                    <div>
                      <dt>
                        <Icon name="phone" size={13} /> {copy.phoneLabel}
                      </dt>
                      <dd>
                        <a href={`tel:${loc.phone.replace(/\s/g, "")}`}>{loc.phone}</a>
                      </dd>
                    </div>
                  </dl>

                  <a
                    className="branch-card__directions"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${loc.coords[0]},${loc.coords[1]}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {copy.directions} <Icon name="arrowRight" size={14} />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="location-map__canvas" ref={canvasRef} role="application" aria-label={copy.title} />
      </div>
    </section>
  );
}
