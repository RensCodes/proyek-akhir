import { router } from './router.js';
import 'leaflet/dist/leaflet.css';

window.addEventListener('DOMContentLoaded', () => {
  router();
  window.addEventListener('hashchange', router);
});
