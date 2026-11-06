import html from './material-details.html?raw';

/** Public page: one material with download, comments and rating (/materials/:id). */
export function mount(container, { params }) {
  container.innerHTML = html;
  container.querySelector('[data-material-id]').textContent = params.id;
}
