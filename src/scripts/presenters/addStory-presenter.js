class addStoryPresenter {
   constructor(view, model) {
    this.view = view;
    this.model = model;
  }

  async addStory(formData) {
    try {
      const token = this.model.getToken();
      if (!token) {
        throw new Error('Token tidak ditemukan, silakan login kembali');
      }

      const result = await this.model.addStory(formData, token);

      if (result.error) {
        this.view.showAddStoryError(result.message);
        return false;
      }

      this.view.showAddStorySuccess();
      return true;
    } catch (error) {
      this.view.showAddStoryError(error.message || 'Gagal menambahkan story');
      return false;
    }
  }

  async saveReport() {
  try {
    const story = this.model.getLastAddedStory();
    if (!story) {
      throw new Error('Tidak ada story yang bisa disimpan');
    }

    const saved = this.model.saveStoryToLocal(story);
    if (!saved) {
      throw new Error('Gagal menyimpan story ke lokal');
    }

    this.view.saveToBookmarkSuccessfully('Success tersimpan ke database');
  } catch (error) {
    console.error('saveReport: error:', error);
    this.view.saveToBookmarkFailed(error.message);
  }
}


}

export default addStoryPresenter;
