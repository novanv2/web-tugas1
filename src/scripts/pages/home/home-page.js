import storyModel from '../../models/story-model.js';
import storyView from '../../utils/story-view.js';
import storyPresenter from '../../presenters/story-presenter.js';

const homePage = {
  async render() {
    return `
      <section id="home" class="page-enter">
        <h2>Daftar Cerita</h2>
        <div id="storyContainer"></div>
        <div id="map" style="height: 400px;"></div>
      </section>
    `;
  },

  async afterRender() {  
    const section = document.getElementById('home');
    if (section) {
      requestAnimationFrame(() => {
        section.classList.add('page-enter-active');
      });
  
      setTimeout(() => {
        section.classList.remove('page-enter');
        section.classList.remove('page-enter-active');
      }, 600);
    }
  
    const container = document.getElementById('storyContainer');
    if (!container) {
      console.error('Elemen #storyContainer tidak ditemukan!');
      return;
    }
  
    const model = new storyModel('https://story-api.dicoding.dev/v1');
    const view = new storyView(container, 'map');
    const presenter = new storyPresenter(model, view);
  
    await presenter.loadStories();
  }
};

export default homePage;
