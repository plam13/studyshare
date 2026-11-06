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

/** Clears validation state from all fields in a form. */
export function clearFormErrors(form) {
  form.querySelectorAll('.is-invalid').forEach((input) => {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
  });
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
