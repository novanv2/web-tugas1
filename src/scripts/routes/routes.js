import homePage from '../pages/home/home-page.js';
import addStoryPage from '../pages/home/addStory-page.js';
import loginPage from '../pages/home/login-page.js';
import registerPage from '../pages/home/register-page.js';
import savedStoriesPage from '../pages/home/savedStories-page.js';
import { isServiceWorkerAvailable } from '../utils/serviceWorker.js'
import { subscribe, unsubscribe, isCurrentPushSubscriptionAvailable } from '../utils/notificationHelper.js';

const routes = {
  '/': homePage,
  '/add-story': addStoryPage,
  '/login': loginPage,
  '/register': registerPage,
  '/saved': savedStoriesPage,
};

const Router = {
  currentPage: null, // Halaman aktif

  init() {
    this.loadPage = this.loadPage.bind(this);
    window.addEventListener('hashchange', this.loadPage);

    const logoutLink = document.getElementById('nav-logout');
    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopAllCameras(); // Stop kamera saat logout
        localStorage.removeItem('token');
        window.location.hash = '/login';
        this.updateNavbarAuthLinks();
      });
    }

    this.loadPage();
    this.updateNavbarAuthLinks();
  },

  async setupPushNotification() {
    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    const button = document.getElementById('subscribe-toggle-button');

    // Set label tombol
    button.textContent = isSubscribed ? 'Unsubscribe' : 'Subscribe';

    // Hindari event listener menumpuk
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    newButton.addEventListener('click', async () => {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }

      // Refresh tampilan dan status
      this.setupPushNotification();
    });
  },

  async loadPage() {
    const path = window.location.hash.slice(1) || '/';
    const token = localStorage.getItem('token');

    if (token && (path === '/login' || path === '/register')) {
      window.location.hash = '/';
      return;
    }

    if (!token && path !== '/login' && path !== '/register') {
      window.location.hash = '/login';
      return;
    }

    const page = routes[path];
    if (!page) return;

    const main = document.getElementById('content-main');

    // Destroy halaman sebelumnya jika punya
    if (this.currentPage && typeof this.currentPage.destroy === 'function') {
      this.currentPage.destroy();
    }

    // Stop semua kamera jika ada yang aktif
    this.stopAllCameras();

    this.currentPage = page;

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        main.innerHTML = await page.render();
        await page.afterRender();
        this.updateNavbarAuthLinks();
      });
    } else {
      main.innerHTML = await page.render();
      await page.afterRender();
      this.updateNavbarAuthLinks();
    }

    if (isServiceWorkerAvailable()) {
      this.setupPushNotification();
    }
  },

  stopAllCameras() {
    if (window.currentStreams) {
      window.currentStreams.forEach(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
      window.currentStreams = [];
    }
  },

  updateNavbarAuthLinks() {
    const token = localStorage.getItem('token');

    const homeLink = document.getElementById('nav-home');
    const loginLink = document.getElementById('nav-login');
    const addLink = document.getElementById('nav-add');
    const registerLink = document.getElementById('nav-register');
    const logoutLink = document.getElementById('nav-logout');
    const savedLink = document.getElementById('nav-saved');

    if (loginLink) loginLink.style.display = token ? 'none' : 'inline-block';
    if (registerLink) registerLink.style.display = token ? 'none' : 'inline-block';
    if (addLink) addLink.style.display = token ? 'inline-block' : 'none';
    if (homeLink) homeLink.style.display = token ? 'inline-block' : 'none';
    if (logoutLink) logoutLink.style.display = token ? 'inline-block' : 'none';
    if (savedLink) savedLink.style.display = token ? 'inline-block' : 'none';
  },
};

export default Router;
