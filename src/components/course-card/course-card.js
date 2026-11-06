import './course-card.css';
import { escapeHtml } from '../../utils/dom.js';
import { plural } from '../../utils/format.js';

/** Clickable course card for grids. */
export function renderCourseCard(course) {
  return `
    <div class="col-sm-6 col-lg-4">
      <a class="card h-100 border-0 shadow-sm ss-card-hover ss-course-card" href="/courses/${encodeURIComponent(course.id)}">
        <div class="card-body d-flex flex-column">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="ss-course-icon"><i class="bi bi-journal-bookmark-fill" aria-hidden="true"></i></span>
            <h2 class="h5 mb-0">${escapeHtml(course.title)}</h2>
          </div>
          <p class="text-secondary small flex-grow-1 mb-3">${escapeHtml(course.description)}</p>
          <div class="d-flex justify-content-between align-items-center small">
            <span class="badge rounded-pill text-bg-light border">
              <i class="bi bi-files me-1" aria-hidden="true"></i>${plural(course.materialsCount, 'материал', 'материала')}
            </span>
            <span class="text-primary fw-semibold">Разгледай <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
          </div>
        </div>
      </a>
    </div>`;
}
