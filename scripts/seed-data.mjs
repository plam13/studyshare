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
  { key: 'pb-intro', course: 'pb', author: 'maria@studyshare.bg', title: 'Лекция 1 — Първи стъпки в програмирането', description: 'Конспект на първата лекция: какво е програма, конзолен вход и изход, променливи и типове данни. Всяка тема е с кратък пример на JavaScript, а в края има въпроси за самопроверка преди първото упражнение.', topic: 'First steps in programming', downloads: 142 },
  { key: 'pb-conditions', course: 'pb', author: 'peter@studyshare.bg', title: 'Условни конструкции — решени задачи', description: '15 решени задачи с if-else и switch, с обяснения стъпка по стъпка. Задачите вървят от лесни към по-трудни – от сравнение на две числа до вложени проверки и логически оператори, а към всяка има примерен вход и изход.', topic: 'Conditional statements - solved problems', downloads: 96 },
  { key: 'pb-loops', course: 'pb', author: 'demo@studyshare.bg', title: 'Цикли — помощен лист', description: 'Кратък помощен лист за for, while и do-while с примери и типични грешки. Обяснено е кога кой цикъл е най-удобен, как работят break и continue и как да избегнем безкраен цикъл – подходящ за бърз преговор преди изпит.', topic: 'Loops cheat sheet', downloads: 211 },
  { key: 'pf-arrays', course: 'pf', author: 'elena@studyshare.bg', title: 'Масиви и методи за масиви', description: 'map, filter, reduce, sort и други полезни методи – с примери. Показано е кои методи връщат нов масив и кои променят оригинала, както и как се комбинират във верига за решаване на типични задачи от упражненията.', topic: 'Arrays and array methods', downloads: 87 },
  { key: 'pf-regex', course: 'pf', author: 'maria@studyshare.bg', title: 'Регулярни изрази за начинаещи', description: 'Основен синтаксис, групи, квантори и 10 упражнения с решения. Обяснени са класовете символи, котвите ^ и $ и флаговете g и i, с примери за проверка на имейл, телефонен номер и дата.', topic: 'Regular expressions for beginners', downloads: 64 },
  { key: 'jsa-closures', course: 'jsa', author: 'elena@studyshare.bg', title: 'Closures и scope', description: 'Как работят closure-ите в JavaScript, с диаграми и примери. Слайдовете проследяват лексикалния scope, разликата между var, let и const и практически приложения като броячи, частни променливи и фабрични функции.', topic: 'Closures and scope', downloads: 58 },
  { key: 'jsa-async', course: 'jsa', author: 'demo@studyshare.bg', title: 'Promises и async/await', description: 'От callback-и до async/await: обяснения, примери и чести грешки. Разгледани са Promise.all, обработката на грешки с try/catch и fetch заявки към реален API, с диаграма на event loop-а.', topic: 'Promises and async-await', downloads: 103 },
  { key: 'jsa-dom', course: 'jsa', author: 'maria@studyshare.bg', title: 'DOM манипулации — упражнения', description: 'Упражнения за селектиране, създаване и промяна на DOM елементи и събития. В архива има HTML шаблон и начален JavaScript код за всяка задача – от прост брояч и списък със задачи до филтриране на таблица в реално време.', topic: 'DOM manipulation exercises', downloads: 71 },
  { key: 'db-sql', course: 'db', author: 'peter@studyshare.bg', title: 'SQL заявки — от SELECT до JOIN', description: 'Основни SQL заявки, филтриране, групиране и съединения на таблици. Материалът минава през SELECT, WHERE, ORDER BY, GROUP BY и HAVING до INNER и LEFT JOIN, с примери върху малка база данни за университет.', topic: 'SQL queries - from SELECT to JOIN', downloads: 133 },
  { key: 'db-normal', course: 'db', author: 'elena@studyshare.bg', title: 'Нормализация на бази данни', description: 'Нормални форми 1NF–3NF с практически примери. Една таблица с повтарящи се данни се разделя стъпка по стъпка, като на всеки етап е обяснено какъв проблем решаваме и кога денормализацията е оправдана.', topic: 'Database normalization', downloads: 49 },
  { key: 'web-flex', course: 'web', author: 'demo@studyshare.bg', title: 'Flexbox vs Grid', description: 'Сравнение на двата layout модела и кога кой да използваме. Слайдовете показват едни и същи оформления – навигация, карти и цяла страница – направени с Flexbox и с Grid, плюс сравнителна таблица на свойствата.', topic: 'Flexbox vs Grid', downloads: 88 },
  { key: 'web-responsive', course: 'web', author: 'maria@studyshare.bg', title: 'Адаптивен дизайн — чеклист', description: 'Чеклист за responsive сайт: media queries, изображения, типография. Удобен за проверка преди предаване на проект – viewport, mobile-first подход, гъвкави мерни единици и тестване на реални устройства.', topic: 'Responsive design checklist', downloads: 37 },
  { key: 'ai-prompts', course: 'ai', author: 'peter@studyshare.bg', title: 'Добри практики за промптове', description: 'Как да пишем ясни промптове за AI агенти при разработка на софтуер. С примери за добри и лоши промптове, разделяне на задачата на малки стъпки, даване на контекст и проверка на генерирания код преди commit.', topic: 'Prompting best practices', downloads: 120 },
  { key: 'ai-supabase', course: 'ai', author: 'elena@studyshare.bg', title: 'Supabase — бърз старт', description: 'Auth, база данни, RLS и Storage – основните стъпки за нов проект. Слайдовете водят от създаването на проект и таблици до регистрация на потребители, качване на файлове и връзка с JavaScript клиента supabase-js.', topic: 'Supabase quick start', downloads: 92 },
  { key: 'ai-rls', course: 'ai', author: 'demo@studyshare.bg', title: 'RLS политики — примери', description: 'Примерни Row-Level Security политики за типични сценарии. Включени са SQL примери за публично четене, редакция само от автора, роля администратор и защита на файлове в Storage, с коментар към всяка политика.', topic: 'RLS policy examples', downloads: 44 },

  // Second batch (2026-11-09)
  { key: 'pb-nested-loops', course: 'pb', author: 'elena@studyshare.bg', title: 'Вложени цикли — задачи с фигури', description: 'Рисуване на триъгълници, ромбове и шахматни дъски с вложени цикли. 12 задачи с решения, като към всяка е обяснено как номерът на реда и колоната определят кой символ да се отпечата.', topic: 'Nested loops - drawing figures', downloads: 58 },
  { key: 'pb-exam-prep', course: 'pb', author: 'peter@studyshare.bg', title: 'Пробен изпит — Programming Basics', description: '6 задачи във формата на изпита, с примерен вход и изход и кратки насоки.\n\nВ архива има начален код и отделна папка с решения — опитайте първо сами!', topic: 'Programming Basics mock exam', downloads: 187 },
  { key: 'pf-objects', course: 'pf', author: 'demo@studyshare.bg', title: 'Обекти и асоциативни масиви', description: 'Създаване, обхождане и сортиране на обекти и асоциативни масиви. Обяснено е кога да ползваме Map вместо обикновен обект, с примери за броене на думи, групиране по ключ и сортиране по стойност.', topic: 'Objects and associative arrays', downloads: 66 },
  { key: 'pf-text', course: 'pf', author: 'elena@studyshare.bg', title: 'Текстообработка — split, slice, replace', description: 'Най-често използваните методи за низове, с примери от реални задачи. Покрити са split, slice, substring, indexOf, replace и trim, както и как да обработим входа ред по ред и да сглобим резултата.', topic: 'Text processing methods', downloads: 79 },
  { key: 'pf-mid-exam', course: 'pf', author: 'maria@studyshare.bg', title: 'Mid Exam — решени задачи', description: 'Три задачи от междинен изпит с обяснение на подхода и типичните капани. За всяка задача има разбор на условието, решение с коментари и тестове с граничните случаи, на които най-често се губят точки.', topic: 'Mid exam - solved problems', downloads: 152 },
  { key: 'jsa-classes', course: 'jsa', author: 'peter@studyshare.bg', title: 'Класове, getters и setters', description: 'ООП в JavaScript: класове, наследяване, getters/setters и private полета. Примерите изграждат малка йерархия от класове стъпка по стъпка и показват кога наследяването помага и кога композицията е по-добър избор.', topic: 'Classes, getters and setters', downloads: 47 },
  { key: 'jsa-events', course: 'jsa', author: 'maria@studyshare.bg', title: 'Събития и event delegation', description: 'addEventListener, event bubbling и защо delegation спестява код при динамични списъци. Слайдовете показват фазите на събитието, preventDefault и stopPropagation и как един слушател обслужва цял списък.', topic: 'Events and event delegation', downloads: 39 },
  { key: 'db-joins', course: 'db', author: 'demo@studyshare.bg', title: 'JOIN-ове с диаграми', description: 'INNER, LEFT, RIGHT и FULL JOIN, обяснени с диаграми и малки таблици. До всяка диаграма е резултатът от заявката, така че ясно се вижда кои редове влизат в него и откъде идват NULL стойностите.', topic: 'SQL joins explained', downloads: 114 },
  { key: 'db-indexes', course: 'db', author: 'maria@studyshare.bg', title: 'Индекси — кога и защо', description: 'Как индексите ускоряват заявките, кога вредят и как да прочетем EXPLAIN. Сравнени са едни и същи заявки със и без индекс, разгледани са съставните индекси и цената им при INSERT и UPDATE.', topic: 'Database indexes', downloads: 41 },
  { key: 'db-exercises', course: 'db', author: 'peter@studyshare.bg', title: 'SQL упражнения — 20 задачи', description: '20 задачи върху примерна база данни за библиотека: SELECT, GROUP BY, подзаявки. Таблицата съдържа условието, очаквания брой редове и сложността на всяка задача, така че лесно да проверите собственото си решение.', topic: 'SQL exercises', downloads: 96 },
  { key: 'web-forms', course: 'web', author: 'elena@studyshare.bg', title: 'HTML форми и валидация', description: 'Типове input полета, атрибути за валидация и достъпни етикети. Показано е как работят required, pattern и minlength, как да покажем ясно съобщение за грешка до полето и как да допълним проверката с JavaScript.', topic: 'HTML forms and validation', downloads: 52 },
  { key: 'web-bootstrap', course: 'web', author: 'peter@studyshare.bg', title: 'Bootstrap 5 — помощен лист', description: 'Grid, utilities, компоненти и най-полезните класове на една страница. Удобен за разпечатване и бърза справка по време на работа: breakpoints, отстояния, цветове, бутони, карти и форми.', topic: 'Bootstrap 5 cheat sheet', downloads: 133 },
  { key: 'web-a11y', course: 'web', author: 'demo@studyshare.bg', title: 'Достъпност (a11y) — основи', description: 'Семантичен HTML, контраст, фокус и навигация с клавиатура. Включен е кратък чеклист за проверка на собствения сайт и обяснение кога са нужни alt текстове и ARIA атрибути.', topic: 'Web accessibility basics', downloads: 28 },
  { key: 'ai-git', course: 'ai', author: 'maria@studyshare.bg', title: 'Git команди за всеки ден', description: 'commit, branch, merge, rebase и как да оправим грешен commit. Командите са групирани по ситуации – нов проект, работа в клон, конфликт при merge, връщане на промени – кратко и практично, с по едно изречение обяснение.', topic: 'Everyday Git commands', downloads: 109 },
  { key: 'ai-vite-netlify', course: 'ai', author: 'elena@studyshare.bg', title: 'Vite + Netlify — деплой стъпка по стъпка', description: 'От npm create vite до работещ сайт в Netlify, с environment variables и пренасочвания. В архива има примерен проект с netlify.toml и _redirects, както и стъпките за връзка с GitHub и автоматичен деплой.', topic: 'Deploying Vite apps to Netlify', downloads: 63 },
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
  // (Peter's first comment on ai-supabase was replaced by hand on the live site, so it is not recreated.)

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

  // Third batch (2026-11-10): discussions on materials that had none, single remarks on the rest.
  // Appended at the end, so for every material they come after its existing comments.
  ['pb-conditions', 'maria@studyshare.bg', 'В задача 9 видях няколко case-а един под друг в switch. Не знаех, че така може да се групират случаите.'],
  ['pb-conditions', 'peter@studyshare.bg', 'Да, така няколко стойности водят до един и същ код. Само не забравяй break в края на групата.'],
  ['pb-conditions', 'demo@studyshare.bg', 'Примерният вход и изход към всяка задача много помага да си проверя решението преди Judge.'],
  ['pf-arrays', 'peter@studyshare.bg', 'Кое е по-бързо – forEach или обикновен for цикъл?'],
  ['pf-arrays', 'elena@studyshare.bg', 'При малки масиви разликата не се усеща. Избирай това, което се чете по-лесно – map и filter обикновено правят кода по-ясен.'],
  ['pf-arrays', 'peter@studyshare.bg', 'Разбрах, благодаря! Таблицата кои методи променят оригиналния масив също ми беше много полезна.'],
  ['pf-regex', 'elena@studyshare.bg', 'Упражнението с имейла ми мина, но не хваща адреси с точка преди @, например ivan.petrov@abv.bg.'],
  ['pf-regex', 'maria@studyshare.bg', 'Добави точката в класа от символи преди @: [\\w.]+ вместо \\w+. Ще го поправя и в решенията.'],
  ['pf-regex', 'elena@studyshare.bg', 'Сега работи, мерси!'],
  ['jsa-closures', 'demo@studyshare.bg', 'Примерът с брояча най-накрая ми изясни защо променливата не се нулира между извикванията.'],
  ['jsa-closures', 'maria@studyshare.bg', 'Слайдът с var в цикъл и setTimeout е класически въпрос на интервю – добре, че е включен.'],
  ['jsa-dom', 'peter@studyshare.bg', 'В задача 3 таблицата не се филтрира, когато пиша с главни букви.'],
  ['jsa-dom', 'maria@studyshare.bg', 'Сравнявай двете страни с toLowerCase() – и текста от полето, и съдържанието на клетката. Добавих подсказка в README файла на задачата.'],
  ['jsa-dom', 'demo@studyshare.bg', 'Началният код в архива спестява много време – може да се фокусираш само върху логиката.'],
  ['db-normal', 'demo@studyshare.bg', 'Кога е оправдано да не нормализираме до 3NF?'],
  ['db-normal', 'elena@studyshare.bg', 'Например при отчети и статистики, където четенето е много по-често от писането. Тогава дублираме данни съзнателно, за да избегнем тежки JOIN-ове.'],
  ['db-normal', 'demo@studyshare.bg', 'Ясно, примерът със сумите по месеци в края го показва добре.'],
  ['web-responsive', 'peter@studyshare.bg', 'Минах целия чеклист, преди да предам проекта, и открих два проблема на телефон. Благодаря!'],
  ['web-responsive', 'elena@studyshare.bg', 'Бих добавила и проверка за хоризонтален скрол на 320px – при мен често го причиняваха дълги думи и URL адреси.'],
  ['web-responsive', 'maria@studyshare.bg', 'Добра идея, ще я добавя в следващата версия.'],
  ['db-sql', 'demo@studyshare.bg', 'Примерната база за университет е много удачна – веднага се вижда какво връща всяка заявка.'],
  ['web-flex', 'peter@studyshare.bg', 'Сега разбирам защо за цялата страница ползвам Grid, а за менюто – Flexbox.'],
  ['ai-supabase', 'demo@studyshare.bg', 'Стъпката с RLS политиките ми спести доста главоболия при първия проект.'],
  ['jsa-events', 'demo@studyshare.bg', 'preventDefault и stopPropagation винаги ги бърках – слайдът с фазите на събитието помогна.'],
  ['web-forms', 'maria@studyshare.bg', 'Не знаех за атрибута pattern – вече проверявам телефонния номер без нито ред JavaScript.'],
  ['web-a11y', 'peter@studyshare.bg', 'Минах сайта си само с клавиатура по чеклиста и открих бутон, до който изобщо не се стига с Tab.'],
  ['ai-rls', 'elena@studyshare.bg', 'Коментарите към всяка политика са най-ценната част – ясно е защо е написана точно така.'],
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

  // Third batch (2026-11-10): materials that had only one or two ratings
  ['pb-conditions', 'elena@studyshare.bg', 5],
  ['pf-arrays', 'maria@studyshare.bg', 4],
  ['pf-regex', 'peter@studyshare.bg', 5], ['pf-regex', 'demo@studyshare.bg', 4],
  ['jsa-closures', 'demo@studyshare.bg', 5], ['jsa-closures', 'peter@studyshare.bg', 4],
  ['jsa-dom', 'peter@studyshare.bg', 4], ['jsa-dom', 'elena@studyshare.bg', 4],
  ['db-normal', 'demo@studyshare.bg', 5], ['db-normal', 'maria@studyshare.bg', 4],
  ['web-responsive', 'peter@studyshare.bg', 5], ['web-responsive', 'elena@studyshare.bg', 4],
];
