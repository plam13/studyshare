import html from './courses.html?raw';

/** Public list of courses. */
export function mount(container) {
  container.innerHTML = html;
}
