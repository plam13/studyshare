import html from './not-found.html?raw';
import './not-found.css';
import { notFoundArt } from '../../components/illustrations/illustrations.js';

/** 404 page for unknown routes. */
export function mount(container) {
  container.innerHTML = html;
  container.querySelector('[data-region="art"]').innerHTML = notFoundArt();
  container.querySelector('[data-path]').textContent = window.location.pathname;
}
