import html from './profile.html?raw';
import './profile.css';
import { FULL_NAME_MAX_LENGTH, changeAvatar, removeAvatar, updateFullName } from '../../services/profile.js';
import { listUserMaterials } from '../../services/materials.js';
import { AVATAR_ACCEPT, validateAvatarFile } from '../../services/storage.js';
import { renderAvatar } from '../../components/avatar/avatar.js';
import { renderMaterialList } from '../../components/material-item/material-item.js';
import { confirmDialog } from '../../components/confirm-dialog/confirm-dialog.js';
import { renderEmpty, renderError, renderLoading } from '../../components/page-state/page-state.js';
import { showError, showSuccess } from '../../utils/toast.js';
import { enableLiveValidation, setButtonLoading, setFieldError, validateForm } from '../../utils/validation.js';

const ROLES = {
  user: { label: 'Потребител', className: 'ss-tone-blue' },
  admin: { label: 'Администратор', className: 'ss-tone-yellow' },
};

function renderSummary(container, user) {
  const field = (name) => container.querySelector(`[data-field="${name}"]`);
  field('avatar').innerHTML = renderAvatar(user.fullName || user.email, user.avatarUrl, { size: 'lg' });
  field('fullName').textContent = user.fullName || 'Без име';
  field('email').textContent = user.email;
  const role = ROLES[user.role] ?? ROLES.user;
  field('role').textContent = role.label;
  field('role').classList.add(role.className);
  container.querySelector('[data-action="remove-avatar"]').hidden = !user.avatarUrl;
}

async function loadMaterials(container, user, signal) {
  const box = container.querySelector('#profile-materials');
  const count = container.querySelector('[data-field="materials-count"]');
  box.innerHTML = renderLoading('Зареждане на материалите…');
  try {
    const materials = await listUserMaterials(user.id, { signal });
    if (signal.aborted) return;
    count.textContent = materials.length;
    box.innerHTML = materials.length
      ? renderMaterialList(materials, { showCourse: true })
      : renderEmpty({
          icon: 'bi-cloud-arrow-up',
          title: 'Още не си качил материали.',
          text: 'Качените от теб материали ще се показват тук.',
        });
  } catch (error) {
    if (!signal.aborted) box.innerHTML = renderError(error.message);
  }
}

/**
 * Current user's profile: avatar, display name and own materials.
 * Saving refreshes the current user → the router re-renders this page with the new data.
 */
export function mount(container, { user, signal }) {
  container.innerHTML = html;
  renderSummary(container, user);

  // Display name
  const nameForm = container.querySelector('#name-form');
  nameForm.elements.fullName.value = user.fullName;
  nameForm.elements.email.value = user.email;
  const nameRules = {
    fullName: (form) => {
      const { length } = form.elements.fullName.value.trim();
      return length >= 2 && length <= FULL_NAME_MAX_LENGTH ? '' : `Въведи име между 2 и ${FULL_NAME_MAX_LENGTH} символа.`;
    },
  };
  enableLiveValidation(nameForm, nameRules);

  nameForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm(nameForm, nameRules)) return;
    const fullName = nameForm.elements.fullName.value.trim();
    if (fullName === user.fullName) return;

    const button = nameForm.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    try {
      await updateFullName(user.id, fullName);
      showSuccess('Името е запазено.');
    } catch (error) {
      showError(error.message);
    } finally {
      setButtonLoading(button, false);
    }
  });

  // Avatar
  const avatarForm = container.querySelector('#avatar-form');
  const avatarInput = avatarForm.elements.avatar;
  avatarInput.accept = AVATAR_ACCEPT;
  // A picked file is checked right away (type/size), not only on submit.
  avatarInput.addEventListener('change', () => setFieldError(avatarInput, avatarInput.files[0] ? validateAvatarFile(avatarInput.files[0]) : ''));
  const avatarRules = { avatar: () => validateAvatarFile(avatarInput.files[0]) };

  avatarForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm(avatarForm, avatarRules)) return;
    const file = avatarInput.files[0];

    const button = avatarForm.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    try {
      await changeAvatar(user.id, file);
      showSuccess('Профилната снимка е обновена.');
    } catch (error) {
      showError(error.message);
    } finally {
      setButtonLoading(button, false);
    }
  });

  avatarForm.querySelector('[data-action="remove-avatar"]').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const ok = await confirmDialog({
      title: 'Премахване на снимката',
      message: 'Профилната снимка ще бъде изтрита. Продължаваш ли?',
      confirmLabel: 'Премахни',
    });
    if (!ok) return;
    setButtonLoading(button, true);
    try {
      await removeAvatar(user.id);
      showSuccess('Профилната снимка е премахната.');
    } catch (error) {
      showError(error.message);
    } finally {
      setButtonLoading(button, false);
    }
  });

  loadMaterials(container, user, signal);
}
