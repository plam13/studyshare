/**
 * Returns a safe internal path from the ?redirect= parameter (prevents open redirects).
 * Only same-site absolute paths like "/materials/1" are accepted; "//evil.com" or "https://…" are rejected.
 * @param {string} [fallback]
 */
export function getSafeRedirect(fallback = '/dashboard') {
  const target = new URLSearchParams(window.location.search).get('redirect');
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback;
  if (target.startsWith('/login') || target.startsWith('/register')) return fallback;
  return target;
}
