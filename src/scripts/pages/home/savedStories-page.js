import Database from '../data/database.js';

const savedStoriesPage = {
  async render() {
    return `
      <section class="saved-stories">
        <h2>Story yang Tersimpan</h2>
        <div id="savedStoryContainer"></div>
      </section>
    `;
  },

  async afterRender() {
    await this.renderSavedStories();
  },

  async renderSavedStories() {
    const container = document.getElementById('savedStoryContainer');
    const stories = await Database.getAllReports();

    if (!stories.length) {
      container.innerHTML = '<p>Tidak ada cerita yang tersimpan.</p>';
      return;
    }

    container.innerHTML = stories.map(story => `
      <div class="story-item" data-id="${story.id}">
        ${story.photo ? `<img src="${story.photo}" alt="Foto">` : ''}
        <h3>${story.description || '(Tidak ada deskripsi)'}</h3>
        <p>Lokasi: ${story.lat}, ${story.lon}</p>
        <small>Dibuat: ${new Date(story.createdAt).toLocaleString()}</small>
        <button class="delete-story-btn" data-id="${story.id}">Hapus</button>
      </div>
    `).join('');

    this.attachDeleteHandlers();
  },

  attachDeleteHandlers() {
    const buttons = document.querySelectorAll('.delete-story-btn');
    buttons.forEach(button => {
      button.addEventListener('click', async () => {
        const id = button.getAttribute('data-id');
        await Database.deleteReport(id);
        alert('Cerita berhasil dihapus dari database!');
        await this.renderSavedStories();
      });
    });
  }

};

export default savedStoriesPage;
