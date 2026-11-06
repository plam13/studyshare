/**
 * Fictional sample data for StudyShare.
 * Users with existing accounts (demo/admin) are reused — their passwords are never reset.
 */

export const USERS = [
  { email: 'admin@studyshare.bg', password: 'admin123', fullName: 'Администратор' },
  { email: 'demo@studyshare.bg', password: 'demo123', fullName: 'Демо Потребител' },
  { email: 'maria@studyshare.bg', password: 'pass123', fullName: 'Мария Иванова' },
  { email: 'peter@studyshare.bg', password: 'pass123', fullName: 'Петър Георгиев' },
  { email: 'elena@studyshare.bg', password: 'pass123', fullName: 'Елена Стоянова' },
];

/** Courses are created by the admin account. `title` is unique. */
export const COURSES = [
  {
    key: 'pb',
    title: 'Programming Basics',
    description: 'Основи на програмирането: променливи, условни конструкции, цикли и първи задачи с JavaScript.',
  },
  {
    key: 'pf',
    title: 'Programming Fundamentals',
    description: 'Масиви, функции, обекти, текстообработка и регулярни изрази.',
  },
  {
    key: 'jsa',
    title: 'JS Advanced',
    description: 'Функционално програмиране, ООП, асинхронност, модули и работа с DOM.',
  },
  {
    key: 'db',
    title: 'Databases Basics',
    description: 'SQL заявки, нормализация, индекси, връзки между таблици и транзакции.',
  },
  {
    key: 'web',
    title: 'Web Design',
    description: 'HTML, CSS, Flexbox, Grid, Bootstrap и адаптивен дизайн за мобилни устройства.',
  },
  {
    key: 'ai',
    title: 'Software Technologies with AI',
    description: 'Разработка на приложения с AI асистенти, Vite, Supabase и деплой в облака.',
  },
];

/**
 * Materials. `key` makes the storage path deterministic (rerun-safe).
 * `topic` is ASCII text printed inside the generated sample PDF.
 */
export const MATERIALS = [
  { key: 'pb-intro', course: 'pb', author: 'maria@studyshare.bg', title: 'Лекция 1 — Първи стъпки в програмирането', description: 'Конспект на първата лекция: какво е програма, конзолен вход и изход, променливи и типове данни.', topic: 'First steps in programming', downloads: 142 },
  { key: 'pb-conditions', course: 'pb', author: 'peter@studyshare.bg', title: 'Условни конструкции — решени задачи', description: '15 решени задачи с if-else и switch, с обяснения стъпка по стъпка.', topic: 'Conditional statements - solved problems', downloads: 96 },
  { key: 'pb-loops', course: 'pb', author: 'demo@studyshare.bg', title: 'Цикли — шпаргалка', description: 'Кратка шпаргалка за for, while и do-while с примери и типични грешки.', topic: 'Loops cheat sheet', downloads: 211 },
  { key: 'pf-arrays', course: 'pf', author: 'elena@studyshare.bg', title: 'Масиви и методи за масиви', description: 'map, filter, reduce, sort и други полезни методи — с примери.', topic: 'Arrays and array methods', downloads: 87 },
  { key: 'pf-regex', course: 'pf', author: 'maria@studyshare.bg', title: 'Регулярни изрази за начинаещи', description: 'Основен синтаксис, групи, квантори и 10 упражнения с решения.', topic: 'Regular expressions for beginners', downloads: 64 },
  { key: 'pf-exam', course: 'pf', author: 'peter@studyshare.bg', title: 'Подготовка за изпит — Fundamentals', description: 'Задачи от минали изпити с коментирани решения.', topic: 'Fundamentals exam preparation', downloads: 175 },
  { key: 'jsa-closures', course: 'jsa', author: 'elena@studyshare.bg', title: 'Closures и scope', description: 'Как работят closure-ите в JavaScript, с диаграми и примери.', topic: 'Closures and scope', downloads: 58 },
  { key: 'jsa-async', course: 'jsa', author: 'demo@studyshare.bg', title: 'Promises и async/await', description: 'От callback-и до async/await: обяснения, примери и чести грешки.', topic: 'Promises and async-await', downloads: 103 },
  { key: 'jsa-dom', course: 'jsa', author: 'maria@studyshare.bg', title: 'DOM манипулации — упражнения', description: 'Упражнения за селектиране, създаване и промяна на DOM елементи и събития.', topic: 'DOM manipulation exercises', downloads: 71 },
  { key: 'db-sql', course: 'db', author: 'peter@studyshare.bg', title: 'SQL заявки — от SELECT до JOIN', description: 'Основни SQL заявки, филтриране, групиране и съединения на таблици.', topic: 'SQL queries - from SELECT to JOIN', downloads: 133 },
  { key: 'db-normal', course: 'db', author: 'elena@studyshare.bg', title: 'Нормализация на бази данни', description: 'Нормални форми 1NF–3NF с практически примери.', topic: 'Database normalization', downloads: 49 },
  { key: 'web-flex', course: 'web', author: 'demo@studyshare.bg', title: 'Flexbox vs Grid', description: 'Сравнение на двата layout модела и кога кой да използваме.', topic: 'Flexbox vs Grid', downloads: 88 },
  { key: 'web-responsive', course: 'web', author: 'maria@studyshare.bg', title: 'Адаптивен дизайн — чеклист', description: 'Чеклист за responsive сайт: media queries, изображения, типография.', topic: 'Responsive design checklist', downloads: 37 },
  { key: 'ai-prompts', course: 'ai', author: 'peter@studyshare.bg', title: 'Добри практики за промптове', description: 'Как да пишем ясни промптове за AI агенти при разработка на софтуер.', topic: 'Prompting best practices', downloads: 120 },
  { key: 'ai-supabase', course: 'ai', author: 'elena@studyshare.bg', title: 'Supabase — бърз старт', description: 'Auth, база данни, RLS и Storage — основните стъпки за нов проект.', topic: 'Supabase quick start', downloads: 92 },
  { key: 'ai-rls', course: 'ai', author: 'demo@studyshare.bg', title: 'RLS политики — примери', description: 'Примерни Row-Level Security политики за типични сценарии.', topic: 'RLS policy examples', downloads: 44 },
];

/** [materialKey, authorEmail, content] */
export const COMMENTS = [
  ['pb-intro', 'peter@studyshare.bg', 'Много ясно обяснено, благодаря!'],
  ['pb-intro', 'demo@studyshare.bg', 'Точно това ми трябваше преди упражненията.'],
  ['pb-loops', 'maria@studyshare.bg', 'Шпаргалката е супер, разпечатах си я.'],
  ['pb-loops', 'elena@studyshare.bg', 'Може ли да добавиш и примери с вложени цикли?'],
  ['pf-exam', 'demo@studyshare.bg', 'Решенията са много полезни за подготовката.'],
  ['pf-exam', 'maria@studyshare.bg', 'Задача 3 има и по-кратко решение с reduce.'],
  ['jsa-async', 'peter@studyshare.bg', 'Най-накрая разбрах async/await :)'],
  ['db-sql', 'elena@studyshare.bg', 'Добре структурирано, особено частта за JOIN.'],
  ['web-flex', 'maria@studyshare.bg', 'Сравнителната таблица е много удобна.'],
  ['ai-prompts', 'demo@studyshare.bg', 'Ползвам тези съвети за капстоун проекта.'],
  ['ai-supabase', 'peter@studyshare.bg', 'Полезно ръководство за начало.'],
];

/** [materialKey, userEmail, score 1–5] */
export const RATINGS = [
  ['pb-intro', 'peter@studyshare.bg', 5], ['pb-intro', 'demo@studyshare.bg', 4], ['pb-intro', 'elena@studyshare.bg', 5],
  ['pb-conditions', 'maria@studyshare.bg', 4], ['pb-conditions', 'demo@studyshare.bg', 4],
  ['pb-loops', 'maria@studyshare.bg', 5], ['pb-loops', 'elena@studyshare.bg', 5], ['pb-loops', 'peter@studyshare.bg', 4],
  ['pf-arrays', 'demo@studyshare.bg', 4], ['pf-arrays', 'peter@studyshare.bg', 3],
  ['pf-regex', 'elena@studyshare.bg', 4],
  ['pf-exam', 'demo@studyshare.bg', 5], ['pf-exam', 'maria@studyshare.bg', 5], ['pf-exam', 'elena@studyshare.bg', 4],
  ['jsa-closures', 'maria@studyshare.bg', 4],
  ['jsa-async', 'peter@studyshare.bg', 5], ['jsa-async', 'elena@studyshare.bg', 4],
  ['jsa-dom', 'demo@studyshare.bg', 3],
  ['db-sql', 'elena@studyshare.bg', 5], ['db-sql', 'demo@studyshare.bg', 4],
  ['db-normal', 'peter@studyshare.bg', 4],
  ['web-flex', 'maria@studyshare.bg', 5], ['web-flex', 'peter@studyshare.bg', 4],
  ['web-responsive', 'demo@studyshare.bg', 4],
  ['ai-prompts', 'demo@studyshare.bg', 5], ['ai-prompts', 'elena@studyshare.bg', 5],
  ['ai-supabase', 'peter@studyshare.bg', 4], ['ai-supabase', 'maria@studyshare.bg', 5],
  ['ai-rls', 'maria@studyshare.bg', 4],
];
