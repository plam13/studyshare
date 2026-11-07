import { escapeHtml } from '../../utils/dom.js';

/**
 * "Window" card with a ○○○ title bar (styles: .ss-win in src/styles/ui.css).
 * @param {{ title: string, tone?: string, body: string, bodyClass?: string, className?: string }} options
 *   `body` must already be safe HTML; `title` is escaped.
 */
export function renderWindow({ title, tone = 'blue', body, bodyClass = '', className = '' }) {
  return `
    <div class="ss-win ss-tone-${tone} ${className}">
      <div class="ss-win-bar" aria-hidden="true">
        <span class="ss-dot"></span><span class="ss-dot"></span><span class="ss-dot"></span>
        <span class="ss-win-title">${escapeHtml(title)}</span>
      </div>
      <div class="ss-win-body ${bodyClass}">${body}</div>
    </div>`;
}
