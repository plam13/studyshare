import html from './material-form.html?raw';

/** Add (/materials/add) and edit (/materials/:id/edit) form for a material. */
export function mount(container, { route }) {
  container.innerHTML = html;
  const isEdit = route.page === 'material-edit';
  container.querySelector('[data-form-title]').textContent = isEdit ? 'Редакция на материал' : 'Качване на материал';
}
