import './material-item.css';
import { escapeHtml } from '../../utils/dom.js';
import { fileTypeInfo, formatBytes, formatDate, formatNumber } from '../../utils/format.js';
import { renderStars } from '../rating-stars/rating-stars.js';

/** File-type "sheet" badge (PDF, DOCX, …) with a folded corner. */
export function renderFileBadge(mimeType, { large = false } = {}) {
  const type = fileTypeInfo(mimeType);
  const icon = large ? `<i class="bi ${type.icon}" aria-hidden="true"></i>` : '';
  return `
    <span class="ss-file-badge ss-tone-${type.tone} ${large ? 'ss-file-badge--lg' : ''}" role="img" aria-label="Тип файл: ${type.label}">
      ${icon}<span aria-hidden="true">${type.label}</span>
    </span>`;
}

/**
 * One material as a clickable row.
 * @param {object} material normalized material from services/materials.js
 * @param {{ showCourse?: boolean }} [options]
 */
export function renderMaterialItem(material, { showCourse = false } = {}) {
  const course = showCourse && material.course
    ? `<span class="ss-material-course"><i class="bi bi-journal-bookmark me-1" aria-hidden="true"></i>${escapeHtml(material.course.title)}</span>`
    : '';

  return `
    <a class="ss-material-row" href="/materials/${encodeURIComponent(material.id)}">
      ${renderFileBadge(material.fileType)}
      <div class="ss-material-row-body">
        <h3 class="h6 mb-1">${escapeHtml(material.title)}</h3>
        <div class="ss-material-meta small text-secondary">
          ${course}
          <span><i class="bi bi-person me-1" aria-hidden="true"></i>${escapeHtml(material.authorName)}</span>
          <span><i class="bi bi-calendar3 me-1" aria-hidden="true"></i>${formatDate(material.createdAt)}</span>
          <span><i class="bi bi-hdd me-1" aria-hidden="true"></i>${formatBytes(material.fileSize)}</span>
          <span><span class="visually-hidden">Изтегляния: </span><i class="bi bi-download me-1" aria-hidden="true"></i>${formatNumber(material.downloadsCount)}</span>
        </div>
      </div>
      <div class="ss-material-row-rating small">${renderStars(material.avgRating, material.ratingsCount)}</div>
      <span class="ss-material-row-go" aria-hidden="true"><i class="bi bi-arrow-right"></i></span>
    </a>`;
}

/** A list of materials, or nothing when empty (caller renders the empty state). */
export function renderMaterialList(materials, options) {
  return `<div class="ss-material-list">${materials.map((m) => renderMaterialItem(m, options)).join('')}</div>`;
}
