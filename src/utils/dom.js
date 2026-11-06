/**
 * Escapes a value for safe insertion into HTML (prevents XSS when using innerHTML).
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Carries the current ?redirect= parameter over to links marked with [data-keep-redirect]
 * (e.g. the "Register" link on the login page).
 * @param {ParentNode} root
 */
export function keepRedirectParam(root) {
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  if (!redirect) return;
  root.querySelectorAll('a[data-keep-redirect]').forEach((link) => {
    const url = new URL(link.getAttribute('href'), window.location.origin);
    url.searchParams.set('redirect', redirect);
    link.setAttribute('href', url.pathname + url.search);
  });
}
