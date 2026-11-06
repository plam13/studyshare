import { Modal } from 'bootstrap';
import { escapeHtml } from '../../utils/dom.js';

/**
 * Accessible confirmation dialog (Bootstrap modal). Resolves true on confirm, false otherwise.
 * @param {{ title: string, message: string, confirmLabel?: string, confirmClass?: string, icon?: string }} options
 * @returns {Promise<boolean>}
 */
export function confirmDialog({
  title,
  message,
  confirmLabel = 'Потвърди',
  confirmClass = 'btn-danger',
  icon = 'bi-exclamation-triangle',
}) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="modal fade" tabindex="-1" aria-labelledby="ss-confirm-title" aria-modal="true" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title h5" id="ss-confirm-title"><i class="bi ${icon} me-2" aria-hidden="true"></i>${escapeHtml(title)}</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Затвори"></button>
          </div>
          <div class="modal-body"><p class="mb-0">${escapeHtml(message)}</p></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отказ</button>
            <button type="button" class="btn ${confirmClass}" data-confirm>${escapeHtml(confirmLabel)}</button>
          </div>
        </div>
      </div>
    </div>`;
  const element = wrapper.firstElementChild;
  document.body.append(element);

  const modal = new Modal(element);
  return new Promise((resolve) => {
    let confirmed = false;
    element.querySelector('[data-confirm]').addEventListener('click', () => {
      confirmed = true;
      modal.hide();
    });
    // Safe default for destructive actions: focus "Cancel", not "Delete".
    element.addEventListener('shown.bs.modal', () => element.querySelector('[data-bs-dismiss="modal"].btn').focus(), { once: true });
    // Browser Back while the dialog is open → close it (do not leave a backdrop over the next page).
    const closeOnNavigation = () => modal.hide();
    window.addEventListener('popstate', closeOnNavigation, { once: true });
    element.addEventListener(
      'hidden.bs.modal',
      () => {
        window.removeEventListener('popstate', closeOnNavigation);
        modal.dispose();
        element.remove();
        resolve(confirmed);
      },
      { once: true },
    );
    modal.show();
  });
}
