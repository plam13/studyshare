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
 * Reads a query-string parameter from the current URL.
 * @param {string} name
 * @returns {string | null}
 */
export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
