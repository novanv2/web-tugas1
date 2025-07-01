import '../src/styles/styles.css';
import Router from '../src/scripts/routes/routes.js';
import { registerServiceWorker } from '../src/scripts/utils/serviceWorker.js'

document.addEventListener('DOMContentLoaded', async () => {
  await registerServiceWorker();
  Router.init();
});