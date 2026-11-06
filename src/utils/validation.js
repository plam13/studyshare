const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 6;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value).trim());
}

/**
 * Marks a form field as valid/invalid using Bootstrap validation classes.
 * The message is shown in the field's sibling `.invalid-feedback` element.
 * @param {HTMLInputElement} input
 * @param {string} [message] empty => valid
 * @returns {boolean} true when valid
 */
export function setFieldError(input, message = '') {
  const feedback = input.parentElement.querySelector('.invalid-feedback');
  if (feedback) feedback.textContent = message;
  input.classList.toggle('is-invalid', Boolean(message));
  input.setAttribute('aria-invalid', String(Boolean(message)));
  return !message;
}

/**
 * Field rules: `{ [fieldName]: (form) => errorMessage | '' }`.
 * @typedef {Record<string, (form: HTMLFormElement) => string>} FormRules
 */

/**
 * Validates every field that has a rule; focuses the first invalid one.
 * @param {HTMLFormElement} form
 * @param {FormRules} rules
 * @returns {boolean} true when the whole form is valid
 */
export function validateForm(form, rules) {
  const results = Object.entries(rules).map(([name, rule]) => setFieldError(form.elements[name], rule(form)));
  const valid = results.every(Boolean);
  if (!valid) form.querySelector('.is-invalid')?.focus();
  return valid;
}

/**
 * Live feedback: once a field shows an error, it is re-checked on every input/change,
 * so the message disappears as soon as the value becomes valid. All invalid fields are
 * re-checked, which also covers dependent fields (e.g. "repeat password").
 * Fields without an error are not checked while typing (no errors before the first submit).
 * @param {HTMLFormElement} form
 * @param {FormRules} rules
 */
export function enableLiveValidation(form, rules) {
  const recheck = () => {
    Object.entries(rules).forEach(([name, rule]) => {
      const field = form.elements[name];
      if (field?.classList.contains('is-invalid')) setFieldError(field, rule(form));
    });
  };
  form.addEventListener('input', recheck);
  form.addEventListener('change', recheck);
}

/**
 * Toggles a submit button's loading state (spinner + disabled).
 * @param {HTMLButtonElement} button
 * @param {boolean} loading
 */
export function setButtonLoading(button, loading) {
  if (loading) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Моля, изчакай…';
  } else {
    button.disabled = false;
    if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
  }
}
