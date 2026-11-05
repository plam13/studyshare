/**
 * Renders the site footer into `container`.
 * @param {HTMLElement} container
 */
export function renderFooter(container) {
  const year = new Date().getFullYear();
  container.innerHTML = `
    <footer class="ss-footer py-3 mt-5">
      <div class="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-secondary">
        <span><i class="bi bi-mortarboard me-1"></i>StudyShare &copy; ${year}</span>
        <span>Споделяй знания — учи заедно.</span>
      </div>
    </footer>`;
}
