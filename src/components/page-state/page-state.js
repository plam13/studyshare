import { escapeHtml } from '../../utils/dom.js';

/** Loading spinner placeholder. */
export function renderLoading(text = 'Зареждане…') {
  return `
    <div class="ss-loader" role="status">
      <div class="spinner-border text-primary me-2" aria-hidden="true"></div>
      <span class="text-secondary">${escapeHtml(text)}</span>
    </div>`;
}

/** Empty state with icon, message and optional action HTML (already safe). */
export function renderEmpty({ icon = 'bi-inbox', title, text = '', actionHtml = '' }) {
  return `
    <div class="ss-empty">
      <i class="bi ${icon}" aria-hidden="true"></i>
      <p class="fw-semibold mb-1">${escapeHtml(title)}</p>
      ${text ? `<p class="mb-3">${escapeHtml(text)}</p>` : ''}
      ${actionHtml}
    </div>`;
}

/** Error state with a retry hint. */
export function renderError(message = 'Възникна грешка при зареждането.') {
  return `
    <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
      <i class="bi bi-exclamation-octagon-fill" aria-hidden="true"></i>
      <div>${escapeHtml(message)} Опитай да презаредиш страницата.</div>
    </div>`;
}

/** Not-found state for a missing/inaccessible entity. */
export function renderNotFound({ title, text, backHref, backLabel }) {
  return `
    <div class="ss-empty">
      <i class="bi bi-search" aria-hidden="true"></i>
      <h1 class="h4 text-body">${escapeHtml(title)}</h1>
      <p class="mb-3">${escapeHtml(text)}</p>
      <a class="btn btn-primary" href="${escapeHtml(backHref)}"><i class="bi bi-arrow-left me-1" aria-hidden="true"></i>${escapeHtml(backLabel)}</a>
    </div>`;
}
