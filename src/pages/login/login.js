import html from './login.html?raw';
import { login } from '../../services/auth.js';
import { showError } from '../../utils/toast.js';
import { clearFormErrors, isValidEmail, setButtonLoading, setFieldError } from '../../utils/validation.js';
import { keepRedirectParam } from '../../utils/dom.js';

/**
 * Login page. On success the router's guest-only rule sends the user
 * to the safe ?redirect= target or to /dashboard (no "login successful" toast — it is obvious).
 */
export function mount(container) {
  container.innerHTML = html;
  keepRedirectParam(container);

  const form = container.querySelector('#login-form');
  const toggle = container.querySelector('[data-action="toggle-password"]');

  toggle.addEventListener('click', () => {
    const input = form.elements.password;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    toggle.innerHTML = `<i class="bi ${show ? 'bi-eye-slash' : 'bi-eye'}" aria-hidden="true"></i>`;
    toggle.setAttribute('aria-label', show ? 'Скрий паролата' : 'Покажи паролата');
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
      await login({ email, password }); // user change → router redirects away from this page
    } catch (error) {
      showError(error.message);
      setButtonLoading(button, false);
    }
  });
}
