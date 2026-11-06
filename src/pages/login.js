import { initPage } from '../app.js';
import { login } from '../services/auth.js';
import { setFlash, showToast } from '../utils/toast.js';
import { getRedirectTarget } from '../utils/guards.js';
import { clearFormErrors, isValidEmail, setButtonLoading, setFieldError } from '../utils/validation.js';

await initPage({ activePage: 'login', access: 'guest' });

const form = document.getElementById('login-form');
const togglePassword = document.getElementById('toggle-password');

togglePassword.addEventListener('click', () => {
  const input = form.elements.password;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  togglePassword.innerHTML = `<i class="bi ${show ? 'bi-eye-slash' : 'bi-eye'}"></i>`;
  togglePassword.setAttribute('aria-label', show ? 'Скрий паролата' : 'Покажи паролата');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFormErrors(form);

  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;

  const valid = [
    setFieldError(form.elements.email, isValidEmail(email) ? '' : 'Въведи валиден имейл адрес.'),
    setFieldError(form.elements.password, password ? '' : 'Въведи парола.'),
  ].every(Boolean);
  if (!valid) return;

  const button = form.querySelector('button[type="submit"]');
  setButtonLoading(button, true);
  try {
    await login({ email, password });
    setFlash('Влезе успешно!', 'success');
    window.location.href = getRedirectTarget();
  } catch (error) {
    showToast(error.message, 'error');
    setButtonLoading(button, false);
  }
});
