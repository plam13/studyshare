import { listRecentComments } from '../../services/admin.js';
import { deleteComment } from '../../services/comments.js';
import { deleteMaterial, listLatestMaterials } from '../../services/materials.js';
import { renderFileBadge } from '../../components/material-item/material-item.js';
import { confirmDialog } from '../../components/confirm-dialog/confirm-dialog.js';
import { renderEmpty, renderError, renderLoading } from '../../components/page-state/page-state.js';
import { renderWindow } from '../../components/window/window.js';
import { escapeHtml } from '../../utils/dom.js';
import { formatDateTime } from '../../utils/format.js';
import { showError, showSuccess } from '../../utils/toast.js';
import { setButtonLoading } from '../../utils/validation.js';

const LIMIT = 20;

function deleteButton(kind, id, label) {
  return `
    <button type="button" class="btn btn-outline-danger btn-sm flex-shrink-0" data-action="delete-${kind}" data-id="${escapeHtml(id)}"
            aria-label="Изтрий ${escapeHtml(label)}"><i class="bi bi-trash" aria-hidden="true"></i></button>`;
}

function renderMaterials(materials) {
  if (!materials.length) return renderEmpty({ icon: 'bi-files', title: 'Няма материали.' });
  return `<ul class="ss-mod-list">${materials
    .map(
      (m) => `
        <li class="ss-mod-item">
          ${renderFileBadge(m.fileType)}
          <div class="ss-mod-item-body">
            <a class="fw-semibold" href="/materials/${encodeURIComponent(m.id)}">${escapeHtml(m.title)}</a>
            <div class="small text-secondary">
              ${escapeHtml(m.course?.title ?? '—')} · ${escapeHtml(m.authorName)} · ${formatDateTime(m.createdAt)}
            </div>
          </div>
          ${deleteButton('material', m.id, `материала ${m.title}`)}
        </li>`,
    )
    .join('')}</ul>`;
}

function renderComments(comments) {
  if (!comments.length) return renderEmpty({ icon: 'bi-chat-square-text', title: 'Няма коментари.' });
  return `<ul class="ss-mod-list">${comments
    .map(
      (c) => `
        <li class="ss-mod-item">
          <div class="ss-mod-item-body">
            <div class="small text-secondary">
              <strong class="text-body">${escapeHtml(c.authorName)}</strong> · ${formatDateTime(c.createdAt)}
              ${c.material ? `· към <a href="/materials/${encodeURIComponent(c.material.id)}">${escapeHtml(c.material.title)}</a>` : ''}
            </div>
            <p class="ss-mod-quote">${escapeHtml(c.content)}</p>
          </div>
          ${deleteButton('comment', c.id, `коментара на ${c.authorName}`)}
        </li>`,
    )
    .join('')}</ul>`;
}

/** Moderation tab: newest materials and comments site-wide, each deletable by the admin (RLS). */
export async function mountModeration(box, { signal, onChange }) {
  box.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-6">${renderWindow({ title: `materials.latest(${LIMIT})`, tone: 'coral', body: '<div id="mod-materials"></div>' })}</div>
      <div class="col-lg-6">${renderWindow({ title: `comments.latest(${LIMIT})`, tone: 'lilac', body: '<div id="mod-comments"></div>' })}</div>
    </div>`;
  const materialsBox = box.querySelector('#mod-materials');
  const commentsBox = box.querySelector('#mod-comments');
  let materials = [];
  let comments = [];

  async function loadMaterials() {
    materialsBox.innerHTML = renderLoading();
    try {
      materials = await listLatestMaterials(LIMIT, { signal });
      if (!signal.aborted) materialsBox.innerHTML = renderMaterials(materials);
    } catch (error) {
      if (!signal.aborted) materialsBox.innerHTML = renderError(error.message);
    }
  }

  async function loadComments() {
    commentsBox.innerHTML = renderLoading();
    try {
      comments = await listRecentComments(LIMIT, { signal });
      if (!signal.aborted) commentsBox.innerHTML = renderComments(comments);
    } catch (error) {
      if (!signal.aborted) commentsBox.innerHTML = renderError(error.message);
    }
  }

  box.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action="delete-material"], [data-action="delete-comment"]');
    if (!button) return;
    const isMaterial = button.dataset.action === 'delete-material';
    const item = (isMaterial ? materials : comments).find((entry) => entry.id === button.dataset.id);
    if (!item) return;

    const ok = await confirmDialog(
      isMaterial
        ? {
            title: 'Изтриване на материал',
            message: `Да изтрия ли „${item.title}“ на ${item.authorName}? Файлът, коментарите и оценките също ще бъдат изтрити.`,
            confirmLabel: 'Изтрий',
          }
        : {
            title: 'Изтриване на коментар',
            message: `Да изтрия ли коментара на ${item.authorName}?`,
            confirmLabel: 'Изтрий',
          },
    );
    if (!ok) return;

    setButtonLoading(button, true);
    try {
      if (isMaterial) {
        await deleteMaterial(item);
        showSuccess('Материалът е изтрит.');
      } else {
        await deleteComment(item.id);
        showSuccess('Коментарът е изтрит.');
      }
      if (signal.aborted) return;
      // Deleting a material also removes its comments → reload both lists.
      await Promise.all([isMaterial ? loadMaterials() : Promise.resolve(), loadComments()]);
      onChange();
    } catch (error) {
      showError(error.message);
      setButtonLoading(button, false);
    }
  });

  await Promise.all([loadMaterials(), loadComments()]);
}
