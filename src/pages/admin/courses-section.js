import {
  COURSE_DESCRIPTION_MAX,
  COURSE_TITLE_MAX,
  COURSE_TITLE_MIN,
  createCourse,
  deleteCourse,
  listCourses,
  updateCourse,
} from '../../services/courses.js';
import { confirmDialog } from '../../components/confirm-dialog/confirm-dialog.js';
import { renderEmpty, renderError, renderLoading } from '../../components/page-state/page-state.js';
import { renderWindow } from '../../components/window/window.js';
import { escapeHtml } from '../../utils/dom.js';
import { formatDate, plural } from '../../utils/format.js';
import { showError, showSuccess } from '../../utils/toast.js';
import { enableLiveValidation, setButtonLoading, validateForm } from '../../utils/validation.js';

const RULES = {
  title: (form) => {
    const length = form.elements.title.value.trim().length;
    return length < COURSE_TITLE_MIN || length > COURSE_TITLE_MAX
      ? `Заглавието трябва да е между ${COURSE_TITLE_MIN} и ${COURSE_TITLE_MAX} символа.`
      : '';
  },
  description: (form) =>
    form.elements.description.value.trim().length > COURSE_DESCRIPTION_MAX
      ? `Описанието е до ${COURSE_DESCRIPTION_MAX} символа.`
      : '',
};

const FORM = `
  <form id="course-form" novalidate>
    <h2 class="h5 mb-3 ss-course-form-title" data-field="form-title">Нов курс</h2>
    <div class="mb-3">
      <label for="course-title" class="form-label">Заглавие</label>
      <input type="text" class="form-control" id="course-title" name="title" maxlength="${COURSE_TITLE_MAX}" required
             placeholder="напр. Programming Basics" />
      <div class="invalid-feedback"></div>
    </div>
    <div class="mb-3">
      <label for="course-description" class="form-label">Описание <span class="text-secondary fw-normal">(по желание)</span></label>
      <textarea class="form-control" id="course-description" name="description" rows="4" maxlength="${COURSE_DESCRIPTION_MAX}"></textarea>
      <div class="invalid-feedback"></div>
    </div>
    <div class="d-flex flex-wrap gap-2 justify-content-end">
      <button type="button" class="btn btn-light" data-action="cancel-edit" hidden>Отказ</button>
      <button type="submit" class="btn btn-primary">
        <i class="bi bi-check2-circle me-1" aria-hidden="true"></i><span data-field="submit-label">Създай курса</span>
      </button>
    </div>
  </form>`;

function renderTable(courses) {
  const rows = courses
    .map(
      (course) => `
        <tr>
          <td class="ss-admin-wrap"><a class="fw-semibold" href="/courses/${encodeURIComponent(course.id)}">${escapeHtml(course.title)}</a></td>
          <td class="text-end" data-label="Материали">${plural(course.materialsCount, 'материал', 'материала')}</td>
          <td data-label="Създаден">${formatDate(course.createdAt)}</td>
          <td class="text-end ss-admin-actions">
            <div class="d-inline-flex gap-2">
              <button type="button" class="btn btn-light btn-sm" data-action="edit-course" data-id="${escapeHtml(course.id)}"
                      aria-label="Редактирай ${escapeHtml(course.title)}"><i class="bi bi-pencil-square" aria-hidden="true"></i></button>
              <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete-course" data-id="${escapeHtml(course.id)}"
                      aria-label="Изтрий ${escapeHtml(course.title)}"><i class="bi bi-trash" aria-hidden="true"></i></button>
            </div>
          </td>
        </tr>`,
    )
    .join('');
  return `
    <div class="table-responsive">
      <table class="table table-hover ss-admin-table ss-admin-table--stack">
        <caption class="visually-hidden">Курсове</caption>
        <thead>
          <tr>
            <th scope="col">Курс</th>
            <th scope="col" class="text-end">Материали</th>
            <th scope="col">Създаден</th>
            <th scope="col" class="text-end">Действия</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

/** Courses tab: create / edit form + list with edit and delete (files are cleaned up in the service). */
export async function mountCourses(box, { user, signal, onChange }) {
  box.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-5">${renderWindow({ title: 'course.edit', tone: 'green', body: FORM, className: 'ss-course-form-win' })}</div>
      <div class="col-lg-7">${renderWindow({ title: 'courses.list', tone: 'blue', body: '<div id="courses-table"></div>' })}</div>
    </div>`;

  const form = box.querySelector('#course-form');
  const tableBox = box.querySelector('#courses-table');
  const cancelButton = form.querySelector('[data-action="cancel-edit"]');
  let courses = [];
  let editingId = null;

  enableLiveValidation(form, RULES);

  function setEditing(course) {
    editingId = course?.id ?? null;
    form.reset();
    form.querySelectorAll('.is-invalid').forEach((field) => field.classList.remove('is-invalid'));
    form.elements.title.value = course?.title ?? '';
    form.elements.description.value = course?.description ?? '';
    form.querySelector('[data-field="form-title"]').textContent = course ? 'Редакция на курс' : 'Нов курс';
    form.querySelector('[data-field="submit-label"]').textContent = course ? 'Запази промените' : 'Създай курса';
    cancelButton.hidden = !course;
  }

  async function load() {
    tableBox.innerHTML = renderLoading('Зареждане на курсовете…');
    try {
      courses = await listCourses({ signal });
      if (signal.aborted) return;
      tableBox.innerHTML = courses.length
        ? renderTable(courses)
        : renderEmpty({ illustration: true, title: 'Още няма курсове.', text: 'Създай първия курс от формата.' });
    } catch (error) {
      if (!signal.aborted) tableBox.innerHTML = renderError(error.message);
    }
  }

  cancelButton.addEventListener('click', () => setEditing(null));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm(form, RULES)) return;
    const values = { title: form.elements.title.value.trim(), description: form.elements.description.value.trim() };
    const button = form.querySelector('button[type="submit"]');

    setButtonLoading(button, true);
    try {
      if (editingId) {
        await updateCourse(editingId, values);
        showSuccess('Курсът е запазен.');
      } else {
        await createCourse(values, user.id);
        showSuccess('Курсът е създаден.');
      }
      if (signal.aborted) return;
      setEditing(null);
      await load();
      onChange();
    } catch (error) {
      showError(error.message);
    } finally {
      setButtonLoading(button, false);
    }
  });

  tableBox.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    const course = button && courses.find((c) => c.id === button.dataset.id);
    if (!course) return;

    if (button.dataset.action === 'edit-course') {
      setEditing(course);
      form.elements.title.focus();
      form.scrollIntoView({ block: 'nearest' });
      return;
    }

    const cascade = course.materialsCount
      ? ` Ще бъдат изтрити и ${plural(course.materialsCount, 'материал', 'материала')} с файловете, коментарите и оценките им.`
      : '';
    const ok = await confirmDialog({
      title: 'Изтриване на курс',
      message: `Сигурен ли си, че искаш да изтриеш „${course.title}“?${cascade} Действието е необратимо.`,
      confirmLabel: 'Изтрий курса',
    });
    if (!ok) return;

    setButtonLoading(button, true);
    try {
      await deleteCourse(course.id);
      showSuccess('Курсът е изтрит.');
      if (editingId === course.id) setEditing(null);
      if (!signal.aborted) {
        await load();
        onChange();
      }
    } catch (error) {
      showError(error.message);
      setButtonLoading(button, false);
    }
  });

  await load();
}
