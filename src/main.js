// App entry point: global CSS/JS, shared layout, auth state and the client-side router.
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import '@fontsource-variable/inter'; // self-hosted fonts with Cyrillic subsets
import '@fontsource-variable/jetbrains-mono';
import 'bootstrap'; // ESM build (registers data-api); same instance used by utils/toast.js
import './styles.css';

import { createHeader } from './components/header/header.js';
import { renderFooter } from './components/footer/footer.js';
import { initAuth, logout, onUserChange } from './services/auth.js';
import { navigate, refresh, startRouter } from './router.js';
import { showError } from './utils/toast.js';

const header = createHeader(document.getElementById('app-header'), {
  onLogout: async () => {
    try {
      await logout(); // the user-change listener below sends the visitor to "/"
    } catch (error) {
      showError(error.message);
    }
  },
});
renderFooter(document.getElementById('app-footer'));

// Wait for the session to be restored before deciding route access.
const user = await initAuth();
header.render(user);

onUserChange((changedUser) => {
  header.render(changedUser);
  if (!changedUser) navigate('/'); // logged out (here or in another tab) → home page
  else refresh(); // logged in / role changed → re-evaluate access and re-render
});

startRouter({
  outlet: document.getElementById('app'),
  onChange: () => header.setActive(window.location.pathname),
});
