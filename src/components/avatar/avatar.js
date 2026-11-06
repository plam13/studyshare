import './avatar.css';
import { escapeHtml } from '../../utils/dom.js';

function initials(name) {
  return (
    String(name || '?')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || '?'
  );
}

/**
 * User avatar: profile picture when available, otherwise colored initials.
 * @param {string} name
 * @param {string | null} avatarUrl
 * @param {{ size?: 'xs' | 'sm' | 'md' | 'lg' }} [options]
 */
export function renderAvatar(name, avatarUrl, { size = 'md' } = {}) {
  const sizeClass = `ss-avatar--${size}`;
  return avatarUrl
    ? `<img class="ss-avatar ${sizeClass}" src="${escapeHtml(avatarUrl)}" alt="" loading="lazy" />`
    : `<span class="ss-avatar ${sizeClass}" aria-hidden="true">${escapeHtml(initials(name))}</span>`;
}
