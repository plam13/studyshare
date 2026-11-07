import './material-banner.css';
import { cube, sparkle } from '../illustrations/illustrations.js';
import { escapeHtml } from '../../utils/dom.js';
import { fileTypeInfo, formatBytes } from '../../utils/format.js';
import { courseTone, slugify } from '../../utils/tone.js';

const TITLE_CHARS_PER_LINE = 24; // JetBrains Mono ≈ 0.6em per glyph → fits ~740px at 50px
const TITLE_MAX_LINES = 2;
const CUBE_BY_TONE = { coral: 'coral', sky: 'blue', yellow: 'yellow', green: 'green', lilac: 'lilac', paper: 'blue' };

/** Greedy word wrap into at most `maxLines` lines; the last line gets "…" when text is cut. */
export function wrapText(text, maxChars, maxLines) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const piece = word.length > maxChars ? `${word.slice(0, maxChars - 1)}…` : word;
    const candidate = current ? `${current} ${piece}` : piece;
    if (candidate.length <= maxChars) current = candidate;
    else {
      lines.push(current);
      current = piece;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1];
  kept[maxLines - 1] = `${last.length >= maxChars ? last.slice(0, maxChars - 1) : last}…`;
  return kept;
}

/**
 * Generated SVG banner for a material: course color, file-type "sheet", title and course slug.
 * Decorative (aria-hidden) — the page heading carries the same information.
 * @param {object} material normalized material from services/materials.js
 */
export function renderMaterialBanner(material) {
  const tone = courseTone(material.courseId);
  const type = fileTypeInfo(material.fileType);
  const lines = wrapText(material.title, TITLE_CHARS_PER_LINE, TITLE_MAX_LINES);
  const slug = slugify(material.course?.title ?? 'course');
  const chip = `${type.label} · ${formatBytes(material.fileSize)}`;
  const chipWidth = Math.round(chip.length * 13.5 + 44);
  const patternId = `ss-dots-${String(material.id).replace(/[^a-z0-9-]/gi, '')}`;
  const titleY = lines.length === 1 ? 190 : 165;

  return `
    <div class="ss-material-banner ss-tone-${tone}" aria-hidden="true">
      <svg viewBox="0 0 1200 320" focusable="false" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="${patternId}" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" class="ss-banner-dot"/>
          </pattern>
        </defs>
        <rect class="ss-banner-bg" width="1200" height="320"/>
        <rect width="1200" height="320" fill="url(#${patternId})"/>

        <text class="ss-banner-slug" x="60" y="92">// ${escapeHtml(slug)}</text>
        ${lines.map((line, index) => `<text class="ss-banner-title" x="60" y="${titleY + index * 58}">${escapeHtml(line)}</text>`).join('')}

        <g transform="translate(60 248)">
          <rect class="ss-banner-chip" width="${chipWidth}" height="42" rx="21"/>
          <text class="ss-banner-chip-text" x="${chipWidth / 2}" y="28" text-anchor="middle">${escapeHtml(chip)}</text>
        </g>

        ${cube({ x: 845, y: 225, w: 46, h: 27, d: 40, color: CUBE_BY_TONE[type.tone] ?? 'blue' })}
        ${sparkle(800, 70, 14)}
        ${sparkle(1150, 285, 10, '#ffffff')}

        <g class="ss-tone-${type.tone}" transform="translate(940 46) rotate(4 85 110)">
          <path class="ss-banner-shadow" transform="translate(10 10)" d="M0,12 Q0,0 12,0 H128 L170,42 V208 Q170,220 158,220 H12 Q0,220 0,208 Z"/>
          <path class="ss-banner-sheet" d="M0,12 Q0,0 12,0 H128 L170,42 V208 Q170,220 158,220 H12 Q0,220 0,208 Z"/>
          <path class="ss-banner-fold" d="M128,0 V30 Q128,42 140,42 H170 Z"/>
          <rect class="ss-banner-line" x="26" y="70" width="96" height="10" rx="5"/>
          <rect class="ss-banner-line" x="26" y="92" width="118" height="10" rx="5"/>
          <rect class="ss-banner-line" x="26" y="114" width="72" height="10" rx="5"/>
          <text class="ss-banner-type" x="85" y="182" text-anchor="middle">${escapeHtml(type.label)}</text>
        </g>
      </svg>
    </div>`;
}
