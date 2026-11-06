import './material-item.css';
import { escapeHtml } from '../../utils/dom.js';
import { fileTypeInfo, formatBytes, formatDate, formatNumber } from '../../utils/format.js';
import { renderStars } from '../rating-stars/rating-stars.js';

/** Colored file-type badge (PDF, DOCX, …). */
export function renderFileBadge(mimeType, { large = false } = {}) {
  const type = fileTypeInfo(mimeType);
  return `
    <span class="ss-file-badge ss-file-badge--${type.tone} ${large ? 'ss-file-badge--lg' : ''}" aria-label="Тип файл: ${type.label}">
      <i class="bi ${type.icon}" aria-hidden="true"></i><span>${type.label}</span>
    </span>`;
}

/**
 * One material as a clickable list row.
 * @param {object} material normalized material from services/materials.js
 * @param {{ showCourse?: boolean }} [options]
 */
export function renderMaterialItem(material, { showCourse = false } = {}) {
  const course = showCourse && material.course
    ? `<span><i class="bi bi-journal-bookmark me-1" aria-hidden="true"></i>${escapeHtml(material.course.title)}</span>`
    : '';

  return `
    <a class="list-group-item list-group-item-action ss-material-item" href="/materials/${encodeURIComponent(material.id)}">
      ${renderFileBadge(material.fileType)}
      <div class="ss-material-item-body">
        <h3 class="h6 mb-1">${escapeHtml(material.title)}</h3>
        <div class="ss-material-meta small text-secondary">
          ${course}
          <span><i class="bi bi-person me-1" aria-hidden="true"></i>${escapeHtml(material.authorName)}</span>
          <span><i class="bi bi-calendar3 me-1" aria-hidden="true"></i>${formatDate(material.createdAt)}</span>
          <span><i class="bi bi-hdd me-1" aria-hidden="true"></i>${formatBytes(material.fileSize)}</span>
          <span><i class="bi bi-download me-1" aria-hidden="true"></i>${formatNumber(material.downloadsCount)}</span>
        </div>
      </div>
      <div class="ss-material-item-rating small">${renderStars(material.avgRating, material.ratingsCount)}</div>
    </a>`;
}

/** A list of materials, or nothing when empty (caller renders the empty state). */
export function renderMaterialList(materials, options) {
  return `<div class="list-group shadow-sm">${materials.map((m) => renderMaterialItem(m, options)).join('')}</div>`;
}
