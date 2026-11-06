import html from './dashboard.html?raw';

/** Home page for logged-in users. */
export function mount(container, { user }) {
  container.innerHTML = html;
  container.querySelector('[data-user-name]').textContent = user.fullName || user.email;
}
