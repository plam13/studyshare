import './pdf-preview.css';
import { Modal } from 'bootstrap';
import { escapeHtml } from '../../utils/dom.js';

const PAGE_BATCH = 8; // pages rendered at once; "Покажи още" renders the next batch

/** pdf.js is large, so it is loaded only when a preview is opened. Legacy build = also older iOS Safari. */
async function loadPdfJs() {
  const [pdfjs, { default: workerUrl }] = await Promise.all([
    import('pdfjs-dist/legacy/build/pdf.min.mjs'),
    import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

/**
 * Full-screen-on-mobile dialog that renders a PDF with pdf.js (works the same on desktop, Android and iOS,
 * unlike the browser's built-in viewer in an iframe). Pages are rendered in batches as canvases.
 * @param {{ title: string, loadBlob: () => Promise<Blob> }} options  loadBlob = authenticated Storage download
 */
export async function openPdfPreview({ title, loadBlob }) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="modal fade" tabindex="-1" aria-labelledby="ss-pdf-title" aria-modal="true" role="dialog">
      <div class="modal-dialog modal-xl modal-fullscreen-md-down modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title h5 text-truncate" id="ss-pdf-title"><i class="bi bi-file-earmark-pdf me-2" aria-hidden="true"></i>${escapeHtml(title)}</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Затвори"></button>
          </div>
          <div class="modal-body ss-pdf-body">
            <div class="ss-pdf-pages" data-pages></div>
            <div class="text-center py-4" data-status role="status">
              <div class="spinner-border text-primary" aria-hidden="true"></div>
              <div class="small text-secondary mt-2">Зареждане на прегледа…</div>
            </div>
            <div class="text-center pb-3" data-more hidden>
              <button type="button" class="btn btn-outline-primary"><i class="bi bi-chevron-double-down me-1" aria-hidden="true"></i>Покажи още страници</button>
            </div>
          </div>
          <div class="modal-footer justify-content-between">
            <span class="small text-secondary" data-counter></span>
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Затвори</button>
          </div>
        </div>
      </div>
    </div>`;
  const element = wrapper.firstElementChild;
  document.body.append(element);
  const modal = new Modal(element);
  const pagesBox = element.querySelector('[data-pages]');
  const status = element.querySelector('[data-status]');
  const more = element.querySelector('[data-more]');
  const counter = element.querySelector('[data-counter]');
  let doc = null;
  let closed = false;

  const closeOnNavigation = () => modal.hide();
  window.addEventListener('popstate', closeOnNavigation, { once: true });
  element.addEventListener('hidden.bs.modal', () => {
    closed = true;
    window.removeEventListener('popstate', closeOnNavigation);
    doc?.destroy();
    modal.dispose();
    element.remove();
  }, { once: true });
  modal.show();

  let rendered = 0;
  async function renderNextBatch() {
    more.hidden = true;
    const last = Math.min(rendered + PAGE_BATCH, doc.numPages);
    const width = pagesBox.clientWidth || 800;
    for (let number = rendered + 1; number <= last && !closed; number += 1) {
      const page = await doc.getPage(number);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(width / base.width, 2);
      const viewport = page.getViewport({ scale: scale * (window.devicePixelRatio || 1) });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.className = 'ss-pdf-page';
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `Страница ${number} от ${doc.numPages}`);
      pagesBox.append(canvas);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      rendered = number;
      counter.textContent = `Показани ${rendered} от ${doc.numPages} стр.`;
    }
    more.hidden = closed || rendered >= doc.numPages;
  }
  more.querySelector('button').addEventListener('click', () => renderNextBatch());

  try {
    const [pdfjs, blob] = await Promise.all([loadPdfJs(), loadBlob()]);
    if (closed) return;
    doc = await pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
    if (closed) return;
    status.hidden = true;
    await renderNextBatch();
  } catch {
    if (closed) return;
    status.innerHTML = `
      <i class="bi bi-exclamation-triangle fs-2 text-danger" aria-hidden="true"></i>
      <p class="mt-2 mb-0">Прегледът не можа да бъде зареден. Опитай да изтеглиш файла.</p>`;
  }
}
