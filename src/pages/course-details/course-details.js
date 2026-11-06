import html from './course-details.html?raw';

/** Public page: materials of one course (/courses/:id). */
export function mount(container, { params }) {
  container.innerHTML = html;
  container.querySelector('[data-course-id]').textContent = params.id;
}
