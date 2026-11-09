/**
 * PDF generator for the seed script (no dependencies).
 * Standard PDF fonts have no Cyrillic glyphs, so the text inside the PDFs is English (ASCII only).
 */
import { deflateSync } from 'node:zlib';
import { between, pick } from './random.mjs';

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 72;

const escapeText = (text) => text.replace(/[^\x20-\x7E]/g, '?').replace(/([\\()])/g, '\\$1');

/** Serializes PDF objects (strings or { dict, stream: Buffer }) into a file with a valid xref table. */
function buildPdf(objects) {
  const chunks = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1')];
  let length = chunks[0].length;
  const offsets = [];

  objects.forEach((object, index) => {
    offsets.push(length);
    const parts = [];
    if (typeof object === 'string') {
      parts.push(Buffer.from(`${index + 1} 0 obj\n${object}\nendobj\n`, 'latin1'));
    } else {
      const dict = object.dict.replace('>>', ` /Length ${object.stream.length} >>`);
      parts.push(Buffer.from(`${index + 1} 0 obj\n${dict}\nstream\n`, 'latin1'), object.stream, Buffer.from('\nendstream\nendobj\n', 'latin1'));
    }
    parts.forEach((part) => {
      chunks.push(part);
      length += part.length;
    });
  });

  const xref = [
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`,
    ...offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`),
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${length}\n%%EOF\n`,
  ].join('');
  chunks.push(Buffer.from(xref, 'latin1'));
  return Buffer.concat(chunks);
}

// ---------------------------------------------------------------------------
// Multi-page study PDF
// ---------------------------------------------------------------------------
const OPENERS = [
  'In this part we look at', 'A common exam task is about', 'Before writing code, think about',
  'The key idea behind', 'Many beginners get stuck on', 'Let us practise', 'A short summary of',
  'The lecture example shows', 'Remember the difference when working with', 'Try to solve this yourself, then compare it with',
];
const MIDDLES = [
  'how the input is read and validated', 'which data structure fits the problem best', 'the edge cases with empty or very large input',
  'why the simple solution is often the most readable one', 'how to split the task into small functions',
  'what the expected output looks like', 'how the loop changes the state on every step', 'the time complexity of the solution',
  'how to debug it step by step', 'naming variables so the code explains itself',
];
const CLOSERS = [
  'Write the steps in plain words first.', 'Test with the examples from the task description.', 'Keep the solution short and clear.',
  'Check the result with a second, different input.', 'Avoid magic numbers; give them a name.', 'Print intermediate values while debugging.',
  'Most mistakes come from off-by-one errors.', 'Compare your solution with a classmate.',
];
const CODE_SNIPPETS = [
  ['function solve(input) {', '  const [n, ...rest] = input;', '  let result = 0;', '  for (let i = 0; i < n; i++) {', '    result += Number(rest[i]);', '  }', '  return result;', '}'],
  ['const items = data.filter((x) => x.active)', '  .map((x) => x.name)', '  .sort((a, b) => a.localeCompare(b));', 'console.log(items.join(", "));'],
  ['SELECT c.title, COUNT(m.id) AS materials', 'FROM courses c', 'LEFT JOIN materials m ON m.course_id = c.id', 'GROUP BY c.title', 'ORDER BY materials DESC;'],
  ['if (value < 0) {', '  console.log("negative");', '} else if (value === 0) {', '  console.log("zero");', '} else {', '  console.log("positive");', '}'],
  ['async function load(id) {', '  const response = await fetch(`/api/items/${id}`);', '  if (!response.ok) throw new Error("Not found");', '  return response.json();', '}'],
];

function wrap(text, width) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length > width) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

function paragraph(random, topic) {
  const sentences = [`${pick(random, OPENERS)} ${topic.toLowerCase()}: ${pick(random, MIDDLES)}.`];
  for (let i = between(random, 1, 3); i > 0; i -= 1) sentences.push(`${pick(random, OPENERS)} ${pick(random, MIDDLES)}.`);
  sentences.push(pick(random, CLOSERS));
  return sentences.join(' ');
}

/** Content stream of one text page: heading, paragraphs and sometimes a code block. */
function textPageContent(random, { topic, section, isFirst, title, course }) {
  const ops = ['BT'];
  let y = PAGE_H - MARGIN;
  const line = (font, size, text, x = MARGIN) => {
    ops.push(`/${font} ${size} Tf`, `1 0 0 1 ${x} ${y} Tm`, `(${escapeText(text)}) Tj`);
  };

  if (isFirst) {
    line('F2', 22, title);
    y -= 26;
    line('F1', 12, course);
    y -= 18;
    line('F1', 10, 'StudyShare demo material - generated sample content.');
    y -= 40;
  }
  line('F2', 15, `${section}. ${pick(random, ['Overview', 'Examples', 'Practice', 'Common mistakes', 'Exercises', 'Summary'])}`);
  y -= 28;

  while (y > MARGIN + 120) {
    if (random() < 0.3) {
      const code = pick(random, CODE_SNIPPETS);
      for (const codeLine of code) {
        line('F3', 10, codeLine, MARGIN + 16);
        y -= 13;
      }
      y -= 14;
      continue;
    }
    for (const textLine of wrap(paragraph(random, topic), 86)) {
      line('F1', 11, textLine);
      y -= 15;
    }
    y -= 10;
  }
  ops.push('ET');
  return ops;
}

/** Grayscale "scanned notes" image: paper noise, ruled lines and pen strokes. Noise keeps it large after compression. */
function scanImage(random, width, height) {
  const pixels = Buffer.alloc(width * height);
  for (let i = 0; i < pixels.length; i += 1) pixels[i] = 232 + Math.floor(random() * 18);

  const darken = (x, y, value) => {
    if (x >= 0 && x < width && y >= 0 && y < height) pixels[y * width + x] = Math.min(pixels[y * width + x], value);
  };
  for (let row = 90; row < height - 60; row += 34) {
    for (let x = 40; x < width - 40; x += 1) darken(x, row, 205); // ruled line
    let x = 70 + Math.floor(random() * 30);
    const end = width - 60 - Math.floor(random() * 200);
    while (x < end) {
      const word = 15 + Math.floor(random() * 60);
      for (let i = 0; i < word; i += 1) {
        const yOffset = Math.round(Math.sin((x + i) / 3) * 4) - 10;
        darken(x + i, row + yOffset, 60 + Math.floor(random() * 40));
        darken(x + i, row + yOffset + 1, 90);
      }
      x += word + 10 + Math.floor(random() * 12);
    }
  }
  return deflateSync(pixels, { level: 6 });
}

/**
 * Multi-page study PDF with text pages and optional "scanned notes" pages (large).
 * @param {{ title: string, course: string, topic: string, textPages: number, scanPages: number, random: () => number }} options
 */
export function createStudyPdf({ title, course, topic, textPages, scanPages, random }) {
  // Object ids: 1 catalog, 2 pages, 3-5 fonts, then per page [page, content] (+ image for scans)
  const objects = [
    null,
    null,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>',
  ];
  const pageIds = [];
  const total = textPages + scanPages;
  const fonts = '/Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >>';
  const footer = (number) => ['BT', '/F1 9 Tf', `1 0 0 1 ${PAGE_W / 2 - 20} 40 Tm`, `(${number} / ${total}) Tj`, 'ET'];

  // First page is text (title); the rest are shuffled so scans are spread between text pages
  const rest = [...Array(Math.max(textPages - 1, 0)).fill('text'), ...Array(scanPages).fill('scan')];
  for (let i = rest.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  const kinds = textPages > 0 ? ['text', ...rest] : rest;

  kinds.forEach((kind, index) => {
    const pageId = objects.length + 1;
    const contentId = pageId + 1;
    pageIds.push(pageId);
    let ops;
    let resources = `<< ${fonts} >>`;

    if (kind === 'scan') {
      const imageId = pageId + 2;
      const [w, h] = [between(random, 760, 900), between(random, 1000, 1150)];
      ops = ['q', `${PAGE_W - 60} 0 0 ${PAGE_H - 90} 30 60 cm`, '/Im1 Do', 'Q', ...footer(index + 1)];
      resources = `<< ${fonts} /XObject << /Im1 ${imageId} 0 R >> >>`;
      objects.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources ${resources} /Contents ${contentId} 0 R >>`,
        { dict: '<< >>', stream: Buffer.from(ops.join('\n'), 'latin1') },
        { dict: `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode >>`, stream: scanImage(random, w, h) },
      );
      return;
    }

    ops = [...textPageContent(random, { topic, section: index + 1, isFirst: index === 0, title, course }), ...footer(index + 1)];
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources ${resources} /Contents ${contentId} 0 R >>`,
      { dict: '<< /Filter /FlateDecode >>', stream: deflateSync(Buffer.from(ops.join('\n'), 'latin1')) },
    );
  });

  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  return buildPdf(objects);
}
