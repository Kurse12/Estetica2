// Authored single-stroke icon set (1.75 stroke, currentColor) — no emoji, no icon font.
const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const paths = {
  scissors: (
    <>
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="6" cy="18" r="2.4" />
      <line x1="20" y1="4" x2="7.8" y2="16.2" />
      <line x1="7.8" y1="7.8" x2="20" y2="20" />
    </>
  ),
  drop: <path d="M12 3c3.5 4.4 6 8 6 11a6 6 0 1 1-12 0c0-3 2.5-6.6 6-11Z" />,
  hand: (
    <path d="M7 12V5.5a1.5 1.5 0 0 1 3 0V11m0-6.5a1.5 1.5 0 0 1 3 0V11m0-4a1.5 1.5 0 0 1 3 0v5.5m3-1.2v3.7A6 6 0 0 1 10 20l-3.2-4.2c-1-1.3-.7-2.4.3-3s2.3-.2 3 .8" />
  ),
  foot: (
    <path d="M9 3c2 0 2.5 2 2.5 4.5S10 12 10 15a4 4 0 1 1-8 0c0-2 1-2.7 1-5 0-3.5 3-7 6-7Zm7 2c-1.6 0-2.6 1.3-2.9 3.2M14.5 9c-1.4 0-2.3 1.1-2.6 2.6M17 12c-1.2 0-2 1-2.2 2.2" />
  ),
  face: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 10.5h.01M15 10.5h.01" strokeWidth="2.4" />
      <path d="M8.7 15c1 1 2 1.5 3.3 1.5s2.3-.5 3.3-1.5" />
    </>
  ),
  brush: (
    <path d="M14 4c2 0 3.5 1.5 3.5 3.5 0 1.6-.9 2.5-2 3.5l-5.8 5.8a2 2 0 0 1-1.4.6H5.5a1 1 0 0 1-1-1.2l1-3.7a2 2 0 0 1 .5-1L11.5 6c1-1 1.5-2 2.5-2Z" />
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  chevronLeft: <path d="M14.5 5 8 12l6.5 7" />,
  chevronRight: <path d="M9.5 5 16 12l-6.5 7" />,
  check: <path d="M5 12.5 10 17.5 19 7" />,
  pin: (
    <>
      <path d="M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  phone: (
    <path d="M7.6 3.5h-2A2.1 2.1 0 0 0 3.5 5.8C3.9 13.3 10.7 20.1 18.2 20.5a2.1 2.1 0 0 0 2.3-2.1v-2a1.4 1.4 0 0 0-1.1-1.4l-2.7-.6a1.4 1.4 0 0 0-1.4.5l-1 1.2a12.5 12.5 0 0 1-5-5l1.2-1a1.4 1.4 0 0 0 .5-1.4L9.4 4.6a1.4 1.4 0 0 0-1.4-1.1Z" />
  ),
  leaf: <path d="M5 19c8-1 12-6.5 12-14-8 0-13.5 4-14 12-.1 1 .3 1.7 2 2Z" />,
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v5h-5" />
    </>
  ),
  // A ring rather than a warning triangle: the form is asking for a missing
  // detail, not raising an alarm, and the salon's voice never shouts.
  alert: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.6v5" />
      <path d="M12 16.1h.01" />
    </>
  ),
  list: (
    <>
      <line x1="4" y1="6.5" x2="4.01" y2="6.5" strokeWidth="2.4" />
      <line x1="4" y1="12" x2="4.01" y2="12" strokeWidth="2.4" />
      <line x1="4" y1="17.5" x2="4.01" y2="17.5" strokeWidth="2.4" />
      <line x1="8.5" y1="6.5" x2="20.5" y2="6.5" />
      <line x1="8.5" y1="12" x2="20.5" y2="12" />
      <line x1="8.5" y1="17.5" x2="20.5" y2="17.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19c.7-3.2 3-4.8 5.5-4.8s4.8 1.6 5.5 4.8" />
      <path d="M15.5 6.2c1.5.3 2.6 1.6 2.6 3.1s-1.1 2.8-2.6 3.1" />
      <path d="M17 14.3c2 .5 3.4 1.9 4 4.2" />
    </>
  ),
  plus: <path d="M12 4.5v15M4.5 12h15" strokeWidth="2" />,
  edit: (
    <path d="M15.7 4.3a2 2 0 0 1 2.8 2.8L8 17.6l-4 1 1-4L15.7 4.3Z" />
  ),
  trash: (
    <>
      <path d="M5 7.5h14" />
      <path d="M9.5 7.5V5.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
      <path d="M7 7.5 7.8 19a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4l.8-11.5" />
      <line x1="10.3" y1="11" x2="10.6" y2="16.5" />
      <line x1="13.7" y1="11" x2="13.4" y2="16.5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" strokeWidth="2" />,
  chat: (
    <path d="M4 12.3C4 7.7 7.8 4 12.5 4S21 7.7 21 12.3s-3.8 8.3-8.5 8.3c-1.1 0-2.2-.2-3.1-.6L4.5 21.5l1.2-4.4A8.1 8.1 0 0 1 4 12.3Z" />
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.3" y1="15.3" x2="20.5" y2="20.5" />
    </>
  ),
  tag: (
    <>
      <path d="M12.5 3.5h5a2 2 0 0 1 2 2v5L10 20 4 14 12.5 3.5Z" />
      <circle cx="15.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
};

export default function Icon({ name, size = 22, className, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
      aria-hidden="true"
      {...common}
    >
      {paths[name] ?? null}
    </svg>
  );
}
