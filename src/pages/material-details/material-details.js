import html from './material-details.html?raw';
import './material-details.css';
import { deleteMaterial, getMaterial, incrementDownloads } from '../../services/materials.js';
import { listComments } from '../../services/comments.js';
import { getMyRating } from '../../services/ratings.js';
import { downloadMaterialFile } from '../../services/storage.js';
import { saveBlob } from '../../utils/download.js';
import { renderFileBadge } from '../../components/material-item/material-item.js';
import { renderStars } from '../../components/rating-stars/rating-stars.js';
import { renderMaterialBanner } from '../../components/material-banner/material-banner.js';
import { confirmDialog } from '../../components/confirm-dialog/confirm-dialog.js';
import { absoluteUrl, mountShareMenu, renderShareMenu } from '../../components/share-menu/share-menu.js';
import { renderError, renderLoading, renderNotFound } from '../../components/page-state/page-state.js';
import { escapeHtml } from '../../utils/dom.js';
import { fileTypeInfo, formatBytes, formatDate, formatNumber, plural } from '../../utils/format.js';
import { showError, showSuccess } from '../../utils/toast.js';
import { setButtonLoading } from '../../utils/validation.js';
import { mountComments } from './comments-section.js';
import { mountRating } from './rating-section.js';

function renderMeta(material) {
  const edited = material.updatedAt && material.updatedAt !== material.createdAt
    ? `<span><i class="bi bi-pencil me-1" aria-hidden="true"></i>редактиран ${formatDate(material.updatedAt)}</span>`
    : '';
  return `
    <span><i class="bi bi-person me-1" aria-hidden="true"></i>${escapeHtml(material.authorName)}</span>
    <span><i class="bi bi-calendar3 me-1" aria-hidden="true"></i>${formatDate(material.createdAt)}</span>
    ${edited}
    ${renderStars(material.avgRating, material.ratingsCount)}`;
}

function renderDownloadAction(user) {
  if (!user) {
    const back = encodeURIComponent(window.location.pathname);
    return `
      <a class="btn btn-primary w-100" href="/login?redirect=${back}">
        <i class="bi bi-box-arrow-in-right me-1" aria-hidden="true"></i>Влез, за да изтеглиш
      </a>
      <p class="small text-secondary mt-2 mb-0 text-center">Изтеглянето е достъпно за регистрирани потребители.</p>`;
  }
  return `
    <button type="button" class="btn btn-success w-100" data-action="download">
      <i class="bi bi-cloud-arrow-down me-1" aria-hidden="true"></i>Изтегли файла
    </button>`;
}

function renderFileCard(material, user) {
  const type = fileTypeInfo(material.fileType);
  return `
    <div class="d-flex align-items-center gap-3 mb-3">
      ${renderFileBadge(material.fileType, { large: true })}
      <div class="ss-min-w-0">
        <div class="fw-semibold text-break">${escapeHtml(material.fileName)}</div>
        <div class="small text-secondary">${type.label} · ${formatBytes(material.fileSize)}</div>
      </div>
    </div>
    <dl class="row small mb-3">
      <dt class="col-6">Курс</dt>
      <dd class="col-6"><a href="/courses/${encodeURIComponent(material.courseId)}">${escapeHtml(material.course?.title ?? '—')}</a></dd>
      <dt class="col-6">Изтегляния</dt>
      <dd class="col-6" data-field="downloads">${formatNumber(material.downloadsCount)}</dd>
      <dt class="col-6">Оценки</dt>
      <dd class="col-6">${plural(material.ratingsCount, 'глас', 'гласа')}</dd>
      <dt class="col-6">Коментари</dt>
      <dd class="col-6">${formatNumber(material.commentsCount)}</dd>
    </dl>
    ${renderDownloadAction(user)}`;
}

/** Loads the material plus everything the page needs; null when the material does not exist. */
async function loadPageData(id, user, signal) {
  const material = await getMaterial(id, { signal });
  if (!material) return null;
  const canRate = user && material.authorId !== user.id;
  const [comments, myScore] = await Promise.all([
    listComments(material.id, { signal }),
    canRate ? getMyRating(material.id, user.id, { signal }) : Promise.resolve(0),
  ]);
  return { material, comments, myScore };
}

/** Public page: material details, download, comments and rating (/materials/:id). */
export async function mount(container, { params, user, signal, setTitle, navigate }) {
  container.innerHTML = html;
  const content = container.querySelector('#material-content');
  content.innerHTML = renderLoading('Зареждане на материала…');

  let data;
  try {
    data = await loadPageData(params.id, user, signal);
  } catch (error) {
    if (signal.aborted) return;
    content.innerHTML = renderError(error.message);
    return;
  }
  if (signal.aborted) return;

  if (!data) {
    content.innerHTML = renderNotFound({
      title: 'Материалът не е намерен',
      text: 'Възможно е да е изтрит или адресът да е грешен.',
      backHref: '/courses',
      backLabel: 'Към курсовете',
    });
    return;
  }

  let { material } = data;
  setTitle(material.title);
  const courseLink = container.querySelector('[data-field="course-link"]');
  courseLink.textContent = material.course?.title ?? 'Курс';
  courseLink.href = `/courses/${encodeURIComponent(material.courseId)}`;
  container.querySelector('[data-field="crumb"]').textContent = material.title;

  content.replaceChildren(container.querySelector('#material-layout').content.cloneNode(true));
  const region = (name) => content.querySelector(`[data-region="${name}"]`);

  region('banner').innerHTML = renderMaterialBanner(material);
  content.querySelector('[data-field="title"]').textContent = material.title;
  const description = content.querySelector('[data-field="description"]');
  if (material.description) description.textContent = material.description;
  else description.innerHTML = '<span class="text-secondary">Няма описание.</span>';

  const renderSummary = () => {
    region('meta').innerHTML = renderMeta(material);
    region('file-card').innerHTML = renderFileCard(material, user);
  };
  renderSummary();

  // Sharing is public: guests can open the link; download and comments still require login
  region('share').innerHTML = renderShareMenu({
    url: absoluteUrl(`/materials/${encodeURIComponent(material.id)}`),
    title: `${material.title} – StudyShare`,
  });
  mountShareMenu(region('share'));

  // Author or admin: edit / delete (UX only — RLS enforces the same rule)
  if (user && (material.authorId === user.id || user.isAdmin)) {
    region('owner-actions').hidden = false;
    content.querySelector('[data-field="edit-link"]').href = `/materials/${encodeURIComponent(material.id)}/edit`;
  }

  // Ratings and comments change the aggregates → reload the summary (stars, counts)
  const refreshSummary = async () => {
    try {
      const fresh = await getMaterial(material.id, { signal });
      if (signal.aborted || !fresh) return;
      material = fresh;
      renderSummary();
    } catch {
      /* the summary is secondary — keep the old numbers */
    }
  };

  mountRating(region('rating'), { material, user, myScore: data.myScore, signal, onChange: refreshSummary });
  mountComments(region('comments'), { materialId: material.id, comments: data.comments, user, signal, onChange: refreshSummary });

  content.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action="download"], [data-action="delete-material"]');
    if (!button) return;

    if (button.dataset.action === 'download') {
      setButtonLoading(button, true);
      try {
        const blob = await downloadMaterialFile(material.filePath);
        saveBlob(blob, material.fileName);
        const count = await incrementDownloads(material.id);
        if (count !== null && !signal.aborted) {
          material.downloadsCount = count;
          content.querySelector('[data-field="downloads"]').textContent = formatNumber(count);
        }
      } catch (error) {
        showError(error.message);
      } finally {
        setButtonLoading(button, false);
      }
      return;
    }

    const ok = await confirmDialog({
      title: 'Изтриване на материал',
      message: `Сигурен ли си, че искаш да изтриеш „${material.title}“? Файлът, коментарите и оценките също ще бъдат изтрити.`,
      confirmLabel: 'Изтрий',
    });
    if (!ok) return;
    setButtonLoading(button, true);
    try {
      await deleteMaterial(material);
      showSuccess('Материалът е изтрит.');
      navigate(`/courses/${material.courseId}`);
    } catch (error) {
      showError(error.message);
      setButtonLoading(button, false);
    }
  });
}
