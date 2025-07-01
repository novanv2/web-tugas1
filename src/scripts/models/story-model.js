import Database from '../pages/data/database.js'; // pastikan path-nya sesuai

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

class storyModel {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this._lastAddedStory = null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getLastAddedStory() {
    return this._lastAddedStory;
  }

  async saveStoryToLocal(story) {
    try {
      if (!story.id) {
        throw new Error('Story tidak memiliki ID.');
      }

      await Database.putReport(story);
      return true;
    } catch (e) {
      console.error('Gagal menyimpan story ke local DB:', e);
      return false;
    }
  }

  async fetchStories(token) {
    try {
      const response = await fetch(`${this.baseUrl}/stories`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Gagal mengambil cerita. Status: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.listStory)) {
        throw new Error('Data yang diterima bukan array!');
      }

      return data.listStory;
    } catch (error) {
      console.error('Error saat mengambil cerita:', error);
      return [];
    }
  }

  async addStory(formData, token) {
    try {
      const response = await fetch(`${this.baseUrl}/stories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Gagal menambahkan cerita. Status: ${response.status}`);
      }

      // Convert photo blob to Base64
      const photoBlob = formData.get('photo');
      let base64Photo = null;

      if (photoBlob) {
        base64Photo = await blobToBase64(photoBlob);
      }

      // Simpan sementara data story untuk local save
      this._lastAddedStory = {
        id: `story-${Date.now()}`,
        description: formData.get('description'),
        lat: formData.get('lat'),
        lon: formData.get('lon'),
        photo: base64Photo,
        createdAt: new Date().toISOString(),
      };

      return result;
    } catch (error) {
      console.error('Error saat menambahkan cerita:', error);
      return { error: true, message: error.message };
    }
  }
}

export default storyModel;
