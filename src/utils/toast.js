import { Toast } from 'bootstrap';
import { escapeHtml } from './dom.js';

const TOAST_STYLES = {
  success: { bg: 'text-bg-success', icon: 'bi-check-circle-fill' },
  error: { bg: 'text-bg-danger', icon: 'bi-exclamation-triangle-fill' },
  info: { bg: 'text-bg-primary', icon: 'bi-info-circle-fill' },
  warning: { bg: 'text-bg-warning', icon: 'bi-exclamation-circle-fill' },
};

const FLASH_KEY = 'ss-flash';

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

/**
 * Shows a Bootstrap toast notification.
 * @param {string} message
 * @param {'success' | 'error' | 'info' | 'warning'} [type]
 */
export function showToast(message, type = 'info') {
  const style = TOAST_STYLES[type] ?? TOAST_STYLES.info;
  const element = document.createElement('div');
  element.className = `toast align-items-center border-0 ${style.bg}`;
  element.setAttribute('role', type === 'error' ? 'alert' : 'status');
  element.setAttribute('aria-live', 'assertive');
  element.setAttribute('aria-atomic', 'true');
  element.innerHTML = `
    <div class="d-flex">
      <div class="toast-body"><i class="bi ${style.icon} me-2"></i>${escapeHtml(message)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Затвори"></button>
    </div>`;

  getContainer().append(element);
  element.addEventListener('hidden.bs.toast', () => element.remove());
  new Toast(element, { delay: 4000 }).show();
}

/** Stores a toast to be shown after the next page navigation. */
export function setFlash(message, type = 'success') {
  try {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message, type }));
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Shows (and clears) a toast stored by setFlash() on the previous page. */
export function showFlash() {
  try {
    const raw = sessionStorage.getItem(FLASH_KEY);
    if (!raw) return;
    sessionStorage.removeItem(FLASH_KEY);
    const { message, type } = JSON.parse(raw);
    showToast(message, type);
  } catch {
    /* ignore malformed flash */
  }
}
