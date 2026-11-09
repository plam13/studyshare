import html from './material-form.html?raw';
import './material-form.css';
import { listCourses } from '../../services/courses.js';
import { createMaterial, getMaterial, updateMaterial } from '../../services/materials.js';
import { MATERIAL_ACCEPT, materialMimeType, validateMaterialFile } from '../../services/storage.js';
import { renderFileBadge } from '../../components/material-item/material-item.js';
import { renderEmpty, renderError, renderLoading, renderNotFound } from '../../components/page-state/page-state.js';
import { escapeHtml } from '../../utils/dom.js';
import { formatBytes } from '../../utils/format.js';
import { showError, showSuccess } from '../../utils/toast.js';
import { enableLiveValidation, setButtonLoading, setFieldError, validateForm } from '../../utils/validation.js';

const TITLE_MIN = 3;
const TITLE_MAX = 150;
const DESCRIPTION_MAX = 2000;

function fileSummary(name, mimeType, size) {
  return `${renderFileBadge(mimeType)}<span class="ss-min-w-0"><strong>${escapeHtml(name)}</strong> <span class="text-secondary">· ${formatBytes(size)}</span></span>`;
}

function readValues(form) {
  return {
    courseId: form.elements.courseId.value,
    title: form.elements.title.value.trim(),
    description: form.elements.description.value.trim(),
    file: form.elements.file.files[0] ?? null,
  };
}

/** Field rules shared by submit validation and live re-validation. */
function formRules({ fileRequired }) {
  return {
    courseId: (form) => (form.elements.courseId.value ? '' : 'Избери курс.'),
    title: (form) => {
      const { length } = form.elements.title.value.trim();
      return length >= TITLE_MIN && length <= TITLE_MAX ? '' : `Заглавието трябва да е между ${TITLE_MIN} и ${TITLE_MAX} символа.`;
    },
    description: (form) =>
      form.elements.description.value.trim().length <= DESCRIPTION_MAX ? '' : `Описанието е до ${DESCRIPTION_MAX} символа.`,
    file: (form) => {
      const file = form.elements.file.files[0] ?? null;
      return file || fileRequired ? validateMaterialFile(file) : '';
    },
    rights: (form) => (form.elements.rights.checked ? '' : 'Потвърди, че имаш право да споделиш материала.'),
  };
}

/** Fills static texts for add vs. edit mode. */
function setupMode(container, isEdit) {
  const set = (name, value) => {
    container.querySelector(`[data-field="${name}"]`).textContent = value;
  };
  if (!isEdit) return;
  set('form-title', 'Редакция на материал');
  set('crumb', 'Редакция');
  set('form-lead', 'Промени данните на материала. Ако избереш нов файл, той ще замени текущия.');
  container.querySelector('[data-field="title-icon"]').className = 'bi bi-pencil-square me-2';
}

/** Add (/materials/add) and edit (/materials/:id/edit) form for a material. */
export async function mount(container, { route, params, query, user, signal, navigate, setTitle }) {
  container.innerHTML = html;
  const isEdit = route.page === 'material-edit';
  setupMode(container, isEdit);
  const content = container.querySelector('#material-form-content');
  content.innerHTML = renderLoading();

  let courses;
  let material = null;
  try {
    [courses, material] = await Promise.all([
      listCourses({ signal }),
      isEdit ? getMaterial(params.id, { signal }) : Promise.resolve(null),
    ]);
  } catch (error) {
    if (signal.aborted) return;
    content.innerHTML = renderError(error.message);
    return;
  }
  if (signal.aborted) return;

  if (isEdit && !material) {
    content.innerHTML = renderNotFound({
      title: 'Материалът не е намерен',
      text: 'Възможно е да е изтрит или адресът да е грешен.',
      backHref: '/courses',
      backLabel: 'Към курсовете',
    });
    return;
  }
  // UX only — RLS rejects the update anyway.
  if (isEdit && material.authorId !== user.id && !user.isAdmin) {
    content.innerHTML = renderEmpty({
      icon: 'bi-shield-lock',
      title: 'Нямаш права да редактираш този материал.',
      text: 'Само авторът и администраторите могат да го променят.',
      actionHtml: `<a class="btn btn-primary" href="/materials/${encodeURIComponent(material.id)}">Към материала</a>`,
    });
    return;
  }
  if (!courses.length) {
    content.innerHTML = renderEmpty({
      icon: 'bi-journal-x',
      title: 'Все още няма създадени курсове.',
      text: 'Материалите се качват към курс. Администратор трябва първо да създаде курс.',
    });
    return;
  }
  if (isEdit) setTitle(`Редакция: ${material.title}`);

  content.append(container.querySelector('#material-form-template').content.cloneNode(true));
  const form = content.querySelector('#material-form');
  const f = form.elements;

  // Course options (textContent → no HTML injection)
  courses.forEach((course) => f.courseId.add(new Option(course.title, course.id)));
  f.file.accept = MATERIAL_ACCEPT;

  const presetCourse = isEdit ? material.courseId : query.get('course');
  if (presetCourse && courses.some((course) => course.id === presetCourse)) f.courseId.value = presetCourse;

  const cancel = form.querySelector('[data-field="cancel"]');
  if (isEdit) {
    f.title.value = material.title;
    f.description.value = material.description;
    cancel.href = `/materials/${encodeURIComponent(material.id)}`;
    form.querySelector('[data-field="submit-label"]').textContent = 'Запази промените';
    form.querySelector('[data-field="file-label"]').textContent = 'Нов файл (по желание)';
    const current = form.querySelector('[data-field="current-file"]');
    current.innerHTML = `<span class="small text-secondary">Текущ:</span>${fileSummary(material.fileName, material.fileType, material.fileSize)}`;
    current.hidden = false;
  } else if (presetCourse) {
    cancel.href = `/courses/${encodeURIComponent(presetCourse)}`;
  }

  // Live helpers: description counter + selected file preview/validation
  const counter = form.querySelector('#description-counter');
  const updateCounter = () => {
    counter.textContent = `${f.description.value.length} / ${DESCRIPTION_MAX}`;
  };
  updateCounter();
  f.description.addEventListener('input', updateCounter);

  const selected = form.querySelector('[data-field="selected-file"]');
  f.file.addEventListener('change', () => {
    const file = f.file.files[0];
    selected.hidden = !file;
    if (!file) return;
    const message = validateMaterialFile(file);
    setFieldError(f.file, message);
    selected.innerHTML = message ? '' : fileSummary(file.name, materialMimeType(file), file.size);
    selected.hidden = Boolean(message);
  });

  const rules = formRules({ fileRequired: !isEdit });
  enableLiveValidation(form, rules);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm(form, rules)) return;
    const values = readValues(form);

    const button = form.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    try {
      if (isEdit) {
        await updateMaterial(material, values, user.id);
        showSuccess('Промените са запазени.');
        navigate(`/materials/${material.id}`);
      } else {
        const id = await createMaterial(values, user.id);
        showSuccess('Материалът е качен успешно.');
        navigate(`/materials/${id}`);
      }
    } catch (error) {
      showError(error.message);
      setButtonLoading(button, false);
    }
  });
}
