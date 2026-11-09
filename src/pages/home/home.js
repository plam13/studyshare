import html from './home.html?raw';
import './home.css';
import { getMostDownloadedMaterial, listLatestMaterials } from '../../services/materials.js';
import { renderMaterialList } from '../../components/material-item/material-item.js';
import { renderEmpty, renderError, renderLoading } from '../../components/page-state/page-state.js';
import { heroArt } from '../../components/illustrations/illustrations.js';

/** Step 03 ("Изтегли и оцени") opens the most downloaded material — the page where downloading and rating happen. */
async function showTopMaterialStep(container, signal) {
  try {
    const top = await getMostDownloadedMaterial({ signal });
    if (!top || signal.aborted) return;
    container.querySelector('[data-field="top-material-link"]').href = `/materials/${encodeURIComponent(top.id)}`;
    const hint = container.querySelector('[data-field="top-material-hint"]');
    hint.textContent = `напр. най-изтегляният: „${top.title}“`;
    hint.hidden = false;
  } catch {
    /* keep the fallback link to "Последно качени" */
  }
}

/** Public landing page: guest/user calls-to-action + latest materials. */
export async function mount(container, { user, signal }) {
  container.innerHTML = html;
  container.querySelector('[data-region="hero-art"]').innerHTML = heroArt();
  container.querySelectorAll('[data-show]').forEach((element) => {
    element.hidden = element.dataset.show === 'guest' ? Boolean(user) : !user;
  });
  // "How it works" links lead to a different place for guests and logged-in users
  container.querySelectorAll('[data-href-guest]').forEach((link) => {
    link.href = user ? link.dataset.hrefUser : link.dataset.hrefGuest;
  });

  showTopMaterialStep(container, signal); // not awaited — the step works with its fallback link meanwhile

  const latest = container.querySelector('#latest-materials');
  latest.innerHTML = renderLoading();
  try {
    const materials = await listLatestMaterials(6, { signal });
    if (signal.aborted) return;
    latest.innerHTML = materials.length
      ? renderMaterialList(materials, { showCourse: true })
      : renderEmpty({ illustration: true, title: 'Все още няма качени материали.' });
  } catch (error) {
    if (signal.aborted) return;
    latest.innerHTML = renderError(error.message);
  }
}
