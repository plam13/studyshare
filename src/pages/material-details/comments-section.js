import { COMMENT_MAX_LENGTH, addComment, deleteComment, listComments, updateComment } from '../../services/comments.js';
import { renderAvatar } from '../../components/avatar/avatar.js';
import { confirmDialog } from '../../components/confirm-dialog/confirm-dialog.js';
import { renderEmpty } from '../../components/page-state/page-state.js';
import { escapeHtml } from '../../utils/dom.js';
import { formatDateTime } from '../../utils/format.js';
import { showError, showSuccess } from '../../utils/toast.js';
import { setButtonLoading, setFieldError } from '../../utils/validation.js';

function validateContent(textarea) {
  const content = textarea.value.trim();
  const message = !content
    ? 'Коментарът не може да е празен.'
    : content.length > COMMENT_MAX_LENGTH
      ? `Коментарът е до ${COMMENT_MAX_LENGTH} символа.`
      : '';
  return setFieldError(textarea, message) ? content : null;
}

function renderEditForm(comment) {
  return `
    <form class="mt-2" data-form="edit-comment" data-id="${escapeHtml(comment.id)}" novalidate>
      <label class="visually-hidden" for="edit-${escapeHtml(comment.id)}">Редакция на коментар</label>
      <textarea class="form-control" id="edit-${escapeHtml(comment.id)}" name="content" rows="3" maxlength="${COMMENT_MAX_LENGTH}">${escapeHtml(comment.content)}</textarea>
      <div class="invalid-feedback"></div>
      <div class="d-flex gap-2 justify-content-end mt-2">
        <button type="button" class="btn btn-sm btn-outline-secondary" data-action="cancel-edit">Отказ</button>
        <button type="submit" class="btn btn-sm btn-primary"><i class="bi bi-check2 me-1" aria-hidden="true"></i>Запази</button>
      </div>
    </form>`;
}

function renderComment(comment, user, editingId) {
  const isOwn = Boolean(user) && comment.authorId === user.id;
  const canDelete = isOwn || Boolean(user?.isAdmin);
  const edited = comment.updatedAt && comment.updatedAt !== comment.createdAt ? ' · редактиран' : '';
  const actions = [
    isOwn ? `<button type="button" class="btn btn-link btn-sm p-0" data-action="edit-comment" data-id="${escapeHtml(comment.id)}"><i class="bi bi-pencil me-1" aria-hidden="true"></i>Редактирай</button>` : '',
    canDelete ? `<button type="button" class="btn btn-link btn-sm p-0 link-danger" data-action="delete-comment" data-id="${escapeHtml(comment.id)}"><i class="bi bi-trash me-1" aria-hidden="true"></i>Изтрий</button>` : '',
  ].filter(Boolean);

  const body = comment.id === editingId
    ? renderEditForm(comment)
    : `<p class="ss-comment-content mb-0 mt-1">${escapeHtml(comment.content)}</p>
       ${actions.length ? `<div class="d-flex gap-3 mt-1">${actions.join('')}</div>` : ''}`;

  return `
    <li class="list-group-item ss-comment py-3">
      ${renderAvatar(comment.authorName, comment.authorAvatarUrl)}
      <div class="ss-comment-body">
        <div class="d-flex flex-wrap justify-content-between gap-2">
          <strong>${escapeHtml(comment.authorName)}</strong>
          <time class="small text-secondary" datetime="${escapeHtml(comment.createdAt)}">${formatDateTime(comment.createdAt)}${edited}</time>
        </div>
        ${body}
      </div>
    </li>`;
}

function renderAddForm(user) {
  if (!user) {
    const back = encodeURIComponent(window.location.pathname);
    return `<p class="text-secondary mb-3"><a href="/login?redirect=${back}">Влез</a>, за да напишеш коментар.</p>`;
  }
  return `
    <form class="card border-0 shadow-sm mb-3" data-form="add-comment" novalidate>
      <div class="card-body">
        <label for="new-comment" class="form-label fw-semibold">Напиши коментар</label>
        <textarea class="form-control" id="new-comment" name="content" rows="3" maxlength="${COMMENT_MAX_LENGTH}"
                  placeholder="Сподели мнението си или задай въпрос…"></textarea>
        <div class="invalid-feedback"></div>
        <div class="d-flex justify-content-end mt-2">
          <button type="submit" class="btn btn-primary"><i class="bi bi-send me-1" aria-hidden="true"></i>Публикувай</button>
        </div>
      </div>
    </form>`;
}

/**
 * Comments block: list + add form (users) + inline edit (author) + delete (author/admin).
 * @param {HTMLElement} box
 * @param {{ materialId: string, comments: object[], user: object | null, signal: AbortSignal, onChange: () => void }} options
 */
export function mountComments(box, { materialId, comments: initial, user, signal, onChange }) {
  let comments = initial;
  let editingId = null;

  box.innerHTML = `
    <h2 class="h5 mb-3"><i class="bi bi-chat-dots me-2" aria-hidden="true"></i>Коментари
      <span class="badge text-bg-light border" data-field="comments-count"></span></h2>
    ${renderAddForm(user)}
    <div data-field="comments-list"></div>`;
  const list = box.querySelector('[data-field="comments-list"]');
  const count = box.querySelector('[data-field="comments-count"]');

  function render() {
    count.textContent = comments.length;
    list.innerHTML = comments.length
      ? `<ul class="list-group shadow-sm">${comments.map((comment) => renderComment(comment, user, editingId)).join('')}</ul>`
      : renderEmpty({ icon: 'bi-chat-square-text', title: 'Още няма коментари.', text: 'Сподели мнението си за материала.' });
  }

  async function reload() {
    comments = await listComments(materialId, { signal });
    if (signal.aborted) return;
    render();
    onChange();
  }

  box.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;

    if (action === 'edit-comment') {
      editingId = id;
      render();
      list.querySelector('[data-form="edit-comment"] textarea')?.focus();
    } else if (action === 'cancel-edit') {
      editingId = null;
      render();
    } else if (action === 'delete-comment') {
      const ok = await confirmDialog({
        title: 'Изтриване на коментар',
        message: 'Сигурен ли си, че искаш да изтриеш този коментар?',
        confirmLabel: 'Изтрий',
      });
      if (!ok) return;
      try {
        await deleteComment(id);
        showSuccess('Коментарът е изтрит.');
        await reload();
      } catch (error) {
        if (!signal.aborted) showError(error.message);
      }
    }
  });

  box.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-form]');
    if (!form) return;
    event.preventDefault();
    const content = validateContent(form.elements.content);
    if (content === null) return;

    const button = form.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    try {
      if (form.dataset.form === 'add-comment') {
        await addComment(materialId, user.id, content);
        form.reset();
        showSuccess('Коментарът е публикуван.');
      } else {
        await updateComment(form.dataset.id, content);
        editingId = null;
        showSuccess('Коментарът е редактиран.');
      }
      await reload();
    } catch (error) {
      if (!signal.aborted) showError(error.message);
    } finally {
      setButtonLoading(button, false);
    }
  });

  render();
}
