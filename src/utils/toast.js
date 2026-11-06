/**
 * Reusable Bootstrap toast service.
 * Use for significant actions (created / saved / deleted / uploaded) and errors.
 * Do NOT use for obvious events ("login successful", "data loaded").
 */
import { Toast } from 'bootstrap';
import { escapeHtml } from './dom.js';

const STYLES = {
  success: { bg: 'text-bg-success', icon: 'bi-check-circle-fill', delay: 4000 },
  error: { bg: 'text-bg-danger', icon: 'bi-exclamation-triangle-fill', delay: 7000 },
  info: { bg: 'text-bg-primary', icon: 'bi-info-circle-fill', delay: 4000 },
};

const visibleMessages = new Set();

function getContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1100';
    document.body.append(container);
  }
  return container;
}

function show(message, type) {
  const key = `${type}:${message}`;
  if (visibleMessages.has(key)) return; // avoid duplicate toasts for the same event
  visibleMessages.add(key);

  const style = STYLES[type];
  const element = document.createElement('div');
  element.className = `toast align-items-center border-0 ${style.bg}`;
  element.setAttribute('role', type === 'error' ? 'alert' : 'status');
  element.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  element.setAttribute('aria-atomic', 'true');
  element.innerHTML = `
    <div class="d-flex">
      <div class="toast-body"><i class="bi ${style.icon} me-2" aria-hidden="true"></i>${escapeHtml(message)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Затвори"></button>
    </div>`;

  getContainer().append(element);
  element.addEventListener('hidden.bs.toast', () => {
    visibleMessages.delete(key);
    element.remove();
  });
  new Toast(element, { delay: style.delay }).show();
}

export const showSuccess = (message) => show(message, 'success');
export const showError = (message) => show(message, 'error');
export const showInfo = (message) => show(message, 'info');
