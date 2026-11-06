// Shared bootstrap for every page: global CSS/JS + common layout (header, footer) + auth state.
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import 'bootstrap'; // ESM build (registers data-api); same instance used by utils/toast.js
import './styles/main.css';

import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { getCurrentUser, logout } from './services/auth.js';
import { enforceAccess } from './utils/guards.js';
import { setFlash, showFlash, showToast } from './utils/toast.js';

function bindLogout(header) {
  header.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action="logout"]');
    if (!button) return;
    button.disabled = true;
    try {
      await logout();
      setFlash('Излезе успешно от профила си.', 'success');
      window.location.href = '/index.html';
    } catch (error) {
      showToast(error.message, 'error');
      button.disabled = false;
    }
  });
}

/**
 * Initializes the common page layout and resolves the current user.
 * Call once at the top of every page script.
 * @param {{ activePage: string, access?: 'any' | 'guest' | 'user' | 'admin' }} options
 * @returns {Promise<object | null>} the current user (see getCurrentUser) or null.
 *   Never resolves when the visitor is redirected away by an access rule.
 */
export async function initPage({ activePage, access = 'any' }) {
  const header = document.getElementById('app-header');
  const footer = document.getElementById('app-footer');
  if (footer) renderFooter(footer);

  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Failed to load the current user', error);
  }

  if (!enforceAccess(access, user)) {
    return new Promise(() => {}); // page is being redirected — stop page logic
  }

  if (header) {
    renderHeader(header, {
      activePage,
      user: user && { email: user.email, displayName: user.fullName },
      isAdmin: Boolean(user?.isAdmin),
    });
    bindLogout(header);
  }

  showFlash();
  return user;
}
