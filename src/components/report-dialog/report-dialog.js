import { Modal } from 'bootstrap';
import { createReport, REPORT_REASONS } from '../../services/reports.js';
import { escapeHtml } from '../../utils/dom.js';
import { showError, showSuccess } from '../../utils/toast.js';
import { setButtonLoading } from '../../utils/validation.js';

/**
 * "Сигнализирай" dialog: reason + optional details. Resolves true when the report was sent.
 * @param {{ materialId: string, materialTitle: string, userId: string }} options
 * @returns {Promise<boolean>}
 */
export function openReportDialog({ materialId, materialTitle, userId }) {
  const reasons = Object.entries(REPORT_REASONS)
    .map(([value, label], i) => `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="reason" id="report-${value}" value="${value}" ${i === 0 ? 'required' : ''} />
        <label class="form-check-label" for="report-${value}">${escapeHtml(label)}</label>
      </div>`)
    .join('');

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="modal fade" tabindex="-1" aria-labelledby="ss-report-title" aria-modal="true" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <form class="modal-content" novalidate>
          <div class="modal-header">
            <h2 class="modal-title h5" id="ss-report-title"><i class="bi bi-flag me-2" aria-hidden="true"></i>Сигнализирай за материал</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Затвори"></button>
          </div>
          <div class="modal-body">
            <p class="small text-secondary">„${escapeHtml(materialTitle)}“ — сигналът се вижда само от администраторите.</p>
            <fieldset class="mb-3">
              <legend class="form-label fw-semibold fs-6">Причина</legend>
              ${reasons}
              <div class="invalid-feedback" data-error="reason">Избери причина.</div>
            </fieldset>
            <label class="form-label fw-semibold" for="report-details">Подробности <span class="text-secondary fw-normal">(по избор)</span></label>
            <textarea class="form-control" id="report-details" name="details" rows="3" maxlength="500"
                      placeholder="Напр. откъде е оригиналът или какво не е наред."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отказ</button>
            <button type="submit" class="btn btn-danger"><i class="bi bi-flag me-1" aria-hidden="true"></i>Изпрати сигнал</button>
          </div>
        </form>
      </div>
    </div>`;
  const element = wrapper.firstElementChild;
  document.body.append(element);
  const modal = new Modal(element);
  const form = element.querySelector('form');
  const reasonError = form.querySelector('[data-error="reason"]');

  return new Promise((resolve) => {
    let sent = false;
    form.addEventListener('change', () => reasonError.classList.remove('d-block'));
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const reason = form.elements.reason.value;
      if (!reason) {
        reasonError.classList.add('d-block');
        form.querySelector('input[name="reason"]').focus();
        return;
      }
      const button = form.querySelector('button[type="submit"]');
      setButtonLoading(button, true);
      try {
        await createReport({ materialId, userId, reason, details: form.elements.details.value });
        sent = true;
        showSuccess('Сигналът е изпратен. Благодарим!');
        modal.hide();
      } catch (error) {
        showError(error.message);
        setButtonLoading(button, false);
      }
    });

    const closeOnNavigation = () => modal.hide();
    window.addEventListener('popstate', closeOnNavigation, { once: true });
    element.addEventListener('shown.bs.modal', () => form.querySelector('input[name="reason"]').focus(), { once: true });
    element.addEventListener('hidden.bs.modal', () => {
      window.removeEventListener('popstate', closeOnNavigation);
      modal.dispose();
      element.remove();
      resolve(sent);
    }, { once: true });
    modal.show();
  });
}
