class storyPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async loadStories() {
    try {
      const token = this.model.getToken();
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');
      }

      const stories = await this.model.fetchStories(token);

      const validStories = stories.filter(story => story.lat !== null && story.lon !== null);

      this.view.renderStories(validStories);
    } catch (error) {
      this.view.renderError(error.message || 'Gagal memuat cerita. Silakan coba lagi.');
    }
  }
}

export default storyPresenter;
