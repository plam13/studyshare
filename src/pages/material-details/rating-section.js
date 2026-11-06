import { rateMaterial, removeRating } from '../../services/ratings.js';
import { showError, showSuccess } from '../../utils/toast.js';

const SCORE_LABELS = ['', 'Слаб', 'Задоволителен', 'Добър', 'Много добър', 'Отличен'];

function renderStarsInput(score, disabled) {
  return Array.from({ length: 5 }, (_, index) => {
    const value = index + 1;
    const filled = value <= score;
    return `
      <button type="button" class="ss-rate-star${filled ? ' is-filled' : ''}" data-score="${value}"
              aria-label="Оцени с ${value} от 5 — ${SCORE_LABELS[value]}" aria-pressed="${value === score}" ${disabled ? 'disabled' : ''}>
        <i class="bi ${filled ? 'bi-star-fill' : 'bi-star'}" aria-hidden="true"></i>
      </button>`;
  }).join('');
}

/**
 * "Your rating" control: guests see a login link, authors a note, other users 1–5 stars.
 * @param {HTMLElement} box
 * @param {{ material: object, user: object | null, myScore: number, signal: AbortSignal, onChange: () => void }} options
 */
export function mountRating(box, { material, user, myScore, signal, onChange }) {
  if (!user) {
    const back = encodeURIComponent(window.location.pathname);
    box.innerHTML = `<p class="mb-0 text-secondary"><i class="bi bi-star me-1" aria-hidden="true"></i><a href="/login?redirect=${back}">Влез</a>, за да оцениш материала.</p>`;
    return;
  }
  if (material.authorId === user.id) {
    box.innerHTML = '<p class="mb-0 text-secondary"><i class="bi bi-info-circle me-1" aria-hidden="true"></i>Това е твой материал — оценките дават другите потребители.</p>';
    return;
  }

  let score = myScore;
  let saving = false;
  let focusScore = null; // keep keyboard focus on the clicked star across re-renders

  function render() {
    const status = score
      ? `Твоята оценка: <strong>${score} от 5</strong> — ${SCORE_LABELS[score]}.
         <button type="button" class="btn btn-link btn-sm p-0 align-baseline" data-action="remove-rating" ${saving ? 'disabled' : ''}>Премахни</button>`
      : 'Още не си оценил този материал.';
    box.innerHTML = `
      <div class="d-flex flex-wrap align-items-center gap-3">
        <span class="fw-semibold" id="rate-label">Твоята оценка</span>
        <div class="ss-rate-stars" role="group" aria-labelledby="rate-label">${renderStarsInput(score, saving)}</div>
      </div>
      <p class="small text-secondary mb-0 mt-2" aria-live="polite">${status}</p>`;
    if (!saving && focusScore) {
      box.querySelector(`[data-score="${focusScore}"]`)?.focus();
      focusScore = null;
    }
  }

  async function save(action, message) {
    saving = true;
    render();
    try {
      await action();
      showSuccess(message);
      onChange();
    } catch (error) {
      if (!signal.aborted) showError(error.message);
    } finally {
      saving = false;
      if (!signal.aborted) render();
    }
  }

  box.addEventListener('click', (event) => {
    if (saving) return;
    const star = event.target.closest('[data-score]');
    if (star) {
      const value = Number(star.dataset.score);
      if (value === score) return;
      const previous = score;
      score = value;
      focusScore = value;
      save(() => rateMaterial(material.id, user.id, value).catch((error) => { score = previous; throw error; }), 'Оценката е запазена.');
      return;
    }
    if (event.target.closest('[data-action="remove-rating"]')) {
      const previous = score;
      score = 0;
      save(() => removeRating(material.id, user.id).catch((error) => { score = previous; throw error; }), 'Оценката е премахната.');
    }
  });

  render();
}
