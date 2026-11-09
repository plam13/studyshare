/**
 * Builds a deterministic sample file for a seed material: PDF, DOCX, PPTX, XLSX, TXT or ZIP,
 * with a size class (xs … xl) so the materials list shows realistic, varied file sizes.
 */
import { createDocx, createPptx, createXlsx } from './office.mjs';
import { createStudyPdf } from './pdf.mjs';
import { between, createRandom, pick } from './random.mjs';
import { createZip } from './zip.mjs';

export const MIME_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  zip: 'application/zip',
};

/** Text pages / scanned pages per size class (scans are what make a PDF large). */
const PDF_SIZES = {
  xs: [[1, 2], [0, 0]],
  s: [[3, 6], [0, 0]],
  m: [[5, 10], [1, 1]],
  l: [[8, 14], [2, 3]],
  xl: [[10, 18], [4, 5]],
};
const COUNT_BY_SIZE = { xs: 3, s: 5, m: 8, l: 12, xl: 16 };

const HEADINGS = ['Основни понятия', 'Пример стъпка по стъпка', 'Чести грешки', 'Задачи за упражнение', 'Полезни съвети', 'Обобщение', 'Въпроси за самопроверка'];
const POINTS = [
  'Прочетете условието два пъти, преди да започнете да пишете код.',
  'Разделете задачата на малки стъпки и проверявайте всяка от тях.',
  'Тествайте с примерите от условието и поне с един свой пример.',
  'Давайте смислени имена на променливите и функциите.',
  'Внимавайте за граничните случаи: празен вход, нула, много големи стойности.',
  'Ако нещо не работи, изведете междинните стойности в конзолата.',
  'Сравнете решението си с това на колега — често има по-кратък вариант.',
  'Не копирайте код, който не разбирате; напишете го наново със свои думи.',
  'Върнете се към тази тема след няколко дни и решете задачите отново.',
  'Запишете си типичните грешки, за да не ги повтаряте на изпита.',
];
const PARAGRAPHS = [
  'В този раздел са събрани най-важните неща от лекцията и упражненията, подредени така, че да се преговарят бързо преди изпит.',
  'Примерите са нарочно кратки. Опитайте първо да ги решите сами и едва след това погледнете решението.',
  'Записките са допълвани след упражненията, така че включват и въпроси, които колегите зададоха в час.',
  'Ако откриете грешка или имате по-добро решение, напишете коментар под материала в StudyShare.',
];

/** File-system friendly name that keeps Cyrillic letters, e.g. "Цикли-помощен-лист.txt". */
export function friendlyFileName(title, ext) {
  const base = title.replace(/[—–]/g, '-').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  return `${base}.${ext}`;
}

function sections(random, count) {
  return Array.from({ length: count }, (_, i) => ({
    heading: `${i + 1}. ${pick(random, HEADINGS)}`,
    paragraphs: [pick(random, PARAGRAPHS)],
    bullets: Array.from({ length: between(random, 3, 5) }, () => pick(random, POINTS)),
  }));
}

function studyPdf(material, courseTitle, random) {
  const [[tMin, tMax], [sMin, sMax]] = PDF_SIZES[material.size ?? 's'];
  return createStudyPdf({
    title: material.topic,
    course: courseTitle,
    topic: material.topic,
    textPages: between(random, tMin, tMax),
    scanPages: between(random, sMin, sMax),
    random,
  });
}

function txtFile(material, courseTitle, random) {
  const lines = [material.title, '='.repeat(material.title.length), `Курс: ${courseTitle}`, '', material.description, ''];
  sections(random, COUNT_BY_SIZE[material.size ?? 's']).forEach((section) => {
    lines.push(section.heading, '-'.repeat(section.heading.length), ...section.bullets.map((b) => `  * ${b}`), '');
  });
  lines.push('— Споделено в StudyShare');
  return Buffer.from(lines.join('\r\n'), 'utf8');
}

function zipFile(material, courseTitle, random, date) {
  const pdf = studyPdf(material, courseTitle, random);
  const tasks = between(random, 3, 6);
  const entries = [
    { name: 'README.txt', data: `${material.title}\r\n\r\n${material.description}\r\n\r\nСъдържание:\r\n  - ${material.key}.pdf — условия и обяснения\r\n  - starter/ — начален код\r\n  - solutions/ — примерни решения\r\n` },
    { name: `${material.key}.pdf`, data: pdf },
    { name: 'starter/index.html', data: '<!doctype html>\n<html lang="bg">\n<head><meta charset="utf-8"><title>Упражнение</title></head>\n<body>\n  <main id="app"></main>\n  <script type="module" src="app.js"></script>\n</body>\n</html>\n' },
    { name: 'starter/app.js', data: '// TODO: решете задачите от PDF файла\nconst app = document.getElementById(\'app\');\napp.textContent = \'Здравей, StudyShare!\';\n' },
    ...Array.from({ length: tasks }, (_, i) => ({
      name: `solutions/task-${i + 1}.js`,
      data: `// Задача ${i + 1} — примерно решение\nexport function solve(input) {\n  return input\n    .map((line) => line.trim())\n    .filter(Boolean)\n    .length;\n}\n`,
    })),
  ];
  return createZip(entries, date);
}

function xlsxFile(material, random, date) {
  const rows = Array.from({ length: COUNT_BY_SIZE[material.size ?? 's'] * 3 }, (_, i) => [
    i + 1,
    `${pick(random, ['Изведете', 'Намерете', 'Пребройте', 'Групирайте', 'Сортирайте'])} ${pick(random, ['всички книги', 'авторите', 'читателите', 'заетите книги', 'жанровете'])} ${pick(random, ['по година', 'с повече от 2 заемания', 'без връщане', 'по брой страници', 'от последния месец'])}`,
    pick(random, ['SELECT', 'JOIN', 'GROUP BY', 'подзаявка', 'HAVING']),
    pick(random, ['лесна', 'средна', 'трудна']),
    between(random, 1, 4) * 5,
  ]);
  return createXlsx({
    sheetName: 'Задачи',
    columns: [{ title: '№', width: 6 }, { title: 'Задача', width: 60 }, { title: 'Тема', width: 14 }, { title: 'Трудност', width: 12 }, { title: 'Точки', width: 8 }],
    rows,
  }, date);
}

/**
 * @param {{ key: string, title: string, description: string, topic: string, format?: string, size?: string }} material
 * @param {string} courseTitle
 * @param {Date} date  file modification time inside archives
 * @returns {{ data: Buffer, ext: string, mime: string, fileName: string }}
 */
export function buildSampleFile(material, courseTitle, date) {
  const ext = material.format ?? 'pdf';
  const random = createRandom(`file:${material.key}`);
  const count = COUNT_BY_SIZE[material.size ?? 's'];
  let data;

  switch (ext) {
    case 'docx':
      data = createDocx({ title: material.title, subtitle: `${courseTitle} · ${material.description}`, sections: sections(random, count) }, date);
      break;
    case 'pptx':
      data = createPptx({
        accent: pick(random, ['CDDCFF', 'DFF1D9', 'FDF3C4', 'E8E8FF', 'FDE1DC']),
        slides: [
          { title: material.title, bullets: [courseTitle, material.description] },
          ...sections(random, count).map((s) => ({ title: s.heading, bullets: s.bullets })),
          { title: 'Въпроси?', bullets: ['Пишете в коментарите под материала в StudyShare.'] },
        ],
      }, date);
      break;
    case 'xlsx':
      data = xlsxFile(material, random, date);
      break;
    case 'txt':
      data = txtFile(material, courseTitle, random);
      break;
    case 'zip':
      data = zipFile(material, courseTitle, random, date);
      break;
    default:
      data = studyPdf(material, courseTitle, random);
  }
  return { data, ext, mime: MIME_TYPES[ext], fileName: friendlyFileName(material.title, ext) };
}
