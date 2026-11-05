// Shared bootstrap for every page: global CSS/JS + common layout (header, footer).
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/main.css';

import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';

/**
 * Initializes the common page layout. Call once at the top of every page script.
 * @param {{ activePage: string }} options
 */
export function initPage({ activePage }) {
  const header = document.getElementById('app-header');
  const footer = document.getElementById('app-footer');

  // Auth state is wired in during the auth stage; for now everyone is a guest.
  if (header) renderHeader(header, { activePage, user: null, isAdmin: false });
  if (footer) renderFooter(footer);
}
