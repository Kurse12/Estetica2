import Lenis from "lenis";
import "lenis/dist/lenis.css";

// One instance for the page, held here rather than in React state: the booking
// flow scrolls from an event handler that has no business re-rendering, and
// Lenis is a single external system, not a piece of view data.
let lenis = null;

// The loader draws a curtain over the page, and a curtain the page can be
// scrolled behind is not a curtain. CSS `overflow: hidden` stops the wheel
// reaching the document, but Lenis reads wheel events itself and then scrolls
// programmatically, which sails straight past it — so the lock has to be told
// to Lenis directly. It is kept as a flag as well as a call, because effects
// run child-first: the loader locks before this module has an instance to stop.
let locked = false;

export function lockSmoothScroll() {
  locked = true;
  lenis?.stop();
}

export function unlockSmoothScroll() {
  locked = false;
  lenis?.start();
}

// Anything that animates off the scroll position subscribes here instead of
// listening to the window. A native `scroll` listener that schedules its work
// in requestAnimationFrame lands a whole frame late: Lenis moves the page from
// inside its own rAF, the scroll event fires after that, and the callback then
// waits for the NEXT frame — so the effect trails the page by ~16ms and jerks
// to catch up whenever a frame is dropped. Lenis's own event runs synchronously
// in the frame that moved the page, which is the only place this work belongs.
const scrollSubscribers = new Set();
let nativeScrollAttached = false;

function emitScroll() {
  for (const fn of scrollSubscribers) fn();
}

function attachNativeScroll() {
  if (nativeScrollAttached) return;
  window.addEventListener("scroll", emitScroll, { passive: true });
  nativeScrollAttached = true;
}

function detachNativeScroll() {
  if (!nativeScrollAttached) return;
  window.removeEventListener("scroll", emitScroll);
  nativeScrollAttached = false;
}

// Returns its own unsubscribe, so it drops straight into an effect. Subscribing
// before Lenis exists is normal — child effects run before the parent's, so the
// hero is listening a beat before App starts the instance — and the native
// listener covers that gap (and a page where Lenis never starts at all).
export function onSmoothScroll(fn) {
  scrollSubscribers.add(fn);
  if (!lenis) attachNativeScroll();
  return () => {
    scrollSubscribers.delete(fn);
  };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function startSmoothScroll() {
  // Strict mode mounts effects twice in development; the second call must not
  // leave a second instance running against the same window.
  if (lenis) return () => {};

  // Lenis's whole job is adding inertia the platform didn't ask for. A visitor
  // who has told the OS to cut motion gets the browser's own (unenhanced)
  // wheel, touch, and keyboard scrolling instead — native, not a slowed-down
  // version of the eased one.
  if (prefersReducedMotion()) {
    attachNativeScroll();
    return () => {};
  }

  lenis = new Lenis({
    // How much of the remaining distance is covered each frame. The default
    // 0.1 already reads as smooth; a touch lower suits a page whose motion —
    // the drifting petals, the dome unwinding — is slow everywhere else.
    lerp: 0.085,
    // Lenis intercepts same-page <a href="#..."> clicks itself, so the nav
    // links glide instead of jumping. Its own easing runs the trip, and it
    // subtracts the target's computed scroll-margin-top on the way — which is
    // how every section now lands clear of the fixed bar instead of arriving
    // with its heading hidden underneath it. See the rule in global.css.
    anchors: true,
    // Lenis runs its own requestAnimationFrame loop.
    autoRaf: true,
    // Touch scrolling stays native: syncing it costs the platform's own
    // momentum and rubber-banding, which no lerp reproduces convincingly.
    syncTouch: false,
  });

  if (locked) lenis.stop();

  // Lenis emits `scroll` for native scrolls too (touch, keyboard, scrollbar
  // drag), not just the ones it eases itself, so this one source covers every
  // way the page can move and the window listener is pure duplicate work.
  detachNativeScroll();
  lenis.on("scroll", emitScroll);

  return () => {
    lenis.off("scroll", emitScroll);
    lenis.destroy();
    lenis = null;
    if (scrollSubscribers.size) attachNativeScroll();
  };
}

// Programmatic scrolls (the booking flow) go through Lenis so they share the
// wheel's easing; without it they'd jump, since Lenis turns the document's
// native smooth scrolling off while it is running.
//
// No offset is passed here either. Lenis subtracts the target's own computed
// scroll-margin-top, and the native fallback below honours it as well, so the
// nav's height stays in the one place that knows it — the CSS that draws the
// bar — and this module never learns that a breakpoint exists.
export function scrollToTarget(target, options = {}) {
  const el = typeof target === "string" ? document.getElementById(target) : target;
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: 0, ...options });
    return;
  }
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}
