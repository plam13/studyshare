import { initPage } from '../app.js';
import { register } from '../services/auth.js';
import { setFlash, showToast } from '../utils/toast.js';
import { getRedirectTarget } from '../utils/guards.js';
import {
  PASSWORD_MIN_LENGTH,
  clearFormErrors,
  isValidEmail,
  setButtonLoading,
  setFieldError,
} from '../utils/validation.js';

await initPage({ activePage: 'register', access: 'guest' });

const form = document.getElementById('register-form');
const successBox = document.getElementById('register-success');

function validate({ fullName, email, password, confirmPassword }) {
  const f = form.elements;
  const results = [
    setFieldError(f.fullName, fullName.length >= 2 ? '' : 'Въведи име (поне 2 символа).'),
    setFieldError(f.email, isValidEmail(email) ? '' : 'Въведи валиден имейл адрес.'),
    setFieldError(
      f.password,
      password.length >= PASSWORD_MIN_LENGTH ? '' : `Паролата трябва да е поне ${PASSWORD_MIN_LENGTH} символа.`,
    ),
    setFieldError(f.confirmPassword, confirmPassword === password ? '' : 'Паролите не съвпадат.'),
  ];
  return results.every(Boolean);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFormErrors(form);

  const values = {
    fullName: form.elements.fullName.value.trim(),
    email: form.elements.email.value.trim(),
    password: form.elements.password.value,
    confirmPassword: form.elements.confirmPassword.value,
  };
  if (!validate(values)) return;

  const button = form.querySelector('button[type="submit"]');
  setButtonLoading(button, true);
  try {
    const { needsConfirmation } = await register(values);
    if (needsConfirmation) {
      form.classList.add('d-none');
      successBox.classList.remove('d-none');
      return;
    }
    setFlash(`Добре дошъл, ${values.fullName}! Профилът ти е създаден.`, 'success');
    window.location.href = getRedirectTarget();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setButtonLoading(button, false);
  }
});
