import html from './course-details.html?raw';
import './course-details.css';
import { getCourse } from '../../services/courses.js';
import { listCourseMaterials, sortMaterials } from '../../services/materials.js';
import { renderMaterialList } from '../../components/material-item/material-item.js';
import { renderEmpty, renderError, renderLoading, renderNotFound } from '../../components/page-state/page-state.js';
import { escapeHtml } from '../../utils/dom.js';
import { plural } from '../../utils/format.js';

function renderHeader(course) {
  const uploadHref = `/materials/add?course=${encodeURIComponent(course.id)}`;
  return `
    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div class="ss-course-heading">
        <h1 class="h3 mb-1"><i class="bi bi-folder2-open me-2" aria-hidden="true"></i>${escapeHtml(course.title)}</h1>
        <p class="text-secondary mb-0">${escapeHtml(course.description)}</p>
      </div>
      <a class="btn btn-primary" href="${uploadHref}"><i class="bi bi-cloud-arrow-up me-1" aria-hidden="true"></i>Качи материал</a>
    </div>

    <div class="ss-toolbar card border-0 shadow-sm mb-3">
      <div class="card-body row g-2 align-items-center">
        <div class="col-md-6">
          <label for="material-search" class="visually-hidden">Търси материал</label>
          <div class="input-group">
            <span class="input-group-text bg-white"><i class="bi bi-search" aria-hidden="true"></i></span>
            <input type="search" id="material-search" class="form-control" placeholder="Търси по заглавие или автор…" autocomplete="off" />
          </div>
        </div>
        <div class="col-sm-6 col-md-3">
          <label for="material-sort" class="visually-hidden">Подреди по</label>
          <select id="material-sort" class="form-select">
            <option value="newest">Най-нови</option>
            <option value="rating">Най-високо оценени</option>
            <option value="downloads">Най-изтегляни</option>
            <option value="title">По заглавие (А–Я)</option>
          </select>
        </div>
        <div class="col-sm-6 col-md-3 text-sm-end small text-secondary" id="materials-summary" aria-live="polite"></div>
      </div>
    </div>

    <div id="materials-list"></div>`;
}

/** Public page: one course and its materials, with search and sorting (/courses/:id). */
export async function mount(container, { params, signal, setTitle }) {
  container.innerHTML = html;
  const content = container.querySelector('#course-content');
  content.innerHTML = renderLoading('Зареждане на курса…');

  let course;
  let materials;
  try {
    [course, materials] = await Promise.all([getCourse(params.id, { signal }), listCourseMaterials(params.id, { signal })]);
  } catch (error) {
    if (signal.aborted) return;
    content.innerHTML = renderError(error.message);
    return;
  }
  if (signal.aborted) return;

  if (!course) {
    content.innerHTML = renderNotFound({
      title: 'Курсът не е намерен',
      text: 'Възможно е да е изтрит или адресът да е грешен.',
      backHref: '/courses',
      backLabel: 'Към всички курсове',
    });
    return;
  }

  setTitle(course.title);
  container.querySelector('[data-field="crumb"]').textContent = course.title;
  content.innerHTML = renderHeader(course);

  const list = content.querySelector('#materials-list');
  const search = content.querySelector('#material-search');
  const sort = content.querySelector('#material-sort');
  const summary = content.querySelector('#materials-summary');

  function render() {
    const term = search.value.trim().toLocaleLowerCase('bg');
    const filtered = term
      ? materials.filter((m) => `${m.title} ${m.description} ${m.authorName}`.toLocaleLowerCase('bg').includes(term))
      : materials;
    const visible = sortMaterials(filtered, sort.value);

    summary.textContent = term
      ? `${plural(visible.length, 'резултат', 'резултата')} от ${materials.length}`
      : plural(materials.length, 'материал', 'материала');

    if (!materials.length) {
      list.innerHTML = renderEmpty({
        icon: 'bi-inbox',
        title: 'Още няма материали в този курс.',
        text: 'Бъди първият, който ще качи записки!',
        actionHtml: `<a class="btn btn-primary" href="/materials/add?course=${encodeURIComponent(course.id)}"><i class="bi bi-cloud-arrow-up me-1" aria-hidden="true"></i>Качи материал</a>`,
      });
      return;
    }
    if (!visible.length) {
      list.innerHTML = renderEmpty({ icon: 'bi-search', title: 'Няма материали, които отговарят на търсенето.' });
      return;
    }
    list.innerHTML = renderMaterialList(visible);
  }

  search.addEventListener('input', render);
  sort.addEventListener('change', render);
  render();
}
