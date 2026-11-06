import html from './courses.html?raw';
import { listCourses } from '../../services/courses.js';
import { renderCourseCard } from '../../components/course-card/course-card.js';
import { renderEmpty, renderError, renderLoading } from '../../components/page-state/page-state.js';
import { plural } from '../../utils/format.js';

/** Public list of courses with instant search. */
export async function mount(container, { signal }) {
  container.innerHTML = html;
  const list = container.querySelector('#courses-list');
  const summary = container.querySelector('#courses-summary');
  const search = container.querySelector('#course-search');

  list.innerHTML = renderLoading('Зареждане на курсовете…');

  let courses = [];
  try {
    courses = await listCourses({ signal });
  } catch (error) {
    if (signal.aborted) return;
    list.innerHTML = renderError(error.message);
    return;
  }
  if (signal.aborted) return;

  function render() {
    const term = search.value.trim().toLocaleLowerCase('bg');
    const visible = term
      ? courses.filter((c) => `${c.title} ${c.description}`.toLocaleLowerCase('bg').includes(term))
      : courses;

    summary.textContent = term
      ? `Намерени: ${plural(visible.length, 'курс', 'курса')}`
      : plural(courses.length, 'курс', 'курса');

    if (!courses.length) {
      list.innerHTML = renderEmpty({ icon: 'bi-journal-x', title: 'Все още няма курсове.', text: 'Администраторите ще добавят курсове скоро.' });
      return;
    }
    if (!visible.length) {
      list.innerHTML = renderEmpty({ icon: 'bi-search', title: 'Няма курсове, които отговарят на търсенето.' });
      return;
    }
    list.innerHTML = `<div class="row g-4">${visible.map(renderCourseCard).join('')}</div>`;
  }

  search.addEventListener('input', render);
  render();
}
