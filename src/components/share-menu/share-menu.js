import './share-menu.css';
import { escapeHtml } from '../../utils/dom.js';
import { showError, showSuccess } from '../../utils/toast.js';
import { openQrDialog } from './qr-dialog.js';

/** Share targets that accept a URL (no API keys). Discord has no share URL — it uses "copy link". */
const NETWORKS = [
  { id: 'facebook', label: 'Facebook', icon: 'bi-facebook', href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  { id: 'x', label: 'X', icon: 'bi-twitter-x', href: (u, t) => `https://x.com/intent/post?url=${u}&text=${t}` },
  { id: 'linkedin', label: 'LinkedIn', icon: 'bi-linkedin', href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  { id: 'reddit', label: 'Reddit', icon: 'bi-reddit', href: (u, t) => `https://www.reddit.com/submit?url=${u}&title=${t}` },
  { id: 'telegram', label: 'Telegram', icon: 'bi-telegram', href: (u, t) => `https://t.me/share/url?url=${u}&text=${t}` },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'bi-whatsapp', href: (u, t) => `https://wa.me/?text=${t}%20${u}` },
  { id: 'viber', label: 'Viber', icon: 'bi-chat-dots', href: (u, t) => `viber://forward?text=${t}%20${u}` },
  { id: 'email', label: 'Имейл', icon: 'bi-envelope', href: (u, t) => `mailto:?subject=${t}&body=${u}` },
];

/** Absolute URL of an app path, e.g. "/materials/<id>" → "https://…/materials/<id>". */
export const absoluteUrl = (path) => new URL(path, window.location.origin).href;

/** Share texts use the en dash: "Пробен изпит – Programming Basics – StudyShare". */
const toShareText = (text) => text.replace(/\s+—\s+/g, ' – ');

/**
 * "Сподели" dropdown: native share sheet (when available), copy link, QR code and social networks.
 * Call mountShareMenu() on a parent element to activate the actions.
 * @param {{ url: string, title: string, label?: string, buttonClass?: string, align?: 'start' | 'end' }} options
 */
export function renderShareMenu({ url, title: rawTitle, label = 'Сподели', buttonClass = 'btn-outline-primary btn-sm', align = 'end' }) {
  const title = toShareText(rawTitle);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const native = typeof navigator.share === 'function'
    ? `<li><button type="button" class="dropdown-item" data-share="native"><i class="bi bi-phone me-2" aria-hidden="true"></i>Сподели чрез…</button></li>`
    : '';
  const networks = NETWORKS.map((n) => `
    <li><a class="dropdown-item" href="${escapeHtml(n.href(u, t))}" target="_blank" rel="noopener noreferrer" data-external>
      <i class="bi ${n.icon} ss-share-icon ss-share-${n.id} me-2" aria-hidden="true"></i>${n.label}</a></li>`).join('');

  return `
    <div class="dropdown ss-share" data-share-url="${escapeHtml(url)}" data-share-title="${escapeHtml(title)}">
      <button type="button" class="btn ${buttonClass} dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="bi bi-share me-1" aria-hidden="true"></i>${escapeHtml(label)}
      </button>
      <ul class="dropdown-menu dropdown-menu-${align} ss-share-menu">
        ${native}
        <li><button type="button" class="dropdown-item" data-share="copy"><i class="bi bi-link-45deg me-2" aria-hidden="true"></i>Копирай линка</button></li>
        <li><button type="button" class="dropdown-item" data-share="discord"><i class="bi bi-discord ss-share-icon ss-share-discord me-2" aria-hidden="true"></i>Discord <span class="small text-secondary">(копира линка)</span></button></li>
        <li><button type="button" class="dropdown-item" data-share="qr"><i class="bi bi-qr-code me-2" aria-hidden="true"></i>QR код</button></li>
        <li><hr class="dropdown-divider" /></li>
        ${networks}
      </ul>
    </div>`;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for older browsers / non-secure contexts
  const area = Object.assign(document.createElement('textarea'), { value: text });
  area.setAttribute('readonly', '');
  area.className = 'visually-hidden';
  document.body.append(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  if (!ok) throw new Error('copy failed');
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * One gentle "nudge" of the share icon, 1.5 s after the page opens — once per browser session,
 * never with reduced motion. A constant pulse would compete with the main action (download).
 */
export function nudgeShareOnce(root, signal) {
  if (prefersReducedMotion()) return;
  try {
    if (sessionStorage.getItem('ss-share-nudged')) return;
    sessionStorage.setItem('ss-share-nudged', '1');
  } catch {
    return; // storage blocked → skip the hint rather than repeat it on every page
  }
  const timer = setTimeout(() => {
    const menu = root.querySelector('.ss-share');
    if (!menu || signal?.aborted) return;
    menu.classList.add('is-nudging');
    menu.addEventListener('animationend', () => menu.classList.remove('is-nudging'), { once: true });
  }, 1500);
  signal?.addEventListener('abort', () => clearTimeout(timer), { once: true });
}

/**
 * Highlights the share button with a short hint at a moment the user is likely to share
 * (after a download or a 4–5 star rating). Disappears after a few seconds or when the menu opens.
 */
export function highlightShare(root, message = 'Полезно? Сподели с колегите') {
  const menu = root.querySelector('.ss-share');
  if (!menu) return;
  menu.querySelector('.ss-share-hint')?.remove();
  clearTimeout(Number(menu.dataset.hintTimer));

  const hint = document.createElement('span');
  hint.className = 'ss-share-hint';
  hint.setAttribute('role', 'status');
  hint.textContent = message;
  menu.append(hint);
  menu.classList.add('is-highlighted');

  const clear = () => {
    menu.classList.remove('is-highlighted');
    hint.remove();
  };
  menu.dataset.hintTimer = String(setTimeout(clear, 6000));
  menu.addEventListener('show.bs.dropdown', clear, { once: true });
}

/** Activates every share menu inside `root` (one delegated listener; removed with the page content). */
export function mountShareMenu(root) {
  root.addEventListener('click', async (event) => {
    const action = event.target.closest('[data-share]');
    if (!action) return;
    const menu = action.closest('.ss-share');
    const { shareUrl: url, shareTitle: title } = menu.dataset;

    switch (action.dataset.share) {
      case 'native':
        try {
          await navigator.share({ title, text: title, url });
        } catch {
          /* the user closed the share sheet */
        }
        break;
      case 'copy':
      case 'discord':
        try {
          await copyText(url);
          showSuccess(action.dataset.share === 'discord'
            ? 'Линкът е копиран — постави го в Discord (Ctrl+V).'
            : 'Линкът е копиран.');
        } catch {
          showError('Линкът не можа да бъде копиран. Копирай го от адресната лента.');
        }
        break;
      case 'qr':
        openQrDialog({ url, title });
        break;
      default:
    }
  });
}
