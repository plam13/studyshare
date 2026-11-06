import html from './login.html?raw';
import { login } from '../../services/auth.js';
import { showError } from '../../utils/toast.js';
import { enableLiveValidation, isValidEmail, setButtonLoading, validateForm } from '../../utils/validation.js';
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

  const rules = {
    email: (f) => (isValidEmail(f.elements.email.value) ? '' : 'Въведи валиден имейл адрес.'),
    password: (f) => (f.elements.password.value ? '' : 'Въведи парола.'),
  };
  enableLiveValidation(form, rules);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm(form, rules)) return;

    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;

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
