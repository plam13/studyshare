/**
 * Client-side router based on the History API.
 *
 * Every route maps a clean URL (e.g. /materials/:id/edit) to a page module in src/pages/<page>/.
 * A page module exports `mount(container, ctx)` and may return a cleanup function,
 * which is called when the visitor navigates away (unmount).
 */
import { getUser } from './services/auth.js';
import { showInfo, showError } from './utils/toast.js';
import { getSafeRedirect } from './utils/guards.js';

const APP_NAME = 'StudyShare';

/**
 * Canonical routes. `access`: 'any' | 'guest' | 'user' | 'admin'.
 * `load` lazily imports the page module (Vite code-splits each page).
 */
export const routes = [
  { path: '/', page: 'home', title: 'Начало', access: 'any', load: () => import('./pages/home/home.js') },
  { path: '/login', page: 'login', title: 'Вход', access: 'guest', load: () => import('./pages/login/login.js') },
  { path: '/register', page: 'register', title: 'Регистрация', access: 'guest', load: () => import('./pages/register/register.js') },
  { path: '/dashboard', page: 'dashboard', title: 'Табло', access: 'user', load: () => import('./pages/dashboard/dashboard.js') },
  { path: '/courses', page: 'courses', title: 'Курсове', access: 'any', load: () => import('./pages/courses/courses.js') },
  { path: '/search', page: 'search', title: 'Търсене', access: 'any', load: () => import('./pages/search/search.js') },
  { path: '/courses/:id', page: 'course-details', title: 'Курс', access: 'any', load: () => import('./pages/course-details/course-details.js') },
  { path: '/materials/add', page: 'material-add', title: 'Качване на материал', access: 'user', load: () => import('./pages/material-form/material-form.js') },
  { path: '/materials/:id', page: 'material-details', title: 'Материал', access: 'any', load: () => import('./pages/material-details/material-details.js') },
  { path: '/materials/:id/edit', page: 'material-edit', title: 'Редакция на материал', access: 'user', load: () => import('./pages/material-form/material-form.js') },
  { path: '/profile', page: 'profile', title: 'Моят профил', access: 'user', load: () => import('./pages/profile/profile.js') },
  { path: '/admin', page: 'admin', title: 'Админ панел', access: 'admin', load: () => import('./pages/admin/admin.js') },
];

const notFoundRoute = {
  path: '*',
  page: 'not-found',
  title: 'Страницата не е намерена',
  access: 'any',
  load: () => import('./pages/not-found/not-found.js'),
};

let container = null;
let onRouteChange = () => {};
let currentCleanup = null;
let currentController = null;
let renderToken = 0;
let currentMatch = null;

/** Converts '/materials/:id/edit' into a RegExp with named groups. */
function compile(path) {
  const pattern = path
    .split('/')
    .map((segment) => (segment.startsWith(':') ? `(?<${segment.slice(1)}>[^/]+)` : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp(`^${pattern}/?$`);
}

const compiledRoutes = routes.map((route) => ({ ...route, regex: compile(route.path) }));

/** Finds the route for a pathname. Returns { route, params }. */
export function matchRoute(pathname) {
  for (const route of compiledRoutes) {
    const match = route.regex.exec(pathname);
    if (match) {
      const params = Object.fromEntries(
        Object.entries(match.groups ?? {}).map(([key, value]) => [key, decodeURIComponent(value)]),
      );
      return { route, params };
    }
  }
  return { route: notFoundRoute, params: {} };
}

/** Returns the currently rendered route match (or null before the first render). */
export function getCurrentMatch() {
  return currentMatch;
}

/**
 * Navigates to an internal URL without a full page reload.
 * @param {string} url e.g. '/materials/123'
 * @param {{ replace?: boolean }} [options]
 */
export function navigate(url, { replace = false } = {}) {
  const target = new URL(url, window.location.origin);
  const next = target.pathname + target.search + target.hash;
  const current = window.location.pathname + window.location.search + window.location.hash;
  if (replace) history.replaceState(null, '', next);
  else if (next !== current) history.pushState(null, '', next);
  return render();
}

/** Re-renders the current URL (e.g. after the logged-in user changes). */
export function refresh() {
  return render();
}

/** Applies the route's access rule. Returns a redirect URL, or null when access is allowed. */
function checkAccess(route, user) {
  if (route.access === 'guest' && user) return getSafeRedirect('/dashboard');
  if ((route.access === 'user' || route.access === 'admin') && !user) {
    showInfo('Моля, влез в профила си, за да продължиш.');
    const back = window.location.pathname + window.location.search;
    return `/login?redirect=${encodeURIComponent(back)}`;
  }
  if (route.access === 'admin' && !user.isAdmin) {
    showError('Нямаш права за достъп до тази страница.');
    return '/';
  }
  return null;
}

function unmountCurrent() {
  currentController?.abort();
  currentController = null;
  if (typeof currentCleanup === 'function') {
    try {
      currentCleanup();
    } catch (error) {
      console.error('Page cleanup failed', error);
    }
  }
  currentCleanup = null;
}

function focusMain() {
  const heading = container.querySelector('h1');
  const target = heading ?? container;
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

async function render() {
  const token = ++renderToken;
  const { route, params } = matchRoute(window.location.pathname);

  // NOTE: UX only — real authorization is enforced by Supabase RLS.
  const redirect = checkAccess(route, getUser());
  if (redirect) {
    history.replaceState(null, '', redirect);
    return render();
  }

  unmountCurrent();
  currentMatch = { route, params };
  document.title = `${route.title} · ${APP_NAME}`;
  onRouteChange(currentMatch);
  container.setAttribute('aria-busy', 'true');

  try {
    const module = await route.load();
    if (token !== renderToken) return; // a newer navigation started meanwhile

    currentController = new AbortController();
    const ctx = {
      params,
      query: new URLSearchParams(window.location.search),
      user: getUser(),
      route,
      signal: currentController.signal,
      navigate,
      setTitle: (title) => {
        document.title = `${title} · ${APP_NAME}`;
      },
    };

    container.innerHTML = '';
    currentCleanup = await module.mount(container, ctx);
    if (token !== renderToken) return;
    focusMain();
  } catch (error) {
    if (token !== renderToken) return;
    console.error('Failed to render page', error);
    container.innerHTML = `
      <div class="ss-empty">
        <i class="bi bi-exclamation-octagon text-danger"></i>
        Възникна грешка при зареждането на страницата.
      </div>`;
  } finally {
    if (token === renderToken) container.removeAttribute('aria-busy');
  }
}

/** Intercepts clicks on internal links; keeps modified clicks, downloads and external links native. */
function handleLinkClick(event) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest('a[href]');
  if (!link) return;
  if (link.target && link.target !== '_self') return;
  if (link.hasAttribute('download') || link.dataset.external !== undefined) return;

  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return; // in-page anchor

  event.preventDefault();
  navigate(url.pathname + url.search + url.hash);
}

/**
 * Starts the router.
 * @param {{ outlet: HTMLElement, onChange?: (match: {route: object, params: object}) => void }} options
 */
export function startRouter({ outlet, onChange }) {
  container = outlet;
  if (onChange) onRouteChange = onChange;
  document.addEventListener('click', handleLinkClick);
  window.addEventListener('popstate', () => render());
  return render();
}
