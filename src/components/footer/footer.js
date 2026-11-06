import html from './footer.html?raw';
import './footer.css';

/** Renders the shared site footer into `container`. */
export function renderFooter(container) {
  container.innerHTML = html;
  container.querySelector('[data-year]').textContent = String(new Date().getFullYear());
}
