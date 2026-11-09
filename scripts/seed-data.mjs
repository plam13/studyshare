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
  { key: 'pb-loops', course: 'pb', author: 'demo@studyshare.bg', title: 'Цикли — помощен лист', description: 'Кратък помощен лист за for, while и do-while с примери и типични грешки.', topic: 'Loops cheat sheet', downloads: 211 },
  { key: 'pf-arrays', course: 'pf', author: 'elena@studyshare.bg', title: 'Масиви и методи за масиви', description: 'map, filter, reduce, sort и други полезни методи — с примери.', topic: 'Arrays and array methods', downloads: 87 },
  { key: 'pf-regex', course: 'pf', author: 'maria@studyshare.bg', title: 'Регулярни изрази за начинаещи', description: 'Основен синтаксис, групи, квантори и 10 упражнения с решения.', topic: 'Regular expressions for beginners', downloads: 64 },
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

  // Second batch (2026-11-09)
  { key: 'pb-nested-loops', course: 'pb', author: 'elena@studyshare.bg', title: 'Вложени цикли — задачи с фигури', description: 'Рисуване на триъгълници, ромбове и шахматни дъски с вложени цикли. 12 задачи с решения.', topic: 'Nested loops - drawing figures', downloads: 58 },
  { key: 'pb-exam-prep', course: 'pb', author: 'peter@studyshare.bg', title: 'Пробен изпит — Programming Basics', description: '6 задачи във формата на изпита, с примерен вход и изход и кратки насоки.\n\nВ архива има начален код и отделна папка с решения — опитайте първо сами!', topic: 'Programming Basics mock exam', downloads: 187 },
  { key: 'pf-objects', course: 'pf', author: 'demo@studyshare.bg', title: 'Обекти и асоциативни масиви', description: 'Създаване, обхождане и сортиране на обекти. Кога да ползваме Map вместо обект.', topic: 'Objects and associative arrays', downloads: 66 },
  { key: 'pf-text', course: 'pf', author: 'elena@studyshare.bg', title: 'Текстообработка — split, slice, replace', description: 'Най-често използваните методи за низове, с примери от реални задачи.', topic: 'Text processing methods', downloads: 79 },
  { key: 'pf-mid-exam', course: 'pf', author: 'maria@studyshare.bg', title: 'Mid Exam — решени задачи', description: 'Три задачи от междинен изпит с обяснение на подхода и типичните капани.', topic: 'Mid exam - solved problems', downloads: 152 },
  { key: 'jsa-classes', course: 'jsa', author: 'peter@studyshare.bg', title: 'Класове, getters и setters', description: 'ООП в JavaScript: класове, наследяване, getters/setters и private полета.', topic: 'Classes, getters and setters', downloads: 47 },
  { key: 'jsa-events', course: 'jsa', author: 'maria@studyshare.bg', title: 'Събития и event delegation', description: 'addEventListener, event bubbling и защо delegation спестява код при динамични списъци.', topic: 'Events and event delegation', downloads: 39 },
  { key: 'db-joins', course: 'db', author: 'demo@studyshare.bg', title: 'JOIN-ове с диаграми', description: 'INNER, LEFT, RIGHT и FULL JOIN, обяснени с диаграми и малки таблици.', topic: 'SQL joins explained', downloads: 114 },
  { key: 'db-indexes', course: 'db', author: 'maria@studyshare.bg', title: 'Индекси — кога и защо', description: 'Как индексите ускоряват заявките, кога вредят и как да прочетем EXPLAIN.', topic: 'Database indexes', downloads: 41 },
  { key: 'db-exercises', course: 'db', author: 'peter@studyshare.bg', title: 'SQL упражнения — 20 задачи', description: '20 задачи върху примерна база данни за библиотека: SELECT, GROUP BY, подзаявки.', topic: 'SQL exercises', downloads: 96 },
  { key: 'web-forms', course: 'web', author: 'elena@studyshare.bg', title: 'HTML форми и валидация', description: 'Типове input полета, атрибути за валидация и достъпни етикети.', topic: 'HTML forms and validation', downloads: 52 },
  { key: 'web-bootstrap', course: 'web', author: 'peter@studyshare.bg', title: 'Bootstrap 5 — помощен лист', description: 'Grid, utilities, компоненти и най-полезните класове на една страница.', topic: 'Bootstrap 5 cheat sheet', downloads: 133 },
  { key: 'web-a11y', course: 'web', author: 'demo@studyshare.bg', title: 'Достъпност (a11y) — основи', description: 'Семантичен HTML, контраст, фокус и навигация с клавиатура.', topic: 'Web accessibility basics', downloads: 28 },
  { key: 'ai-git', course: 'ai', author: 'maria@studyshare.bg', title: 'Git команди за всеки ден', description: 'commit, branch, merge, rebase и как да оправим грешен commit. Кратко и практично.', topic: 'Everyday Git commands', downloads: 109 },
  { key: 'ai-vite-netlify', course: 'ai', author: 'elena@studyshare.bg', title: 'Vite + Netlify — деплой стъпка по стъпка', description: 'От npm create vite до работещ сайт в Netlify, с environment variables и пренасочвания.', topic: 'Deploying Vite apps to Netlify', downloads: 63 },
];

/**
 * File format and size class per material: xs (a few KB) … xl (2–3 MB, PDF with "scanned notes" pages).
 * Materials not listed here get a small PDF.
 */
export const FILE_SPECS = {
  'pb-intro': ['pdf', 'l'], 'pb-conditions': ['docx', 's'], 'pb-loops': ['txt', 's'],
  'pf-arrays': ['pdf', 'm'], 'pf-regex': ['docx', 'm'],
  'jsa-closures': ['pptx', 'm'], 'jsa-async': ['pdf', 'm'], 'jsa-dom': ['zip', 'm'],
  'db-sql': ['pdf', 'l'], 'db-normal': ['docx', 's'],
  'web-flex': ['pptx', 's'], 'web-responsive': ['docx', 'xs'],
  'ai-prompts': ['pdf', 's'], 'ai-supabase': ['pptx', 'l'], 'ai-rls': ['txt', 'xs'],
  'pb-nested-loops': ['pdf', 'm'], 'pb-exam-prep': ['zip', 'l'],
  'pf-objects': ['pdf', 's'], 'pf-text': ['pdf', 'xs'], 'pf-mid-exam': ['pdf', 'xl'],
  'jsa-classes': ['pdf', 'm'], 'jsa-events': ['pptx', 'm'],
  'db-joins': ['pdf', 'xl'], 'db-indexes': ['pdf', 's'], 'db-exercises': ['xlsx', 'm'],
  'web-forms': ['pdf', 'm'], 'web-bootstrap': ['pdf', 'xs'], 'web-a11y': ['docx', 's'],
  'ai-git': ['txt', 'm'], 'ai-vite-netlify': ['zip', 'm'],
};

/** Demo history: materials are spread over this period; comments and ratings follow their material. */
export const DATE_RANGE = { from: '2026-09-16T09:00:00+03:00', to: '2026-11-09T09:00:00+02:00' };

/** When each material appears in the semester (0 = start, 1 = end), following the curriculum; ±3 days jitter is added. */
export const DATE_HINTS = {
  'pb-intro': 0, 'pb-conditions': 0.08, 'pb-loops': 0.15, 'pb-nested-loops': 0.22, 'pb-exam-prep': 0.45,
  'pf-arrays': 0.35, 'pf-text': 0.4, 'pf-objects': 0.5, 'pf-regex': 0.55, 'pf-mid-exam': 0.62,
  'jsa-closures': 0.6, 'jsa-classes': 0.68, 'jsa-events': 0.72, 'jsa-dom': 0.76, 'jsa-async': 0.82,
  'db-sql': 0.3, 'db-normal': 0.42, 'db-joins': 0.5, 'db-indexes': 0.66, 'db-exercises': 0.78,
  'web-flex': 0.18, 'web-forms': 0.26, 'web-responsive': 0.38, 'web-bootstrap': 0.58, 'web-a11y': 0.7,
  'ai-prompts': 0.05, 'ai-git': 0.12, 'ai-supabase': 0.48, 'ai-rls': 0.64, 'ai-vite-netlify': 0.88,
};

/** [materialKey, authorEmail, content] */
export const COMMENTS = [
  ['pb-intro', 'peter@studyshare.bg', 'Много ясно обяснено, благодаря!'],
  ['pb-intro', 'demo@studyshare.bg', 'Точно това ми трябваше преди упражненията.'],
  ['pb-loops', 'maria@studyshare.bg', 'Помощният лист е супер, разпечатах си го.'],
  ['pb-loops', 'elena@studyshare.bg', 'Може ли да добавиш и примери с вложени цикли?'],
  ['jsa-async', 'peter@studyshare.bg', 'Най-накрая разбрах async/await :)'],
  ['jsa-async', 'demo@studyshare.bg', '...също и Promises'],
  ['db-sql', 'elena@studyshare.bg', 'Добре структурирано, особено частта за JOIN.'],
  ['web-flex', 'maria@studyshare.bg', 'Сравнителната таблица е много удобна.'],
  ['ai-prompts', 'demo@studyshare.bg', 'Ползвам тези съвети при всички проекти.'],
  ['ai-prompts', 'demo@studyshare.bg', 'Дали са още актуални съветите в материала с това бързо развитие на Ai'],
  ['ai-supabase', 'peter@studyshare.bg', 'Полезно ръководство за начало.'],

  // Second batch — short discussions (inserted in order, so they read chronologically)
  ['pb-loops', 'demo@studyshare.bg', '@Елена, добавих няколко примера с вложени цикли в края на файла.'],
  ['pb-exam-prep', 'maria@studyshare.bg', 'Задача 4 не ми минава в Judge на последния тест. Някой да е имал същия проблем?'],
  ['pb-exam-prep', 'elena@studyshare.bg', 'Да, при мен беше закръгляне — пробвай с toFixed(2) накрая, а не по средата на сметките.'],
  ['pb-exam-prep', 'maria@studyshare.bg', 'Това беше! Мина 100/100, благодаря :)'],
  ['pb-exam-prep', 'peter@studyshare.bg', 'Добавих бележка за закръглянето в условието, за да не се спъват и другите.'],
  ['pb-nested-loops', 'peter@studyshare.bg', 'Ромбът ми отне час, но с обяснението стана ясно.'],
  ['pb-nested-loops', 'elena@studyshare.bg', 'Трикът е да разделиш горната и долната половина на два отделни цикъла.'],
  ['pf-mid-exam', 'demo@studyshare.bg', 'Колко време ви отне третата задача?'],
  ['pf-mid-exam', 'peter@studyshare.bg', 'Около 40 минути. Най-много време отиде в парсването на входа.'],
  ['pf-mid-exam', 'maria@studyshare.bg', 'В решението съм показала и вариант с регулярен израз — по-кратък е за парсването.'],
  ['pf-text', 'maria@studyshare.bg', 'Таблицата slice vs substring е супер полезна.'],
  ['pf-objects', 'elena@studyshare.bg', 'Кога реално е по-добре Map? При мен обектът винаги върши работа.'],
  ['pf-objects', 'demo@studyshare.bg', 'Когато ключовете не са низове или когато често добавяш и махаш елементи — Map пази и реда на добавяне.'],
  ['pf-objects', 'elena@studyshare.bg', 'Ясно, благодаря! Ще го пробвам в следващата задача.'],
  ['jsa-classes', 'demo@studyshare.bg', 'Private полетата с # не работеха ли само в нови браузъри?'],
  ['jsa-classes', 'peter@studyshare.bg', 'Вече се поддържат от всички съвременни браузъри и Node.js, спокойно може да ги ползваш.'],
  ['jsa-events', 'elena@studyshare.bg', 'Event delegation ми спести половината код в проекта. Страхотен материал!'],
  ['db-joins', 'peter@studyshare.bg', 'Диаграмите са много по-ясни от тези в лекцията.'],
  ['db-joins', 'elena@studyshare.bg', 'Може ли да добавиш и пример със SELF JOIN?'],
  ['db-joins', 'demo@studyshare.bg', 'Добра идея, ще го добавя в следващата версия на файла.'],
  ['db-indexes', 'demo@studyshare.bg', 'Значи индекс на всеки foreign key е добра практика по подразбиране?'],
  ['db-indexes', 'maria@studyshare.bg', 'В повечето случаи — да, особено ако правиш JOIN или триене в каскада по тази колона.'],
  ['db-exercises', 'maria@studyshare.bg', 'Задача 17 с подзаявката е много хубава.'],
  ['web-bootstrap', 'maria@studyshare.bg', 'Разпечатах си го и го държа до монитора :)'],
  ['web-bootstrap', 'demo@studyshare.bg', 'Има ли разлика в grid-а между Bootstrap 4 и 5?'],
  ['web-bootstrap', 'peter@studyshare.bg', 'Основно новият xxl breakpoint и gutter класовете g-*. Отбелязал съм ги в листа.'],
  ['web-forms', 'demo@studyshare.bg', 'Частта за етикетите и достъпността е много полезна.'],
  ['web-a11y', 'elena@studyshare.bg', 'Не знаех, че placeholder не замества label. Благодаря!'],
  ['ai-git', 'peter@studyshare.bg', 'rebase или merge за личен проект?'],
  ['ai-git', 'maria@studyshare.bg', 'За личен проект merge е напълно достатъчен и по-безопасен. Rebase има смисъл, ако искаш чиста история.'],
  ['ai-git', 'elena@studyshare.bg', 'Командата за отмяна на последния commit ми спаси деня.'],
  ['ai-vite-netlify', 'demo@studyshare.bg', 'Бях забравил _redirects файла и всички страници връщаха 404 след презареждане.'],
  ['ai-vite-netlify', 'elena@studyshare.bg', 'Точно затова е стъпка 5 :) Без него SPA routing-ът не работи на Netlify.'],
  ['ai-rls', 'peter@studyshare.bg', 'Примерът с is_admin() ми беше точно нужен.'],
];

/** [materialKey, userEmail, score 1–5] */
export const RATINGS = [
  ['pb-intro', 'peter@studyshare.bg', 5], ['pb-intro', 'demo@studyshare.bg', 4], ['pb-intro', 'elena@studyshare.bg', 5],
  ['pb-conditions', 'maria@studyshare.bg', 4], ['pb-conditions', 'demo@studyshare.bg', 4],
  ['pb-loops', 'maria@studyshare.bg', 5], ['pb-loops', 'elena@studyshare.bg', 5], ['pb-loops', 'peter@studyshare.bg', 4],
  ['pf-arrays', 'demo@studyshare.bg', 4], ['pf-arrays', 'peter@studyshare.bg', 3],
  ['pf-regex', 'elena@studyshare.bg', 4],
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

  // Second batch
  ['pb-nested-loops', 'peter@studyshare.bg', 5], ['pb-nested-loops', 'demo@studyshare.bg', 4],
  ['pb-exam-prep', 'maria@studyshare.bg', 5], ['pb-exam-prep', 'elena@studyshare.bg', 5], ['pb-exam-prep', 'demo@studyshare.bg', 4],
  ['pf-objects', 'elena@studyshare.bg', 4], ['pf-objects', 'maria@studyshare.bg', 3],
  ['pf-text', 'maria@studyshare.bg', 5],
  ['pf-mid-exam', 'demo@studyshare.bg', 5], ['pf-mid-exam', 'peter@studyshare.bg', 4],
  ['jsa-classes', 'demo@studyshare.bg', 4],
  ['jsa-events', 'elena@studyshare.bg', 5], ['jsa-events', 'peter@studyshare.bg', 4],
  ['db-joins', 'peter@studyshare.bg', 5], ['db-joins', 'elena@studyshare.bg', 4], ['db-joins', 'maria@studyshare.bg', 5],
  ['db-indexes', 'demo@studyshare.bg', 4],
  ['db-exercises', 'maria@studyshare.bg', 4], ['db-exercises', 'elena@studyshare.bg', 3],
  ['web-forms', 'demo@studyshare.bg', 4],
  ['web-bootstrap', 'maria@studyshare.bg', 5], ['web-bootstrap', 'demo@studyshare.bg', 5], ['web-bootstrap', 'elena@studyshare.bg', 4],
  ['web-a11y', 'elena@studyshare.bg', 4],
  ['ai-git', 'peter@studyshare.bg', 5], ['ai-git', 'elena@studyshare.bg', 5],
  ['ai-vite-netlify', 'demo@studyshare.bg', 4], ['ai-vite-netlify', 'maria@studyshare.bg', 5],
];
