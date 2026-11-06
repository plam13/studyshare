import html from './home.html?raw';
import './home.css';

/** Public landing page. Shows guest or user calls-to-action. */
export function mount(container, { user }) {
  container.innerHTML = html;
  container.querySelectorAll('[data-show]').forEach((element) => {
    const visibleFor = element.dataset.show;
    element.hidden = visibleFor === 'guest' ? Boolean(user) : !user;
  });
}
