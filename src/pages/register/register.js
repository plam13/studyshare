import html from './register.html?raw';
import { register } from '../../services/auth.js';
import { showError, showSuccess } from '../../utils/toast.js';
import { keepRedirectParam } from '../../utils/dom.js';
import {
  PASSWORD_MIN_LENGTH,
  clearFormErrors,
  isValidEmail,
  setButtonLoading,
  setFieldError,
} from '../../utils/validation.js';

function validate(form, { fullName, email, password, confirmPassword }) {
  const f = form.elements;
  return [
    setFieldError(f.fullName, fullName.length >= 2 ? '' : 'Въведи име (поне 2 символа).'),
    setFieldError(f.email, isValidEmail(email) ? '' : 'Въведи валиден имейл адрес.'),
    setFieldError(
      f.password,
      password.length >= PASSWORD_MIN_LENGTH ? '' : `Паролата трябва да е поне ${PASSWORD_MIN_LENGTH} символа.`,
    ),
    setFieldError(f.confirmPassword, confirmPassword === password ? '' : 'Паролите не съвпадат.'),
  ].every(Boolean);
}

/** Registration page. Handles both auto-confirmed signup (session) and confirmation-required signup. */
export function mount(container) {
  container.innerHTML = html;
  keepRedirectParam(container);

  const form = container.querySelector('#register-form');
  const confirmBox = container.querySelector('#register-confirm');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormErrors(form);

    const values = {
      fullName: form.elements.fullName.value.trim(),
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
      confirmPassword: form.elements.confirmPassword.value,
    };
    if (!validate(form, values)) return;

    const button = form.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    try {
      const { needsConfirmation } = await register(values);
      if (needsConfirmation) {
        form.hidden = true;
        confirmBox.hidden = false;
        return;
      }
      // Session created → the router redirects to /dashboard.
      showSuccess(`Добре дошъл, ${values.fullName}! Профилът ти е създаден.`);
    } catch (error) {
      showError(error.message);
    } finally {
      setButtonLoading(button, false);
    }
  });
}
