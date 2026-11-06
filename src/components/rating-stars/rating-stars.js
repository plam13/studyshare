import './rating-stars.css';
import { formatRating } from '../../utils/format.js';

/**
 * Read-only 5-star rating display (supports half stars).
 * @param {number} average 0–5
 * @param {number} [count] number of ratings (shown in parentheses)
 */
export function renderStars(average, count) {
  const value = Number(average) || 0;
  const stars = Array.from({ length: 5 }, (_, index) => {
    const diff = value - index;
    const icon = diff >= 0.75 ? 'bi-star-fill' : diff >= 0.25 ? 'bi-star-half' : 'bi-star';
    return `<i class="bi ${icon}" aria-hidden="true"></i>`;
  }).join('');

  const label = count ? `Оценка ${formatRating(value)} от 5 (${count} гласа)` : 'Все още няма оценки';
  const suffix = count
    ? `<span class="ss-stars-value">${formatRating(value)}</span><span class="text-secondary">(${count})</span>`
    : '<span class="text-secondary">няма оценки</span>';

  return `<span class="ss-stars" role="img" aria-label="${label}"><span class="ss-stars-icons">${stars}</span>${suffix}</span>`;
}
