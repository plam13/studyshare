import html from './material-details.html?raw';
import './material-details.css';
import { getMaterial } from '../../services/materials.js';
import { listComments } from '../../services/comments.js';
import { getMaterialDownloadUrl } from '../../services/storage.js';
import { renderFileBadge } from '../../components/material-item/material-item.js';
import { renderStars } from '../../components/rating-stars/rating-stars.js';
import { renderAvatar } from '../../components/avatar/avatar.js';
import { renderEmpty, renderError, renderLoading, renderNotFound } from '../../components/page-state/page-state.js';
import { escapeHtml } from '../../utils/dom.js';
import { fileTypeInfo, formatBytes, formatDate, formatDateTime, formatNumber, plural } from '../../utils/format.js';
import { showError } from '../../utils/toast.js';
import { setButtonLoading } from '../../utils/validation.js';

function renderComment(comment) {
  return `
    <li class="list-group-item ss-comment py-3">
      ${renderAvatar(comment.authorName, comment.authorAvatarUrl)}
      <div class="ss-comment-body">
        <div class="d-flex flex-wrap justify-content-between gap-2">
          <strong>${escapeHtml(comment.authorName)}</strong>
          <time class="small text-secondary" datetime="${escapeHtml(comment.createdAt)}">${formatDateTime(comment.createdAt)}</time>
        </div>
        <p class="ss-comment-content mb-0 mt-1">${escapeHtml(comment.content)}</p>
      </div>
    </li>`;
}

function renderComments(comments) {
  if (!comments.length) {
    return renderEmpty({ icon: 'bi-chat-square-text', title: 'Още няма коментари.', text: 'Сподели мнението си за материала.' });
  }
  return `<ul class="list-group shadow-sm">${comments.map(renderComment).join('')}</ul>`;
}

function renderDownloadAction(material, user) {
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

function renderMaterial(material, comments, user) {
  const type = fileTypeInfo(material.fileType);
  const edited = material.updatedAt && material.updatedAt !== material.createdAt
    ? `<span><i class="bi bi-pencil me-1" aria-hidden="true"></i>редактиран ${formatDate(material.updatedAt)}</span>`
    : '';

  return `
    <div class="row g-4">
      <div class="col-lg-8">
        <h1 class="h3 ss-material-title mb-2">${escapeHtml(material.title)}</h1>
        <div class="d-flex flex-wrap gap-3 small text-secondary mb-3">
          <span><i class="bi bi-person me-1" aria-hidden="true"></i>${escapeHtml(material.authorName)}</span>
          <span><i class="bi bi-calendar3 me-1" aria-hidden="true"></i>${formatDate(material.createdAt)}</span>
          ${edited}
          ${renderStars(material.avgRating, material.ratingsCount)}
        </div>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <h2 class="h6 text-uppercase text-secondary mb-2">Описание</h2>
            <p class="ss-material-description mb-0">${escapeHtml(material.description) || '<span class="text-secondary">Няма описание.</span>'}</p>
          </div>
        </div>

        <h2 class="h5 mb-3"><i class="bi bi-chat-dots me-2" aria-hidden="true"></i>Коментари <span class="badge text-bg-light border">${comments.length}</span></h2>
        ${renderComments(comments)}
      </div>

      <aside class="col-lg-4">
        <div class="card border-0 shadow-sm ss-file-card">
          <div class="card-body">
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
              <dd class="col-6">${formatNumber(material.downloadsCount)}</dd>
              <dt class="col-6">Оценки</dt>
              <dd class="col-6">${plural(material.ratingsCount, 'глас', 'гласа')}</dd>
              <dt class="col-6">Коментари</dt>
              <dd class="col-6">${formatNumber(material.commentsCount)}</dd>
            </dl>
            ${renderDownloadAction(material, user)}
          </div>
        </div>
      </aside>
    </div>`;
}

/** Public page: material details, download, comments and rating (/materials/:id). */
export async function mount(container, { params, user, signal, setTitle }) {
  container.innerHTML = html;
  const content = container.querySelector('#material-content');
  content.innerHTML = renderLoading('Зареждане на материала…');

  let material;
  let comments;
  try {
    material = await getMaterial(params.id, { signal });
    comments = material ? await listComments(material.id, { signal }) : [];
  } catch (error) {
    if (signal.aborted) return;
    content.innerHTML = renderError(error.message);
    return;
  }
  if (signal.aborted) return;

  if (!material) {
    content.innerHTML = renderNotFound({
      title: 'Материалът не е намерен',
      text: 'Възможно е да е изтрит или адресът да е грешен.',
      backHref: '/courses',
      backLabel: 'Към курсовете',
    });
    return;
  }

  setTitle(material.title);
  const courseLink = container.querySelector('[data-field="course-link"]');
  courseLink.textContent = material.course?.title ?? 'Курс';
  courseLink.href = `/courses/${encodeURIComponent(material.courseId)}`;
  container.querySelector('[data-field="crumb"]').textContent = material.title;

  content.innerHTML = renderMaterial(material, comments, user);

  content.querySelector('[data-action="download"]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    setButtonLoading(button, true);
    try {
      const url = await getMaterialDownloadUrl(material.filePath, material.fileName);
      window.location.assign(url); // attachment → the browser saves the file, the page stays
    } catch (error) {
      showError(error.message);
    } finally {
      setButtonLoading(button, false);
    }
  });
}
