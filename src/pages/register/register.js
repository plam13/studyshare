import html from './register.html?raw';
import { register } from '../../services/auth.js';
import { showError, showSuccess } from '../../utils/toast.js';
import { keepRedirectParam } from '../../utils/dom.js';
import {
  PASSWORD_MIN_LENGTH,
  enableLiveValidation,
  isValidEmail,
  setButtonLoading,
  validateForm,
} from '../../utils/validation.js';

/** Field rules shared by submit validation and live re-validation. */
const RULES = {
  fullName: (form) => (form.elements.fullName.value.trim().length >= 2 ? '' : 'Въведи име (поне 2 символа).'),
  email: (form) => (isValidEmail(form.elements.email.value) ? '' : 'Въведи валиден имейл адрес.'),
  password: (form) =>
    form.elements.password.value.length >= PASSWORD_MIN_LENGTH ? '' : `Паролата трябва да е поне ${PASSWORD_MIN_LENGTH} символа.`,
  confirmPassword: (form) =>
    form.elements.confirmPassword.value === form.elements.password.value ? '' : 'Паролите не съвпадат.',
};

/** Registration page. Handles both auto-confirmed signup (session) and confirmation-required signup. */
export function mount(container) {
  container.innerHTML = html;
  keepRedirectParam(container);

  const form = container.querySelector('#register-form');
  const confirmBox = container.querySelector('#register-confirm');

  enableLiveValidation(form, RULES);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm(form, RULES)) return;

    const values = {
      fullName: form.elements.fullName.value.trim(),
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
    };

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
