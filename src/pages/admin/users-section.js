import { listUsers, setUserRole } from '../../services/admin.js';
import { renderAvatar } from '../../components/avatar/avatar.js';
import { confirmDialog } from '../../components/confirm-dialog/confirm-dialog.js';
import { renderEmpty, renderError, renderLoading } from '../../components/page-state/page-state.js';
import { renderWindow } from '../../components/window/window.js';
import { escapeHtml } from '../../utils/dom.js';
import { formatDate, formatNumber, plural } from '../../utils/format.js';
import { showError, showSuccess } from '../../utils/toast.js';
import { setButtonLoading } from '../../utils/validation.js';

const TOOLBAR = `
  <div class="row g-2 align-items-center mb-3">
    <div class="col-md-6">
      <label for="user-search" class="visually-hidden">Търси потребител</label>
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-search" aria-hidden="true"></i></span>
        <input type="search" id="user-search" class="form-control" placeholder="Търси по име или имейл…" autocomplete="off" />
      </div>
    </div>
    <div class="col-sm-6 col-md-3">
      <label for="user-role" class="visually-hidden">Роля</label>
      <select id="user-role" class="form-select">
        <option value="">Всички роли</option>
        <option value="admin">Администратори</option>
        <option value="user">Потребители</option>
      </select>
    </div>
    <div class="col-sm-6 col-md-3 text-sm-end small text-secondary" id="users-summary" aria-live="polite"></div>
  </div>
  <div id="users-table"></div>`;

function roleChip(user) {
  return user.isAdmin
    ? '<span class="ss-chip ss-tone-yellow"><i class="bi bi-shield-check" aria-hidden="true"></i>Админ</span>'
    : '<span class="ss-chip ss-tone-blue"><i class="bi bi-person" aria-hidden="true"></i>Потребител</span>';
}

function roleAction(user, currentUserId) {
  if (user.id === currentUserId) {
    return '<span class="small text-secondary" title="Не можеш да промениш собствената си роля">Това си ти</span>';
  }
  const name = escapeHtml(user.fullName || user.email);
  return user.isAdmin
    ? `<button type="button" class="btn btn-outline-danger btn-sm" data-action="set-role" data-role="user" data-id="${escapeHtml(user.id)}"
               aria-label="Отнеми админ правата на ${name}"><i class="bi bi-shield-x me-1" aria-hidden="true"></i>Отнеми админ</button>`
    : `<button type="button" class="btn btn-warning btn-sm" data-action="set-role" data-role="admin" data-id="${escapeHtml(user.id)}"
               aria-label="Направи ${name} администратор"><i class="bi bi-shield-plus me-1" aria-hidden="true"></i>Направи админ</button>`;
}

function renderRows(users, currentUserId) {
  return users
    .map(
      (user) => `
        <tr>
          <td class="ss-admin-wrap">
            <div class="ss-admin-user">
              ${renderAvatar(user.fullName || user.email, user.avatarUrl, { size: 'sm' })}
              <div class="ss-min-w-0">
                <div class="fw-semibold">${escapeHtml(user.fullName || 'Без име')}</div>
                <div class="ss-admin-user-email">${escapeHtml(user.email)}</div>
              </div>
            </div>
          </td>
          <td data-label="Роля">${roleChip(user)}</td>
          <td class="text-end" data-label="Материали">${formatNumber(user.materialsCount)}</td>
          <td class="text-end" data-label="Коментари">${formatNumber(user.commentsCount)}</td>
          <td data-label="Регистриран">${formatDate(user.createdAt)}</td>
          <td data-label="Последен вход">${user.lastSignInAt ? formatDate(user.lastSignInAt) : '—'}</td>
          <td class="text-end ss-admin-actions">${roleAction(user, currentUserId)}</td>
        </tr>`,
    )
    .join('');
}

function renderTable(users, currentUserId) {
  return `
    <div class="table-responsive">
      <table class="table table-hover ss-admin-table ss-admin-table--stack">
        <caption class="visually-hidden">Потребители и роли</caption>
        <thead>
          <tr>
            <th scope="col">Потребител</th>
            <th scope="col">Роля</th>
            <th scope="col" class="text-end">Материали</th>
            <th scope="col" class="text-end">Коментари</th>
            <th scope="col">Регистриран</th>
            <th scope="col">Последен вход</th>
            <th scope="col" class="text-end">Действие</th>
          </tr>
        </thead>
        <tbody>${renderRows(users, currentUserId)}</tbody>
      </table>
    </div>`;
}

/** Users tab: list with search / role filter and grant / revoke admin. */
export async function mountUsers(box, { user: currentUser, signal, onChange }) {
  box.innerHTML = renderWindow({ title: 'users.list', tone: 'sky', body: TOOLBAR });
  const tableBox = box.querySelector('#users-table');
  const search = box.querySelector('#user-search');
  const roleFilter = box.querySelector('#user-role');
  const summary = box.querySelector('#users-summary');

  tableBox.innerHTML = renderLoading('Зареждане на потребителите…');
  let users;
  try {
    users = await listUsers({ signal });
  } catch (error) {
    if (!signal.aborted) tableBox.innerHTML = renderError(error.message);
    return;
  }
  if (signal.aborted) return;

  function render() {
    const term = search.value.trim().toLocaleLowerCase('bg');
    const visible = users.filter(
      (u) =>
        (!roleFilter.value || u.role === roleFilter.value) &&
        (!term || `${u.fullName} ${u.email}`.toLocaleLowerCase('bg').includes(term)),
    );
    summary.textContent = `${plural(visible.length, 'потребител', 'потребители')} от ${users.length}`;
    tableBox.innerHTML = visible.length
      ? renderTable(visible, currentUser.id)
      : renderEmpty({ icon: 'bi-search', title: 'Няма потребители, които отговарят на филтъра.' });
  }

  search.addEventListener('input', render);
  roleFilter.addEventListener('change', render);

  tableBox.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action="set-role"]');
    if (!button) return;
    const target = users.find((u) => u.id === button.dataset.id);
    if (!target) return;
    const makeAdmin = button.dataset.role === 'admin';
    const name = target.fullName || target.email;

    const ok = await confirmDialog({
      title: makeAdmin ? 'Нов администратор' : 'Отнемане на админ права',
      message: makeAdmin
        ? `${name} ще може да управлява курсове, потребители и да изтрива всяко съдържание. Продължаваш ли?`
        : `${name} вече няма да има достъп до админ панела. Продължаваш ли?`,
      confirmLabel: makeAdmin ? 'Направи админ' : 'Отнеми правата',
      confirmClass: makeAdmin ? 'btn-warning' : 'btn-danger',
      icon: makeAdmin ? 'bi-shield-plus' : 'bi-shield-x',
    });
    if (!ok) return;

    setButtonLoading(button, true);
    try {
      await setUserRole(target.id, makeAdmin ? 'admin' : 'user');
      target.role = makeAdmin ? 'admin' : 'user';
      target.isAdmin = makeAdmin;
      showSuccess(makeAdmin ? `${name} вече е администратор.` : `Админ правата на ${name} са отнети.`);
      if (!signal.aborted) {
        render();
        onChange();
      }
    } catch (error) {
      showError(error.message);
      setButtonLoading(button, false);
    }
  });

  render();
}
