/**
 * Real SoftUni course slides, uploaded from the local `pdf/` folder (git-ignored, never committed).
 * If the folder or a file is missing, the seed script skips that material with a warning.
 * Every description ends with the attribution line below.
 */

export const SOFTUNI_ATTRIBUTION = 'Източник: SoftUni (презентация от курса).';

/** `file` is the name inside `pdf/`; `key` makes the storage path deterministic (rerun-safe). */
export const SOFTUNI_MATERIALS = [
  { key: 'pb-loops-slides', file: 'Loops.pdf', course: 'pb', author: 'maria@studyshare.bg', title: 'Цикли — слайдове от лекцията', description: 'Цикли for и while: синтаксис, примери, вложени цикли и типични задачи.', downloads: 34 },
  { key: 'pb-conditional-slides', file: 'Conditional-Statements.pdf', course: 'pb', author: 'peter@studyshare.bg', title: 'Условни конструкции — слайдове от лекцията', description: 'Проверки с if, else if, else и switch, логически оператори и примери.', downloads: 29 },
  { key: 'pf-arrays-slides', file: 'Arrays-Lists.pdf', course: 'pf', author: 'elena@studyshare.bg', title: 'Масиви и списъци — слайдове', description: 'Работа с масиви: обхождане, добавяне и премахване на елементи, полезни методи.', downloads: 22 },
  { key: 'pf-strings-slides', file: 'Strings-Maps-Sets.pdf', course: 'pf', author: 'demo@studyshare.bg', title: 'Низове, Map и Set — слайдове', description: 'Обработка на текст, асоциативни масиви, Map и Set с примери.', downloads: 18 },
  { key: 'pf-functions-slides', file: 'Functions-Objects.pdf', course: 'pf', author: 'maria@studyshare.bg', title: 'Функции и обекти — слайдове', description: 'Деклариране на функции, параметри, връщане на стойност и работа с обекти.', downloads: 26 },
  { key: 'jsa-classes-slides', file: 'Classes-and-Events.pdf', course: 'jsa', author: 'peter@studyshare.bg', title: 'Класове и събития — слайдове', description: 'Класове в JavaScript, наследяване и обработка на DOM събития.', downloads: 15 },
  { key: 'jsa-modules-slides', file: 'Modules-Libraries-Frameworks.pdf', course: 'jsa', author: 'elena@studyshare.bg', title: 'Модули, библиотеки и фреймуърци — слайдове', description: 'ES модули, npm пакети, библиотеки и кога да изберем фреймуърк.', downloads: 12 },
  { key: 'db-supabase-slides', file: 'Databases-and-Supabase.pdf', course: 'db', author: 'demo@studyshare.bg', title: 'Бази данни и Supabase — слайдове', description: 'Релационни бази данни, таблици и връзки, първи стъпки със Supabase.', downloads: 31 },
  { key: 'web-html-css-slides', file: 'HTML-and-CSS-Intro.pdf', course: 'web', author: 'maria@studyshare.bg', title: 'Въведение в HTML и CSS — слайдове', description: 'Структура на HTML документ, основни тагове, селектори и стилове с CSS.', downloads: 27 },
  { key: 'web-ui-slides', file: 'Web-UI-and-Libraries.pdf', course: 'web', author: 'peter@studyshare.bg', title: 'Уеб интерфейси и UI библиотеки — слайдове', description: 'Изграждане на потребителски интерфейс, Bootstrap и други UI библиотеки.', downloads: 19 },
  { key: 'ai-coding-intro-slides', file: 'Intro-to-Coding-with-AI.pdf', course: 'ai', author: 'demo@studyshare.bg', title: 'Въведение в програмирането с AI', description: 'Как AI инструментите помагат при писане на код и какви са ограниченията им.', downloads: 33 },
  { key: 'ai-assisted-slides', file: 'AI-Assisted-Coding-Intro.pdf', course: 'ai', author: 'maria@studyshare.bg', title: 'AI-асистирано програмиране — слайдове', description: 'Работа с AI агенти: промпт, имплементация, тестване и подобряване.', downloads: 24 },
  { key: 'ai-git-slides', file: 'Git-and-GitHub-Intro.pdf', course: 'ai', author: 'peter@studyshare.bg', title: 'Git и GitHub — въведение', description: 'Хранилища, commit, branch, push и pull — основите на работата с Git и GitHub.', downloads: 28 },
  { key: 'ai-supabase-apps-slides', file: 'JS-Apps-with-Supabase.pdf', course: 'ai', author: 'elena@studyshare.bg', title: 'JavaScript приложения със Supabase — слайдове', description: 'Клиент-сървър архитектура, Supabase Auth, база данни и Storage в JS приложение.', downloads: 21 },
];

/** [materialKey, authorEmail, content] */
export const SOFTUNI_COMMENTS = [
  ['pb-loops-slides', 'demo@studyshare.bg', 'Слайдовете са много подредени, добре е да ги има тук.'],
  ['db-supabase-slides', 'maria@studyshare.bg', 'Полезно за проектната задача, благодаря!'],
  ['ai-git-slides', 'elena@studyshare.bg', 'Най-накрая разбрах разликата между fetch и pull.'],
  ['ai-supabase-apps-slides', 'peter@studyshare.bg', 'Точно тази лекция ми трябваше за капстоун проекта.'],
];

/** [materialKey, userEmail, score 1–5] — never the author of the material */
export const SOFTUNI_RATINGS = [
  ['pb-loops-slides', 'demo@studyshare.bg', 5], ['pb-loops-slides', 'peter@studyshare.bg', 4],
  ['pf-functions-slides', 'elena@studyshare.bg', 4],
  ['db-supabase-slides', 'maria@studyshare.bg', 5], ['db-supabase-slides', 'elena@studyshare.bg', 5],
  ['web-html-css-slides', 'demo@studyshare.bg', 4],
  ['ai-git-slides', 'elena@studyshare.bg', 5],
  ['ai-supabase-apps-slides', 'peter@studyshare.bg', 5], ['ai-supabase-apps-slides', 'demo@studyshare.bg', 4],
];
