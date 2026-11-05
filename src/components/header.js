import { escapeHtml } from '../utils/dom.js';

/**
 * Main navigation links.
 * `auth`: 'any' | 'user' (logged-in only) | 'admin' (admins only)
 */
const NAV_LINKS = [
  { page: 'index', href: '/index.html', label: 'Начало', icon: 'bi-house', auth: 'any' },
  { page: 'courses', href: '/courses.html', label: 'Курсове', icon: 'bi-journal-bookmark', auth: 'any' },
  { page: 'material-edit', href: '/material-edit.html', label: 'Качи материал', icon: 'bi-cloud-arrow-up', auth: 'user' },
  { page: 'admin', href: '/admin.html', label: 'Админ', icon: 'bi-shield-lock', auth: 'admin' },
];

function isLinkVisible(link, user, isAdmin) {
  if (link.auth === 'user') return Boolean(user);
  if (link.auth === 'admin') return Boolean(user) && isAdmin;
  return true;
}

function renderNavLinks(activePage, user, isAdmin) {
  return NAV_LINKS.filter((link) => isLinkVisible(link, user, isAdmin))
    .map((link) => {
      const active = link.page === activePage;
      return `
        <li class="nav-item">
          <a class="nav-link ${active ? 'active' : ''}" href="${link.href}" ${active ? 'aria-current="page"' : ''}>
            <i class="bi ${link.icon} me-1"></i>${link.label}
          </a>
        </li>`;
    })
    .join('');
}

function renderAccountArea(activePage, user) {
  if (!user) {
    return `
      <a class="btn btn-outline-light btn-sm ${activePage === 'login' ? 'active' : ''}" href="/login.html">
        <i class="bi bi-box-arrow-in-right me-1"></i>Вход
      </a>
      <a class="btn btn-warning btn-sm ${activePage === 'register' ? 'active' : ''}" href="/register.html">
        <i class="bi bi-person-plus me-1"></i>Регистрация
      </a>`;
  }

  const name = escapeHtml(user.displayName || user.email);
  return `
    <a class="btn btn-outline-light btn-sm ${activePage === 'profile' ? 'active' : ''}" href="/profile.html">
      <i class="bi bi-person-circle me-1"></i>${name}
    </a>
    <button class="btn btn-light btn-sm" type="button" data-action="logout">
      <i class="bi bi-box-arrow-right me-1"></i>Изход
    </button>`;
}

/**
 * Renders the top navigation bar into `container`.
 * @param {HTMLElement} container
 * @param {{ activePage: string, user?: {email: string, displayName?: string} | null, isAdmin?: boolean }} options
 */
export function renderHeader(container, { activePage, user = null, isAdmin = false }) {
  container.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark ss-navbar shadow-sm">
      <div class="container">
        <a class="navbar-brand ss-brand" href="/index.html">
          <i class="bi bi-mortarboard-fill me-1"></i>StudyShare
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
                aria-controls="mainNav" aria-expanded="false" aria-label="Меню">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${renderNavLinks(activePage, user, isAdmin)}
          </ul>
          <div class="d-flex flex-wrap gap-2">
            ${renderAccountArea(activePage, user)}
          </div>
        </div>
      </div>
    </nav>`;
}
