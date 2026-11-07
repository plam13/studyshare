import './course-card.css';
import { escapeHtml } from '../../utils/dom.js';
import { plural } from '../../utils/format.js';
import { courseTone, slugify } from '../../utils/tone.js';

/** Clickable course card for grids, styled as a "window" with a colored title bar. */
export function renderCourseCard(course) {
  return `
    <div class="col-sm-6 col-lg-4">
      <a class="ss-win ss-tone-${courseTone(course.id)} h-100 ss-course-card" href="/courses/${encodeURIComponent(course.id)}">
        <div class="ss-win-bar" aria-hidden="true">
          <span class="ss-dot"></span><span class="ss-dot"></span><span class="ss-dot"></span>
          <span class="ss-win-title">${escapeHtml(slugify(course.title))}</span>
        </div>
        <div class="ss-win-body d-flex flex-column">
          <h2 class="h5 mb-2">${escapeHtml(course.title)}</h2>
          <p class="text-secondary small flex-grow-1 mb-3">${escapeHtml(course.description)}</p>
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span class="ss-chip ss-tone-blue">
              <i class="bi bi-files" aria-hidden="true"></i>${plural(course.materialsCount, 'материал', 'материала')}
            </span>
            <span class="ss-course-card-cta">Разгледай <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
          </div>
        </div>
      </a>
    </div>`;
}
