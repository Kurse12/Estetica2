import { lockSmoothScroll, unlockSmoothScroll } from "./smoothScroll";

// The curtain itself lives in index.html, inline, because it has to paint on
// the browser's first frame - long before this bundle has downloaded. All the
// app owes it is two signals: that it has mounted and painted, and, once the
// curtain starts to lift, that Lenis may scroll the page again.
//
// The scroll lock has to be told to Lenis directly. The curtain's own
// `overflow: hidden` stops the wheel reaching the document, but Lenis reads
// wheel events itself and then scrolls programmatically, which sails past it.
export function attachPreloader() {
  lockSmoothScroll();

  const shell = window.SakuraPreloader;
  if (!shell) {
    // No curtain: the inline script was stripped, or it has already finished
    // and cleaned itself up. Either way nothing is covering the page, so
    // nothing may go on holding its scroll.
    unlockSmoothScroll();
    return;
  }

  shell.ready();
  shell.lifted.then(unlockSmoothScroll);
}
