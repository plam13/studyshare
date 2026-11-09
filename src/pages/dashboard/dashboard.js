import html from './dashboard.html?raw';
import './dashboard.css';
import { getMyDashboard } from '../../services/dashboard.js';
import { listUserMaterials } from '../../services/materials.js';
import { listFavoriteMaterials } from '../../services/favorites.js';
import { renderMaterialList } from '../../components/material-item/material-item.js';
import { renderEmpty, renderError, renderLoading } from '../../components/page-state/page-state.js';
import { formatNumber, formatRating, plural } from '../../utils/format.js';

const TILTS = ['ss-tilt-left', 'ss-tilt-right', 'ss-tilt-right-sm', 'ss-tilt-left-sm'];

function statCard({ tone, icon, value, label, hint = '' }, index) {
  return `
    <div class="col-6 col-md-4 col-xl-2">
      <div class="ss-sticker ss-stat-card ss-tone-${tone} ${TILTS[index % TILTS.length]}">
        <span class="ss-icon-tile ss-tone-paper"><i class="bi ${icon}" aria-hidden="true"></i></span>
        <div class="ss-stat-value mt-2">${value}</div>
        <div class="small fw-semibold">${label}</div>
        ${hint ? `<div class="small ss-stat-hint">${hint}</div>` : ''}
      </div>
    </div>`;
}

function renderStats(stats) {
  const cards = [
    { tone: 'sky', icon: 'bi-files', value: formatNumber(stats.materialsCount), label: 'Мои материали' },
    { tone: 'green', icon: 'bi-cloud-arrow-down', value: formatNumber(stats.downloadsTotal), label: 'Изтегляния', hint: 'на моите материали' },
    {
      tone: 'yellow',
      icon: 'bi-star-half',
      value: stats.ratingsReceived ? formatRating(stats.avgRatingReceived) : '—',
      label: 'Среден рейтинг',
      hint: plural(stats.ratingsReceived, 'оценка', 'оценки'),
    },
    { tone: 'coral', icon: 'bi-chat-dots', value: formatNumber(stats.commentsReceived), label: 'Получени коментари' },
    { tone: 'lilac', icon: 'bi-pencil-square', value: formatNumber(stats.commentsWritten), label: 'Мои коментари' },
    { tone: 'blue', icon: 'bi-hand-thumbs-up', value: formatNumber(stats.ratingsGiven), label: 'Дадени оценки' },
  ];
  return `<div class="row g-4">${cards.map(statCard).join('')}</div>`;
}

/** Home page for logged-in users: personal statistics, latest own materials and saved materials. */
export async function mount(container, { user, signal }) {
  container.innerHTML = html;
  container.querySelector('[data-field="name"]').textContent = user.fullName || user.email;

  const statsBox = container.querySelector('#dashboard-stats');
  const materialsBox = container.querySelector('#dashboard-materials');
  const favoritesBox = container.querySelector('#dashboard-favorites');
  statsBox.innerHTML = renderLoading('Зареждане на статистиката…');
  materialsBox.innerHTML = renderLoading('Зареждане на материалите…');
  favoritesBox.innerHTML = renderLoading('Зареждане на запазените…');

  const [statsResult, materialsResult, favoritesResult] = await Promise.allSettled([
    getMyDashboard({ signal }),
    listUserMaterials(user.id, { limit: 5, signal }),
    listFavoriteMaterials(user.id, { signal }),
  ]);
  if (signal.aborted) return;

  if (favoritesResult.status === 'rejected') {
    favoritesBox.innerHTML = renderError(favoritesResult.reason.message);
  } else if (!favoritesResult.value.length) {
    favoritesBox.innerHTML = renderEmpty({
      icon: 'bi-bookmark',
      title: 'Още нямаш запазени материали.',
      text: 'Натисни „Запази“ на страницата на материал, за да го намериш бързо тук.',
    });
  } else {
    favoritesBox.innerHTML = renderMaterialList(favoritesResult.value, { showCourse: true });
  }

  statsBox.innerHTML = statsResult.status === 'fulfilled' ? renderStats(statsResult.value) : renderError(statsResult.reason.message);

  if (materialsResult.status === 'rejected') {
    materialsBox.innerHTML = renderError(materialsResult.reason.message);
  } else if (!materialsResult.value.length) {
    materialsBox.innerHTML = renderEmpty({
      illustration: true,
      title: 'Още не си качил материали.',
      text: 'Сподели записки или решени задачи с колегите си.',
      actionHtml: '<a class="btn btn-primary" href="/materials/add"><i class="bi bi-cloud-arrow-up me-1" aria-hidden="true"></i>Качи първия си материал</a>',
    });
  } else {
    materialsBox.innerHTML = renderMaterialList(materialsResult.value, { showCourse: true });
  }
}
