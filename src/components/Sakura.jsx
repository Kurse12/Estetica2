import { useEffect, useState } from "react";
import "./Sakura.css";

// The whole identity resolves to one shape, so the shape has to be right.
// A cherry petal is broad, rounded at the shoulder, and NOTCHED at the tip —
// that cleft is the single feature that separates sakura from plum (round tip)
// or peach (pointed tip) at a glance. Drawn once here, in a 40x40 box with the
// flower's centre at 20,20, and rotated five times for the blossom.
//
// Two measurements decide whether this reads as a flower or as a gear. The
// petal is ~70 degrees wide at its shoulder against 72 degrees of spacing, so
// adjacent petals nearly touch but leave a hairline gap — wide enough and they
// fuse into a decagon blob. And the tip notch is a shallow 2.5-unit dimple, not
// a cleft: a deeper one is botanically truer but puts ten sharp points on the
// silhouette, and this mark has to survive at 16px in a browser tab first.
export const PETAL_PATH =
  "M20 19.6C15.4 17.6 12.7 14 12.9 9.8C13.1 5.6 14.6 3.4 16.4 3.6C17.9 3.8 19 5 20 6.4C21 5 22.1 3.8 23.6 3.6C25.4 3.4 26.9 5.6 27.1 9.8C27.3 14 24.6 17.6 20 19.6Z";

const PETAL_ANGLES = [0, 72, 144, 216, 288];
// Stamens read as a warm dotted crown, not as drawn filaments: stems fine
// enough to be botanical are hairlines that alias into a spider at 30px and
// vanish at 16px. Eight dots on a tight ring stay a soft gold centre at every
// size the mark is used at.
const STAMEN_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export default function Blossom({
  size = 22,
  color = "var(--sakura-deep)",
  center = "var(--gold)",
  opacity = 0.92,
  stamens = true,
  className = "",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={`blossom ${className}`}
      aria-hidden="true"
    >
      {/* Group opacity, not fill-opacity: fill-opacity is inherited and applied
          per path, so the five overlapping petals compound into dark wedges and
          the flower reads as a pinwheel. Compositing the group once keeps the
          silhouette flat. */}
      <g fill={color} opacity={opacity}>
        {PETAL_ANGLES.map((angle) => (
          <path key={angle} d={PETAL_PATH} transform={`rotate(${angle} 20 20)`} />
        ))}
      </g>
      {stamens &&
        STAMEN_ANGLES.map((angle) => (
          <circle key={angle} cx="20" cy="15.2" r="1.15" fill={center} transform={`rotate(${angle} 20 20)`} />
        ))}
      <circle cx="20" cy="20" r="2" fill={center} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Logo
//
// "Sakura" in the display serif, "Bloom" in the Caslon italic under it — the
// same display/italic pairing the headlines already use, so the logo is built
// out of the page's own typography rather than imported over it. The mark leads
// in both variants; it is the part that has to survive at favicon size.
// ---------------------------------------------------------------------------
export function Logo({ variant = "inline", markSize, className = "" }) {
  const size = markSize ?? (variant === "stacked" ? 42 : 30);
  return (
    <span className={`brand-logo brand-logo--${variant} ${className}`}>
      <Blossom size={size} color="var(--cherry)" className="brand-logo__mark" />
      <span className="brand-logo__type">
        <span className="brand-logo__name">Sakura</span>
        <span className="brand-logo__tail">Bloom</span>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Branch watermark
//
// A single line-art bough with blossoms and buds along it, dropped into a
// section corner at low opacity. Not a background-image: keeping it as real SVG
// means it inherits the palette tokens and can be flipped and scaled per
// section, so no two corners repeat the same silhouette.
// ---------------------------------------------------------------------------
const BRANCH_BLOSSOMS = [
  { x: 118, y: 64, s: 0.95, r: -12 },
  { x: 196, y: 40, s: 0.7, r: 24 },
  { x: 232, y: 116, s: 1.15, r: 8 },
  { x: 318, y: 148, s: 0.8, r: -20 },
  { x: 392, y: 118, s: 1, r: 16 },
  { x: 452, y: 176, s: 0.62, r: -8 },
];

const BRANCH_BUDS = [
  { x: 168, y: 88, r: 4 },
  { x: 278, y: 92, r: 3.2 },
  { x: 356, y: 172, r: 3.6 },
  { x: 424, y: 96, r: 2.8 },
];

export function BranchWatermark({ className = "", flip = false, tone = "var(--branch)" }) {
  return (
    <div
      className={`branch-watermark ${flip ? "branch-watermark--flip" : ""} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 520 260" fill="none" preserveAspectRatio="xMidYMid meet">
        <g stroke={tone} strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M-8 34C64 66 108 44 154 88C204 136 246 108 300 146C352 182 420 158 528 196" />
          <path d="M154 88C170 62 186 50 208 44" strokeWidth="1.5" />
          <path d="M300 146C318 122 344 108 384 112" strokeWidth="1.5" />
          <path d="M246 118C258 148 268 166 292 184" strokeWidth="1.3" />
          <path d="M420 168C444 176 460 186 470 202" strokeWidth="1.3" />
        </g>
        {BRANCH_BUDS.map((bud) => (
          <circle key={`${bud.x}-${bud.y}`} cx={bud.x} cy={bud.y} r={bud.r} fill="var(--sakura-mid)" />
        ))}
        {BRANCH_BLOSSOMS.map((b) => (
          <g
            key={`${b.x}-${b.y}`}
            transform={`translate(${b.x - 20} ${b.y - 20}) rotate(${b.r} 20 20) scale(${b.s})`}
          >
            <g fill="var(--sakura-mid)">
              {PETAL_ANGLES.map((angle) => (
                <path key={angle} d={PETAL_PATH} transform={`rotate(${angle} 20 20)`} />
              ))}
            </g>
            <circle cx="20" cy="20" r="2.2" fill="var(--gold)" />
          </g>
        ))}
      </svg>
    </div>
  );
}

// Pure ornament, no text label: a branch flourish used as a section boundary,
// never bound to or standing in for a heading.
export function SakuraDivider({ className = "" }) {
  return (
    <div className={`sakura-divider ${className}`} aria-hidden="true">
      <svg width="196" height="30" viewBox="0 0 196 30" fill="none">
        <path
          d="M6 21C36 9 58 25 76 15S128 5 152 13"
          stroke="var(--gold)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path d="M152 13C166 16 178 15 190 10" stroke="var(--gold)" strokeWidth="1" strokeLinecap="round" />
        <circle cx="44" cy="14.5" r="2.4" fill="var(--sakura-mid)" />
        <circle cx="176" cy="13" r="2" fill="var(--sakura-mid)" />
      </svg>
      <div className="sakura-divider__blossom sakura-divider__blossom--a">
        <Blossom size={20} />
      </div>
      <div className="sakura-divider__blossom sakura-divider__blossom--b">
        <Blossom size={14} color="var(--sakura)" stamens={false} />
      </div>
      <div className="sakura-divider__blossom sakura-divider__blossom--c">
        <Blossom size={11} color="var(--sakura-mid)" stamens={false} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fallen petals
//
// The falling petals' counterpart at rest — the ones that have already landed.
// Same shape, same ramp, no animation, which is the whole point: a section can
// carry the motif's density without carrying its per-frame cost. Every petal in
// the air is a composited layer the browser has to move on every frame the page
// scrolls; these are painted once and then cost nothing, so the fall itself can
// stay thin and the page still not read as bare.
//
// The table is fixed rather than drawn from Math.random. A scatter that
// reshuffles on every render reads as noise instead of as placement, and these
// have to land where the copy isn't: the run hugs the left and right edges,
// which is margin in every section that uses it. Points past 90% are meant to
// be clipped by the layer's own overflow — a petal caught half off the edge
// looks fallen, one tucked neatly inside looks placed.
// ---------------------------------------------------------------------------
const FALLEN_PETALS = [
  { top: "7%", left: "3%", size: 15, rot: -28, opacity: 0.5 },
  { top: "19%", left: "93%", size: 11, rot: 41, opacity: 0.42 },
  { top: "34%", left: "1%", size: 9, rot: 14, opacity: 0.34 },
  { top: "29%", left: "96%", size: 16, rot: -54, opacity: 0.46 },
  { top: "57%", left: "5%", size: 12, rot: 63, opacity: 0.4 },
  { top: "69%", left: "90%", size: 10, rot: -19, opacity: 0.33 },
  { top: "84%", left: "2%", size: 14, rot: 34, opacity: 0.44 },
  { top: "90%", left: "95%", size: 12, rot: -71, opacity: 0.38 },
  { top: "47%", left: "97%", size: 8, rot: 22, opacity: 0.3 },
  { top: "76%", left: "7%", size: 9, rot: -44, opacity: 0.32 },
];

export function PetalScatter({ className = "", count = 8, scale = 1 }) {
  return (
    <div className={`petal-scatter ${className}`} aria-hidden="true">
      {FALLEN_PETALS.slice(0, count).map((p) => (
        <span
          key={p.top + p.left}
          className="petal-scatter__petal"
          style={{
            top: p.top,
            left: p.left,
            width: p.size * scale,
            height: p.size * scale,
            opacity: p.opacity,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// Ambient falling petals — the site's signature motion, bounded to whichever
// surface asks for it and thinned right out away from the hero so it stays
// weather, not confetti. Disabled entirely under prefers-reduced-motion.
export function FallingPetals({ className = "", count = 30, scale = 1 }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // A lazy useState initializer, not useMemo: useMemo's cache isn't guaranteed
  // to survive future concurrent re-renders, so the randomized layout could be
  // rerolled mid-life. useState's initializer is guaranteed to run exactly once.
  const [petals] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.round(Math.random() * 100),
      delay: Math.random() * 10,
      duration: 9 + Math.random() * 9,
      size: (6 + Math.random() * 9) * scale,
      drift: Math.random() > 0.5 ? 1 : -1,
      spin: 160 + Math.random() * 200,
      opacity: 0.45 + Math.random() * 0.35,
    }))
  );

  if (!enabled) return null;

  return (
    <div className={`falling-petals ${className}`} aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="falling-petals__petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            "--drift": p.drift,
            "--spin": `${p.spin}deg`,
            "--peak-opacity": p.opacity,
          }}
        />
      ))}
    </div>
  );
}
