/**
 * One-time entrance animation per page ("fade-up"): a page animates the first time the visitor opens its URL
 * in this tab. Reloads, Back/Forward and later visits show it at once. Styles: src/styles/motion.css.
 * Hybrid: page blocks fade in on load; where CSS scroll-driven animations are supported, list items
 * fade in as they scroll into view (other browsers keep the load-time stagger).
 */
const STORAGE_KEY = 'ss-seen-pages';
const ANIMATION_WINDOW_MS = 2500; // after this, re-rendered content (sorting, search, comments) no longer animates

let timer = null;

function loadSeen() {
  try {
    const seen = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(seen) ? seen : [];
  } catch {
    return [];
  }
}

/** True the first time this pathname is opened in the current tab (and remembers it). */
function isFirstVisit(pathname) {
  const seen = loadSeen();
  if (seen.includes(pathname)) return false;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...seen, pathname].slice(-200)));
  } catch {
    /* storage unavailable (private mode): animate, but nothing is remembered */
  }
  return true;
}

/** Call before a page is mounted into `container`. */
export function preparePageEnter(container, pathname) {
  clearTimeout(timer);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = !reduceMotion && isFirstVisit(pathname);
  container.classList.toggle('ss-enter', animate); // time-based intro, only during the first moments
  container.classList.toggle('ss-reveal', animate); // scroll reveal of list items, for the life of the page
  if (animate) timer = setTimeout(() => container.classList.remove('ss-enter'), ANIMATION_WINDOW_MS);
}
