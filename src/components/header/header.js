import './header.css';
import { escapeHtml } from '../../utils/dom.js';
import { renderAvatar } from '../avatar/avatar.js';

/**
 * Main navigation links.
 * `auth`: 'any' | 'guest' | 'user' | 'admin'; `exact`: active only on an exact path match.
 */
const NAV_LINKS = [
  { href: '/', label: 'Начало', icon: 'bi-house', auth: 'any', exact: true },
  { href: '/courses', label: 'Курсове', icon: 'bi-journal-bookmark', auth: 'any' },
  { href: '/dashboard', label: 'Табло', icon: 'bi-speedometer2', auth: 'user' },
  { href: '/materials/add', label: 'Качи материал', icon: 'bi-cloud-arrow-up', auth: 'user', exact: true },
  { href: '/admin', label: 'Админ', icon: 'bi-shield-lock', auth: 'admin' },
];

function isVisible(link, user) {
  if (link.auth === 'user') return Boolean(user);
  if (link.auth === 'admin') return Boolean(user?.isAdmin);
  if (link.auth === 'guest') return !user;
  return true;
}

function isActive(href, pathname, exact) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function renderAccountArea(user) {
  if (!user) {
    return `
      <a class="btn btn-light btn-sm" href="/login" data-nav-href="/login" data-nav-exact>
        <i class="bi bi-box-arrow-in-right me-1" aria-hidden="true"></i>Вход
      </a>
      <a class="btn btn-warning btn-sm" href="/register" data-nav-href="/register" data-nav-exact>
        <i class="bi bi-person-plus me-1" aria-hidden="true"></i>Регистрация
      </a>`;
  }

  const name = escapeHtml(user.fullName || user.email);
  const badge = user.isAdmin ? '<span class="ss-chip ss-tone-yellow ss-admin-chip">admin</span>' : '';
  return `
    <a class="btn btn-light btn-sm ss-account-link" href="/profile" data-nav-href="/profile">
      ${renderAvatar(user.fullName || user.email, user.avatarUrl, { size: 'xs' })}<span>${name}</span>${badge}
    </a>
    <button class="btn btn-light btn-sm" type="button" data-action="logout">
      <i class="bi bi-box-arrow-right me-1" aria-hidden="true"></i>Изход
    </button>`;
}

/**
 * Shared site header. Re-render with `render(user)` when the user changes and
 * call `setActive(pathname)` after each navigation.
 */
export function createHeader(container, { onLogout }) {
  container.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action="logout"]');
    if (!button) return;
    button.disabled = true;
    try {
      await onLogout();
    } finally {
      button.disabled = false;
    }
  });

  let pathname = window.location.pathname;

  function setActive(newPathname) {
    pathname = newPathname;
    container.querySelectorAll('[data-nav-href]').forEach((link) => {
      const active = isActive(link.dataset.navHref, pathname, link.hasAttribute('data-nav-exact'));
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    // collapse the mobile menu after navigation
    container.querySelector('.navbar-collapse.show')?.classList.remove('show');
  }

  function render(user) {
    const links = NAV_LINKS.filter((link) => isVisible(link, user))
      .map(
        (link) => `
          <li class="nav-item">
            <a class="nav-link" href="${link.href}" data-nav-href="${link.href}" ${link.exact ? 'data-nav-exact' : ''}>
              <i class="bi ${link.icon} me-1" aria-hidden="true"></i>${link.label}
            </a>
          </li>`,
      )
      .join('');

    container.innerHTML = `
      <nav class="navbar navbar-expand-lg ss-navbar" aria-label="Основна навигация">
        <div class="container">
          <a class="navbar-brand ss-brand" href="/">
            <span class="ss-logo" aria-hidden="true"><i class="bi bi-mortarboard-fill"></i></span>StudyShare
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
                  aria-controls="mainNav" aria-expanded="false" aria-label="Меню">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav me-auto gap-lg-1 my-2 my-lg-0">${links}</ul>
            <div class="d-flex flex-wrap gap-2">${renderAccountArea(user)}</div>
          </div>
        </div>
      </nav>`;
    setActive(pathname);
  }

  return { render, setActive };
}
