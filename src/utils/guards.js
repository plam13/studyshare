import { setFlash } from './toast.js';

/**
 * Returns a safe same-site path from the ?redirect= parameter (prevents open redirects).
 * @param {string} [fallback]
 */
export function getRedirectTarget(fallback = '/index.html') {
  const target = new URLSearchParams(window.location.search).get('redirect');
  if (target && target.startsWith('/') && !target.startsWith('//')) return target;
  return fallback;
}

/** Sends the visitor to the login page and remembers where they wanted to go. */
export function redirectToLogin() {
  const current = window.location.pathname + window.location.search;
  window.location.replace(`/login.html?redirect=${encodeURIComponent(current)}`);
}

/**
 * Applies page access rules. Returns false when the visitor was redirected away.
 * NOTE: this is UX only — real access control is enforced by RLS in the database.
 * @param {'any' | 'guest' | 'user' | 'admin'} access
 * @param {object | null} user
 */
export function enforceAccess(access, user) {
  if (access === 'guest' && user) {
    window.location.replace(getRedirectTarget());
    return false;
  }
  if ((access === 'user' || access === 'admin') && !user) {
    setFlash('Моля, влез в профила си, за да продължиш.', 'info');
    redirectToLogin();
    return false;
  }
  if (access === 'admin' && !user.isAdmin) {
    setFlash('Нямаш права за достъп до тази страница.', 'error');
    window.location.replace('/index.html');
    return false;
  }
  return true;
}
