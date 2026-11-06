import html from './dashboard.html?raw';
import './dashboard.css';
import { getMyDashboard } from '../../services/dashboard.js';
import { listUserMaterials } from '../../services/materials.js';
import { renderMaterialList } from '../../components/material-item/material-item.js';
import { renderEmpty, renderError, renderLoading } from '../../components/page-state/page-state.js';
import { formatNumber, formatRating, plural } from '../../utils/format.js';

function statCard({ tone, icon, value, label, hint = '' }) {
  return `
    <div class="col-6 col-md-4 col-xl-2">
      <div class="card h-100 border-0 shadow-sm ss-stat-card ss-stat--${tone}">
        <div class="card-body">
          <span class="ss-stat-icon mb-2"><i class="bi ${icon}" aria-hidden="true"></i></span>
          <div class="ss-stat-value">${value}</div>
          <div class="small fw-semibold">${label}</div>
          ${hint ? `<div class="small text-secondary">${hint}</div>` : ''}
        </div>
      </div>
    </div>`;
}

function renderStats(stats) {
  return `
    <div class="row g-3">
      ${statCard({ tone: 'primary', icon: 'bi-files', value: formatNumber(stats.materialsCount), label: 'Мои материали' })}
      ${statCard({ tone: 'success', icon: 'bi-cloud-arrow-down', value: formatNumber(stats.downloadsTotal), label: 'Изтегляния', hint: 'на моите материали' })}
      ${statCard({
        tone: 'warning',
        icon: 'bi-star-half',
        value: stats.ratingsReceived ? formatRating(stats.avgRatingReceived) : '—',
        label: 'Среден рейтинг',
        hint: plural(stats.ratingsReceived, 'оценка', 'оценки'),
      })}
      ${statCard({ tone: 'info', icon: 'bi-chat-dots', value: formatNumber(stats.commentsReceived), label: 'Получени коментари' })}
      ${statCard({ tone: 'purple', icon: 'bi-pencil-square', value: formatNumber(stats.commentsWritten), label: 'Мои коментари' })}
      ${statCard({ tone: 'rose', icon: 'bi-hand-thumbs-up', value: formatNumber(stats.ratingsGiven), label: 'Дадени оценки' })}
    </div>`;
}

/** Home page for logged-in users: personal statistics + latest own materials. */
export async function mount(container, { user, signal }) {
  container.innerHTML = html;
  container.querySelector('[data-field="name"]').textContent = user.fullName || user.email;

  const statsBox = container.querySelector('#dashboard-stats');
  const materialsBox = container.querySelector('#dashboard-materials');
  statsBox.innerHTML = renderLoading('Зареждане на статистиката…');
  materialsBox.innerHTML = renderLoading('Зареждане на материалите…');

  const [statsResult, materialsResult] = await Promise.allSettled([
    getMyDashboard({ signal }),
    listUserMaterials(user.id, { limit: 5, signal }),
  ]);
  if (signal.aborted) return;

  statsBox.innerHTML = statsResult.status === 'fulfilled' ? renderStats(statsResult.value) : renderError(statsResult.reason.message);

  if (materialsResult.status === 'rejected') {
    materialsBox.innerHTML = renderError(materialsResult.reason.message);
  } else if (!materialsResult.value.length) {
    materialsBox.innerHTML = renderEmpty({
      icon: 'bi-cloud-arrow-up',
      title: 'Още не си качил материали.',
      text: 'Сподели записки или решени задачи с колегите си.',
      actionHtml: '<a class="btn btn-primary" href="/materials/add"><i class="bi bi-cloud-arrow-up me-1" aria-hidden="true"></i>Качи първия си материал</a>',
    });
  } else {
    materialsBox.innerHTML = renderMaterialList(materialsResult.value, { showCourse: true });
  }
}
