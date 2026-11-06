import html from './profile.html?raw';

const ROLE_LABELS = { user: 'Потребител', admin: 'Администратор' };

/** Current user's profile. */
export function mount(container, { user }) {
  container.innerHTML = html;
  const fields = {
    fullName: user.fullName || '—',
    email: user.email,
    role: ROLE_LABELS[user.role] ?? user.role,
  };
  Object.entries(fields).forEach(([name, value]) => {
    container.querySelector(`[data-field="${name}"]`).textContent = value;
  });
}
