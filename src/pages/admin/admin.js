import html from './admin.html?raw';
import './admin.css';
import { getAdminStats } from '../../services/admin.js';
import { renderError, renderLoading } from '../../components/page-state/page-state.js';
import { countOpenReports } from '../../services/reports.js';
import { formatNumber, plural } from '../../utils/format.js';
import { mountUsers } from './users-section.js';
import { mountCourses } from './courses-section.js';
import { mountModeration } from './moderation-section.js';

const SECTIONS = { users: mountUsers, courses: mountCourses, moderation: mountModeration };
const TILTS = ['ss-tilt-left-sm', 'ss-tilt-right-sm'];

function renderStats(stats) {
  const cards = [
    { tone: 'sky', icon: 'bi-people', value: stats.usersCount, label: 'Потребители' },
    { tone: 'yellow', icon: 'bi-shield-check', value: stats.adminsCount, label: 'Администратори' },
    { tone: 'green', icon: 'bi-journal-bookmark', value: stats.coursesCount, label: 'Курсове' },
    { tone: 'coral', icon: 'bi-files', value: stats.materialsCount, label: 'Материали' },
    { tone: 'lilac', icon: 'bi-chat-dots', value: stats.commentsCount, label: 'Коментари' },
    { tone: 'blue', icon: 'bi-cloud-arrow-down', value: stats.downloadsTotal, label: 'Изтегляния' },
  ];
  return `
    <div class="row g-3">
      ${cards
        .map(
          (card, index) => `
            <div class="col-6 col-md-4 col-xl-2">
              <div class="ss-sticker ss-admin-stat ss-tone-${card.tone} ${TILTS[index % 2]}">
                <i class="bi ${card.icon}" aria-hidden="true"></i>
                <div class="ss-admin-stat-value">${formatNumber(card.value)}</div>
                <div class="small fw-semibold">${card.label}</div>
              </div>
            </div>`,
        )
        .join('')}
    </div>`;
}

/** Admin panel (/admin?tab=users|courses|moderation). Access: admins (route guard + RLS / RPC checks). */
export async function mount(container, { user, query, signal, setTitle }) {
  container.innerHTML = html;
  const tab = SECTIONS[query.get('tab')] ? query.get('tab') : 'users';

  container.querySelectorAll('[data-tab]').forEach((link) => {
    const active = link.dataset.tab === tab;
    link.classList.toggle('active', active);
    if (active) {
      link.setAttribute('aria-current', 'page');
      setTitle(`${link.textContent.trim()} · Админ панел`);
    }
  });

  const statsBox = container.querySelector('#admin-stats');
  const loadStats = async () => {
    try {
      const stats = await getAdminStats({ signal });
      if (!signal.aborted) statsBox.innerHTML = renderStats(stats);
    } catch (error) {
      if (!signal.aborted) statsBox.innerHTML = renderError(error.message);
    }
  };
  // Open reports: a count on the "Модерация" tab and a notice above the tabs (the active tab is never switched)
  const badge = container.querySelector('[data-field="reports-badge"]');
  const attention = container.querySelector('[data-region="attention"]');
  const loadReportsCount = async () => {
    try {
      const count = await countOpenReports({ signal });
      if (signal.aborted) return;
      const label = plural(count, 'отворен сигнал', 'отворени сигнала');
      badge.innerHTML = `${formatNumber(count)}<span class="visually-hidden"> ${label.split(' ').slice(1).join(' ')}</span>`;
      badge.hidden = count === 0;
      attention.querySelector('[data-field="attention-text"]').textContent = label;
      attention.querySelector('[data-field="attention-verb"]').textContent = count === 1 ? 'чака преглед.' : 'чакат преглед.';
      attention.querySelector('[data-field="attention-link"]').hidden = tab === 'moderation';
      attention.hidden = count === 0;
    } catch {
      /* the count is a hint only — the moderation tab still lists the reports */
    }
  };

  statsBox.innerHTML = renderLoading('Зареждане на статистиката…');
  loadStats();
  loadReportsCount();

  // Sections call onChange after a mutation so the totals and the report count stay current.
  const onChange = () => {
    loadStats();
    loadReportsCount();
  };
  await SECTIONS[tab](container.querySelector('#admin-section'), { user, signal, onChange });
}
