import html from './not-found.html?raw';

/** 404 page for unknown routes. */
export function mount(container) {
  container.innerHTML = html;
  container.querySelector('[data-path]').textContent = window.location.pathname;
}
