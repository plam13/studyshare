import html from './home.html?raw';
import './home.css';
import { listLatestMaterials } from '../../services/materials.js';
import { renderMaterialList } from '../../components/material-item/material-item.js';
import { renderEmpty, renderError, renderLoading } from '../../components/page-state/page-state.js';

/** Public landing page: guest/user calls-to-action + latest materials. */
export async function mount(container, { user, signal }) {
  container.innerHTML = html;
  container.querySelectorAll('[data-show]').forEach((element) => {
    element.hidden = element.dataset.show === 'guest' ? Boolean(user) : !user;
  });

  const latest = container.querySelector('#latest-materials');
  latest.innerHTML = renderLoading();
  try {
    const materials = await listLatestMaterials(6, { signal });
    if (signal.aborted) return;
    latest.innerHTML = materials.length
      ? renderMaterialList(materials, { showCourse: true })
      : renderEmpty({ icon: 'bi-inbox', title: 'Все още няма качени материали.' });
  } catch (error) {
    if (signal.aborted) return;
    latest.innerHTML = renderError(error.message);
  }
}
