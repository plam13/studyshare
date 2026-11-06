import html from './admin.html?raw';

/** Admin panel (admins only — also enforced by RLS). */
export function mount(container) {
  container.innerHTML = html;
}
