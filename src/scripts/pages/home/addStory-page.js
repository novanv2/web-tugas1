import addStoryPresenter from "../../presenters/addStory-presenter.js";
import storyModel from "../../models/story-model.js";
import { initMap, getSelectedLocation } from "../../utils/map.js";

const addStoryPage = {
  async render() {
    return `
      <section class="addStoryPageSection page-enter">
        <h2>Tambah Cerita Baru</h2>
        <form id="storyForm">
          <label for="description">Deskripsi:</label>
          <textarea id="description" required></textarea>

          <label>Ambil Gambar:</label>
          <video id="cameraPreview" autoplay style="display: none;"></video>
          <canvas id="canvas" style="display: none;"></canvas>
          <img id="photoPreview" alt="Pratinjau Foto" style="display: none; max-width: 100%;">

          <button type="button" id="startCamera">Buka Kamera</button>
          <button type="button" id="takePhoto" style="display: none;">Ambil Foto</button>
          <button type="button" id="stopCamera" style="display: none;">Matikan Kamera</button>

          <label for="image">Atau Pilih Gambar:</label>
          <input id="image" type="file" accept="image/*">

          <div id="map" style="height: 300px;"></div>
          <label for="latInput">Latitude:</label>
          <input id="latInput" type="text" readonly>

          <label for="lngInput">Longitude:</label>
          <input id="lngInput" type="text" readonly>

          <button type="submit">Kirim</button>
        </form>
        <button type="button" id="story-detail-save" class="save-story-btn">
          Simpan Story
        </button>
      </section>
    `;
  },

  async afterRender() {
    const model = new storyModel("https://story-api.dicoding.dev/v1");
    this.presenter = new addStoryPresenter(this, model);

    initMap();

    const section = document.querySelector(".addStoryPageSection");
    if (section) {
      requestAnimationFrame(() => {
        section.classList.add("page-enter-active");
      });
      setTimeout(() => {
        section.classList.remove("page-enter");
        section.classList.remove("page-enter-active");
      }, 600);
    }

    const video = document.getElementById("cameraPreview");
    const canvas = document.getElementById("canvas");
    const photoPreview = document.getElementById("photoPreview");
    const startCameraBtn = document.getElementById("startCamera");
    const takePhotoBtn = document.getElementById("takePhoto");
    const stopCameraBtn = document.getElementById("stopCamera");
    const imageInput = document.getElementById("image");

    let capturedImage = null;

    async function startCamera() {
      if (window.currentStreams && window.currentStreams.length > 0) {
        window.currentStreams.forEach((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        });
        window.currentStreams = [];
      } else {
        window.currentStreams = [];
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        video.srcObject = stream;
        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve();
        });

        video.play();
        video.style.display = "block";

        window.currentStreams.push(stream);

        takePhotoBtn.style.display = "block";
        stopCameraBtn.style.display = "block";
        startCameraBtn.style.display = "none";
        imageInput.style.display = "none";
      } catch (error) {
        console.error("Gagal mengakses kamera:", error);
        alert(
          "Tidak dapat mengakses kamera. Periksa izin atau gunakan browser lain."
        );
      }
    }

    function stopCamera() {
      if (window.currentStreams && window.currentStreams.length > 0) {
        window.currentStreams.forEach((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        });
        window.currentStreams = [];
      }

      video.style.display = "none";
      takePhotoBtn.style.display = "none";
      stopCameraBtn.style.display = "none";
      startCameraBtn.style.display = "block";
      imageInput.style.display = "block";
    }

    function takePhoto() {
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert("Kamera belum siap. Coba beberapa detik lagi.");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          alert("Gagal mengambil gambar. Coba lagi.");
          return;
        }

        capturedImage = blob;
        const imageUrl = URL.createObjectURL(blob);

        photoPreview.src = imageUrl;
        photoPreview.style.display = "block";
        photoPreview.classList.add("show");
      }, "image/png");

      stopCamera();
    }

    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        photoPreview.src = imageUrl;
        photoPreview.style.display = "block";
        capturedImage = file;
      }
    });

    document
      .getElementById("storyForm")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const location = getSelectedLocation();
        if (!location || !location.lat || !location.lng) {
          alert("Silakan pilih lokasi di peta terlebih dahulu.");
          return;
        }

        if (!capturedImage) {
          alert("Silakan ambil atau pilih gambar terlebih dahulu.");
          return;
        }

        const formData = new FormData();
        formData.append(
          "description",
          document.getElementById("description").value
        );
        formData.append("photo", capturedImage, "photo.png");
        formData.append("lat", location.lat);
        formData.append("lon", location.lng);

        const success = await this.presenter.addStory(formData);

        if (success) {
          document.getElementById('story-detail-save').disabled = false;
        }
      });

    document
      .getElementById("story-detail-save")
      .addEventListener("click", async () => {
        const description = document.getElementById("description").value;
        const location = getSelectedLocation();

        console.log('description:', description);
        console.log('capturedImage:', capturedImage);
        console.log('location:', location);

        if (
          !description ||
          !location?.lat ||
          !location?.lng ||
          !capturedImage
        ) {
          alert("Mohon lengkapi semua data terlebih dahulu");
          return;
        }

        const id = `story-${Date.now()}`;
        const reader = new FileReader();

        reader.onload = async () => {
          const imageBase64 = reader.result;
          const report = {
            id,
            description,
            lat: location.lat,
            lon: location.lng,
            photo: imageBase64,
            createdAt: new Date().toISOString(),
          };

          await addStoryPage.presenter.saveReport(report);
        };

        reader.readAsDataURL(capturedImage);
      });

    startCameraBtn.addEventListener("click", startCamera);
    takePhotoBtn.addEventListener("click", takePhoto);
    stopCameraBtn.addEventListener("click", stopCamera);

    const saveButton = document.getElementById("story-detail-save");
    console.log("Tombol simpan ditemukan?", !!saveButton);

    document.getElementById('story-detail-save').disabled = true;
  },

  destroy() {
    // Hentikan semua stream kamera
    if (window.currentStreams && Array.isArray(window.currentStreams)) {
      window.currentStreams.forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      window.currentStreams = [];
    }
  },

  showAddStorySuccess() {
    alert("Cerita berhasil ditambahkan!");
  },

  showAddStoryError(message) {
    alert(`Gagal menambahkan cerita: ${message}`);
    console.error("Error:", message);
  },

  saveToBookmarkSuccessfully(message) {
    alert(message);
  },

  saveToBookmarkFailed(message) {
    alert(`Gagal menyimpan story: ${message}`);
  },
};

export default addStoryPage;
