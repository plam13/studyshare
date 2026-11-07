/**
 * Inline SVG illustrations in the flat / neo-brutalist style:
 * isometric cubes, outlined "sticker" text and sparkles. All output is static markup (no user input).
 */

const INK = '#1f1f1f';
const MONO = "'JetBrains Mono Variable', 'JetBrains Mono', Consolas, monospace";

const CUBE_COLORS = {
  blue: { top: '#b9ccff', left: '#5b7cfa', right: '#3e5ce0', text: '#2a3f9e' },
  coral: { top: '#fbc2b9', left: '#e5675a', right: '#c64e42', text: '#a33a2f' },
  yellow: { top: '#fbe98f', left: '#f6d84a', right: '#d6b52a', text: '#7a6408' },
  green: { top: '#c4e8bf', left: '#6dbb6a', right: '#4f9a4c', text: '#2f6d2c' },
  lilac: { top: '#d7d8ff', left: '#a5a8ff', right: '#8285f0', text: '#4a4dc4' },
};

/** Isometric cube; (x, y) is the centre of the top face. */
export function cube({ x, y, w = 70, h = 40, d = 60, color = 'blue', label = '' }) {
  const c = CUBE_COLORS[color];
  const stroke = `stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"`;
  const text = label
    ? `<text transform="translate(${x} ${y}) matrix(0.868 0.496 -0.868 0.496 0 0)" text-anchor="middle"
             dominant-baseline="central" font-family="${MONO}" font-weight="800"
             font-size="${label.length > 3 ? 19 : 22}" fill="${c.text}">${label}</text>`
    : '';
  return `
    <g>
      <polygon ${stroke} fill="${c.left}" points="${x - w},${y} ${x},${y + h} ${x},${y + h + d} ${x - w},${y + d}"/>
      <polygon ${stroke} fill="${c.right}" points="${x},${y + h} ${x + w},${y} ${x + w},${y + d} ${x},${y + h + d}"/>
      <polygon ${stroke} fill="${c.top}" points="${x},${y - h} ${x + w},${y} ${x},${y + h} ${x - w},${y}"/>
      ${text}
    </g>`;
}

/** Outlined text with a darker offset copy behind it. */
function stickerText({ x, y, text, size = 100, fill, depth = '#2f2f2f', offset = 6, rotate = 0 }) {
  const common = `x="${x}" y="${y}" font-family="${MONO}" font-weight="800" font-size="${size}" text-anchor="middle"
                  stroke="${INK}" stroke-width="3" stroke-linejoin="round" paint-order="stroke"`;
  return `
    <g transform="rotate(${rotate} ${x} ${y})">
      <text ${common} fill="${depth}" transform="translate(${offset} ${offset})">${text}</text>
      <text ${common} fill="${fill}">${text}</text>
    </g>`;
}

/** Four-pointed sparkle centred at (x, y). */
export function sparkle(x, y, r = 12, fill = '#f6d84a') {
  const k = r * 0.18;
  return `<path class="ss-sparkle" transform="translate(${x} ${y})" fill="${fill}" stroke="${INK}" stroke-width="2"
            stroke-linejoin="round" d="M0,${-r} Q${k},${-k} ${r},0 Q${k},${k} 0,${r} Q${-k},${k} ${-r},0 Q${-k},${-k} 0,${-r}Z"/>`;
}

function gradCap(x, y) {
  return `
    <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
      <path fill="#3e5ce0" d="M${x - 34},${y + 8} L${x - 34},${y + 34} Q${x},${y + 52} ${x + 34},${y + 34} L${x + 34},${y + 8} Z"/>
      <polygon fill="${INK}" points="${x},${y - 22} ${x + 62},${y + 6} ${x},${y + 34} ${x - 62},${y + 6}"/>
      <polygon fill="#5b7cfa" points="${x},${y - 26} ${x + 62},${y + 2} ${x},${y + 30} ${x - 62},${y + 2}"/>
      <path fill="none" d="M${x},${y + 2} L${x + 44},${y + 18} L${x + 44},${y + 50}"/>
      <circle cx="${x + 44}" cy="${y + 56}" r="7" fill="#f6d84a"/>
    </g>`;
}

/** Decorative SVG wrapper (hidden from assistive tech; the surrounding text carries the meaning). */
function svg(viewBox, body, className) {
  return `<svg class="${className}" viewBox="${viewBox}" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}

/** Landing page hero: stacked file-type cubes, a graduation cap and sparkles. */
export function heroArt(className = 'ss-hero-art') {
  return svg(
    '0 0 520 430',
    `
      ${stickerText({ x: 82, y: 150, text: '{ }', size: 96, fill: '#6dbb6a', depth: '#3d7f3a', rotate: -8 })}
      ${cube({ x: 330, y: 125, color: 'coral', label: 'PDF' })}
      ${cube({ x: 190, y: 270, color: 'blue' })}
      ${cube({ x: 190, y: 210, color: 'blue', label: 'DOCX' })}
      ${cube({ x: 400, y: 280, color: 'yellow', label: 'PPTX' })}
      ${cube({ x: 300, y: 350, w: 50, h: 29, d: 42, color: 'lilac', label: '★5' })}
      ${gradCap(330, 50)}
      ${stickerText({ x: 455, y: 170, text: '#', size: 70, fill: '#f6d84a', depth: '#b8981c', offset: 5, rotate: 10 })}
      ${sparkle(470, 60, 14)}
      ${sparkle(60, 330, 11, '#ffffff')}
      ${sparkle(255, 95, 9)}`,
    className,
  );
}

/** Empty state: an open, empty box with a question mark. */
export function emptyBoxArt(className = 'ss-empty-art') {
  return svg(
    '0 0 300 230',
    `
      <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
        <polygon fill="#3e5ce0" points="80,95 150,135 150,205 80,165"/>
        <polygon fill="#5b7cfa" points="150,135 220,95 220,165 150,205"/>
        <polygon fill="#2a3f9e" points="150,55 220,95 150,135 80,95"/>
        <polygon fill="#b9ccff" points="80,95 40,70 110,30 150,55"/>
        <polygon fill="#cddcff" points="220,95 260,70 190,30 150,55"/>
      </g>
      ${stickerText({ x: 150, y: 112, text: '?', size: 54, fill: '#f6d84a', depth: '#b8981c', offset: 3 })}
      ${sparkle(255, 30, 12)}
      ${sparkle(40, 150, 9, '#ffffff')}
      ${sparkle(270, 140, 8, '#6dbb6a')}`,
    className,
  );
}

/** 404 sticker. */
export function notFoundArt(className = 'ss-notfound-art') {
  return svg(
    '0 0 360 200',
    `
      <ellipse cx="180" cy="108" rx="150" ry="78" fill="#fdf3c4" stroke="${INK}" stroke-width="2.5"/>
      ${stickerText({ x: 180, y: 145, text: '404', size: 110, fill: '#6dbb6a', depth: '#3d7f3a', offset: 7, rotate: -4 })}
      ${sparkle(40, 40, 14)}
      ${sparkle(330, 170, 11)}
      ${sparkle(320, 30, 8, '#ffffff')}`,
    className,
  );
}
