import html from './search.html?raw';
import { SEARCH_MIN_LENGTH, searchMaterials, sortMaterials, toSearchWords } from '../../services/materials.js';
import { renderMaterialList } from '../../components/material-item/material-item.js';
import { renderEmpty, renderError, renderLoading } from '../../components/page-state/page-state.js';
import { plural } from '../../utils/format.js';

const DEBOUNCE_MS = 350;

/** Keeps ?q= in the address bar (shareable, survives reload) without adding a history entry per keystroke. */
function syncUrl(text) {
  const url = text ? `/search?q=${encodeURIComponent(text)}` : '/search';
  if (window.location.pathname + window.location.search !== url) history.replaceState(null, '', url);
}

/** Public page: global search across all courses (/search?q=). */
export async function mount(container, { query, signal, setTitle }) {
  container.innerHTML = html;
  const form = container.querySelector('[data-form="search"]');
  const input = form.elements.q;
  const sort = container.querySelector('#search-sort');
  const summary = container.querySelector('[data-field="summary"]');
  const results = container.querySelector('[data-region="results"]');

  let materials = [];
  let lastText = null;
  let searchToken = 0;
  let timer = null;

  function renderResults() {
    summary.textContent = plural(materials.length, 'резултат', 'резултата');
    results.innerHTML = materials.length
      ? renderMaterialList(sortMaterials(materials, sort.value), { showCourse: true })
      : renderEmpty({ icon: 'bi-search', title: 'Няма материали, които отговарят на търсенето.', text: 'Опитай с друга дума или част от дума.' });
  }

  async function runSearch() {
    clearTimeout(timer);
    const text = input.value.trim();
    if (text === lastText) return;
    lastText = text;
    syncUrl(text);
    setTitle(text ? `„${text}“ · Търсене` : 'Търсене');

    if (!toSearchWords(text).length) {
      searchToken += 1; // ignore a search that is still running
      materials = [];
      summary.textContent = '';
      results.innerHTML = renderEmpty({
        icon: 'bi-search',
        title: text ? `Въведи поне ${SEARCH_MIN_LENGTH} букви.` : 'Какво търсиш?',
        text: 'Търсенето обхожда заглавията и описанията на материалите във всички курсове.',
      });
      return;
    }

    const token = ++searchToken;
    summary.textContent = '';
    results.innerHTML = renderLoading('Търсене…');
    try {
      const found = await searchMaterials(text, { signal });
      if (signal.aborted || token !== searchToken) return; // a newer search started meanwhile
      materials = found;
      renderResults();
    } catch (error) {
      if (signal.aborted || token !== searchToken) return;
      results.innerHTML = renderError(error.message);
    }
  }

  input.value = query.get('q') ?? '';
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(runSearch, DEBOUNCE_MS);
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runSearch();
  });
  sort.addEventListener('change', () => {
    if (materials.length) renderResults();
  });

  await runSearch();
  return () => clearTimeout(timer);
}
