import Utils from '../utils.js';

const AddStoryView = {
    mainContent: null,
    presenter: null,
    formElement: null,
    descriptionEl: null,
    cameraPreviewEl: null,
    capturedImageCanvasEl: null,
    storyPhotoDataStatusEl: null, 
    photoFileInputEl: null,
    startCameraButtonEl: null,
    captureImageButtonEl: null,
    retakeImageButtonEl: null,
    mapPickerContainerEl: null,
    storyLatEl: null,
    storyLonEl: null,
    submitButtonEl: null,
    errorElement: null,

    setPresenter(presenter) {
        this.presenter = presenter;
    },

    _getAddStoryFormHTML() {
        return `
            <section id="add-story-page" class="page-section add-story-section animate-fade-in">
                <div class="form-card">
                    <h1 class="form-title">Buat Cerita Baru Anda</h1>
                    <form id="addStoryFormElement" class="story-form" novalidate>
                        <div class="form-group">
                            <label for="addStoryDescription" class="form-label">Deskripsi Cerita <span class="required-star">*</span></label>
                            <textarea id="addStoryDescription" name="description" rows="5" required class="form-control" placeholder="Ceritakan pengalaman menarik Anda secara detail..."></textarea>
                        </div>

                        <fieldset class="form-fieldset">
                            <legend class="fieldset-legend"><i class="fas fa-camera-retro"></i>Foto Cerita <span class="required-star">*</span></legend>
                            <div id="addStoryCameraPreviewContainer" class="camera-preview-container">
                                <video id="addStoryCameraPreview" autoplay playsinline muted class="camera-video-preview" aria-label="Pratinjau kamera"></video>
                                <canvas id="addStoryCapturedImageCanvas" class="camera-canvas-preview hidden" aria-label="Gambar yang diambil"></canvas>
                            </div>
                            <div class="camera-controls">
                                <button type="button" id="addStoryStartCameraButton" class="btn btn-secondary btn-camera"><i class="fas fa-video"></i>Mulai Kamera</button>
                                <button type="button" id="addStoryCaptureImageButton" class="btn btn-primary btn-camera" disabled><i class="fas fa-camera"></i>Ambil Gambar</button>
                                <button type="button" id="addStoryRetakeImageButton" class="btn btn-danger btn-camera hidden"><i class="fas fa-sync-alt"></i>Ambil Ulang</button>
                            </div>
                            <p class="file-input-fallback-text">Atau <label for="storyPhotoFileInput" class="file-input-label">pilih file dari galeri</label>.</p>
                            <input type="file" id="storyPhotoFileInput" class="file-input-hidden" accept="image/png, image/jpeg, image/gif">
                            <input type="hidden" id="addStoryPhotoDataStatus" name="photoDataStatus" required>
                        </fieldset>

                        <fieldset class="form-fieldset">
                            <legend class="fieldset-legend"><i class="fas fa-map-pin"></i>Tandai Lokasi di Peta (Opsional)</legend>
                            <div id="addStoryMapPickerContainer" class="map-picker-container" aria-label="Peta interaktif untuk memilih lokasi cerita"></div>
                            <p class="map-picker-help-text">Klik pada peta untuk memilih lokasi. Biarkan kosong jika tidak ingin menyertakan lokasi.</p>
                            <div class="location-inputs-grid">
                                <div class="form-group">
                                    <label for="addStoryLat" class="form-label">Latitude</label>
                                    <input type="text" id="addStoryLat" name="lat" readonly class="form-control form-control-readonly">
                                </div>
                                <div class="form-group">
                                    <label for="addStoryLon" class="form-label">Longitude</label>
                                    <input type="text" id="addStoryLon" name="lon" readonly class="form-control form-control-readonly">
                                </div>
                            </div>
                        </fieldset>
                        
                        <div id="addStoryError" class="form-error-message hidden"></div>

                        <div class="form-submit-group">
                            <button type="submit" id="addStorySubmitButton" class="btn btn-success btn-block btn-lg">
                                <span class="submit-text"><i class="fas fa-cloud-upload-alt"></i>Publikasikan Cerita</span>
                                <span class="loading-indicator hidden"><div class="spinner-inline"></div></span>
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        `;
    },

    renderAddStoryForm() {
        if (!this.mainContent) {
             console.error("AddStoryView: mainContent element not found.");
             return;
        }
        console.log("AddStoryView: Merender form tambah cerita...");
        this.mainContent.innerHTML = this._getAddStoryFormHTML();
        this._cacheDOMElements();
        this._addEventListeners();
        
        if (this.presenter && typeof this.presenter.initializeExternalServices === 'function') {
            console.log("AddStoryView: Memanggil presenter.initializeExternalServices");
            this.presenter.initializeExternalServices(
                this.cameraPreviewEl, 
                this.capturedImageCanvasEl,
                this.mapPickerContainerEl.id
            );
        } else {
            console.error("AddStoryView: Presenter atau initializeExternalServices tidak tersedia.");
        }
    },

    _cacheDOMElements() {
        console.log("AddStoryView: Caching DOM elements...");
        this.formElement = document.getElementById('addStoryFormElement');
        this.descriptionEl = document.getElementById('addStoryDescription');
        this.cameraPreviewEl = document.getElementById('addStoryCameraPreview');
        this.capturedImageCanvasEl = document.getElementById('addStoryCapturedImageCanvas');
        this.storyPhotoDataStatusEl = document.getElementById('addStoryPhotoDataStatus');
        this.photoFileInputEl = document.getElementById('storyPhotoFileInput');
        this.startCameraButtonEl = document.getElementById('addStoryStartCameraButton');
        this.captureImageButtonEl = document.getElementById('addStoryCaptureImageButton');
        this.retakeImageButtonEl = document.getElementById('addStoryRetakeImageButton');
        this.mapPickerContainerEl = document.getElementById('addStoryMapPickerContainer');
        this.storyLatEl = document.getElementById('addStoryLat');
        this.storyLonEl = document.getElementById('addStoryLon');
        this.submitButtonEl = document.getElementById('addStorySubmitButton');
        this.errorElement = document.getElementById('addStoryError');
        console.log("AddStoryView: DOM elements cached", { form: this.formElement, cameraPreview: this.cameraPreviewEl, capturedCanvas: this.capturedImageCanvasEl });
    },

    _addEventListeners() {
        if (!this.formElement || !this.presenter) {
            console.error("AddStoryView: Form atau Presenter tidak tersedia untuk menambahkan event listeners.");
            return;
        }
        console.log("AddStoryView: Menambahkan event listeners...");

        this.formElement.addEventListener('submit', (event) => {
            event.preventDefault();
            const description = this.descriptionEl.value;
            this.presenter.handleSubmitStory(description);
        });

        if(this.startCameraButtonEl) this.startCameraButtonEl.addEventListener('click', () => this.presenter.handleStartCamera());
        if(this.captureImageButtonEl) this.captureImageButtonEl.addEventListener('click', () => this.presenter.handleCaptureImage());
        if(this.retakeImageButtonEl) this.retakeImageButtonEl.addEventListener('click', () => this.presenter.handleRetakeImage());
        
        if(this.photoFileInputEl) {
            this.photoFileInputEl.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file && typeof this.presenter.handleFileSelected === 'function') {
                    this.presenter.handleFileSelected(file);
                }
            });
        }
    },

    showCameraPreview() { 
        console.log("AddStoryView: showCameraPreview dipanggil");
        if(this.cameraPreviewEl) {
            this.cameraPreviewEl.style.display = 'block';
            console.log("AddStoryView: Video preview set to display: block");
        } else {
            console.error("AddStoryView: cameraPreviewEl tidak ditemukan di showCameraPreview");
        }
        if(this.capturedImageCanvasEl) {
            this.capturedImageCanvasEl.style.display = 'none';
            this.capturedImageCanvasEl.classList.add('hidden'); 
            console.log("AddStoryView: Canvas set to display: none and class 'hidden' added");
        } else {
            console.error("AddStoryView: capturedImageCanvasEl tidak ditemukan di showCameraPreview");
        }
    },
    showCapturedImage(base64ImageData) {
        console.log("AddStoryView: showCapturedImage dipanggil dengan data (awal):", base64ImageData ? base64ImageData.substring(0,50) + "..." : "null");
        if (!base64ImageData) {
            console.error("AddStoryView: base64ImageData null atau undefined di showCapturedImage.");
            Utils.showMessage("Error Pratinjau", "Tidak ada data gambar untuk ditampilkan.", true);
            return;
        }

        if(this.cameraPreviewEl) {
            this.cameraPreviewEl.style.display = 'none';
            console.log("AddStoryView: Video preview set to display: none");
        } else {
            console.error("AddStoryView: cameraPreviewEl tidak ditemukan di showCapturedImage");
        }

        if(this.capturedImageCanvasEl) {
            this.capturedImageCanvasEl.classList.remove('hidden'); 
            this.capturedImageCanvasEl.style.display = 'block'; 
            console.log("AddStoryView: Canvas style.display diatur ke 'block' dan kelas 'hidden' dihapus. Canvas element:", this.capturedImageCanvasEl);
            
            const ctx = this.capturedImageCanvasEl.getContext('2d');
            if (!ctx) {
                console.error("AddStoryView: Gagal mendapatkan context 2D dari canvas.");
                Utils.showMessage("Error Canvas", "Tidak dapat menyiapkan area pratinjau gambar.", true);
                return;
            }
            const img = new Image();
            img.onload = () => {
                console.log("AddStoryView: Gambar (dari base64) berhasil dimuat ke objek Image.", {width: img.width, height: img.height});
                
                if (img.width === 0 || img.height === 0) {
                    console.error("AddStoryView: Dimensi gambar yang dimuat adalah 0. Tidak bisa menggambar.");
                    Utils.showMessage("Error Gambar", "Data gambar tidak valid atau corrupt.", true);
                    this.capturedImageCanvasEl.style.display = 'none';
                    this.capturedImageCanvasEl.classList.add('hidden');
                    return;
                }

                const container = this.capturedImageCanvasEl.parentElement || this.capturedImageCanvasEl; 
                let targetWidth = container.clientWidth;
                
                if (!targetWidth && this.cameraPreviewEl && this.cameraPreviewEl.parentElement) {
                     targetWidth = this.cameraPreviewEl.parentElement.clientWidth;
                }
                if (!targetWidth) { 
                    targetWidth = 320; 
                    console.warn("AddStoryView: clientWidth container adalah 0, menggunakan default width 320px untuk canvas.");
                }


                const aspectRatio = img.width / img.height;
                this.capturedImageCanvasEl.width = targetWidth;
                this.capturedImageCanvasEl.height = targetWidth / aspectRatio;
                
                console.log("AddStoryView: Menggambar ke canvas. Dimensi Canvas diatur ke:", this.capturedImageCanvasEl.width, "x", this.capturedImageCanvasEl.height);
                ctx.clearRect(0, 0, this.capturedImageCanvasEl.width, this.capturedImageCanvasEl.height);
                ctx.drawImage(img, 0, 0, this.capturedImageCanvasEl.width, this.capturedImageCanvasEl.height);
                console.log("AddStoryView: Gambar seharusnya sudah digambar ke canvas.");
            };
            img.onerror = (errEvent) => {
                console.error("AddStoryView: Error saat memuat base64 ke objek Image:", errEvent);
                Utils.showMessage("Error Gambar", "Gagal memuat pratinjau gambar. Pastikan format gambar didukung.", true);
                this.capturedImageCanvasEl.style.display = 'none'; 
                this.capturedImageCanvasEl.classList.add('hidden');
            };
            img.src = base64ImageData;
        } else {
            console.error("AddStoryView: Elemen canvas tidak ditemukan untuk showCapturedImage.");
        }
    },
    setStoryPhotoDataStatus(hasImage) { 
        console.log("AddStoryView: setStoryPhotoDataStatus dipanggil, hasImage:", hasImage);
        if(this.storyPhotoDataStatusEl) this.storyPhotoDataStatusEl.value = hasImage ? "image_present" : ""; 
    },
    toggleCameraButtons(state) { 
        console.log("AddStoryView: toggleCameraButtons dipanggil dengan state:", state);
        if(this.startCameraButtonEl) this.startCameraButtonEl.classList.toggle('hidden', state === 'capturing' || state === 'captured' || state === 'file_selected');
        if(this.captureImageButtonEl) {
            this.captureImageButtonEl.classList.toggle('hidden', state !== 'capturing');
            this.captureImageButtonEl.disabled = state !== 'capturing';
        }
        if(this.retakeImageButtonEl) this.retakeImageButtonEl.classList.toggle('hidden', state !== 'captured' && state !== 'file_selected');
    },

    updateLocationInputs(lat, lon) {
        if(this.storyLatEl) this.storyLatEl.value = lat !== null && lat !== undefined ? lat.toFixed(7) : '';
        if(this.storyLonEl) this.storyLonEl.value = lon !== null && lon !== undefined ? lon.toFixed(7) : '';
    },
    
    showLoading() { 
        if(this.submitButtonEl) {
            this.submitButtonEl.disabled = true;
            const submitTextEl = this.submitButtonEl.querySelector('.submit-text');
            const loadingIndicatorEl = this.submitButtonEl.querySelector('.loading-indicator');
            if(submitTextEl) submitTextEl.style.display = 'none';
            if(loadingIndicatorEl) loadingIndicatorEl.classList.remove('hidden');
        }
    },
    hideLoading() { 
        if(this.submitButtonEl) {
            this.submitButtonEl.disabled = false;
            const submitTextEl = this.submitButtonEl.querySelector('.submit-text');
            const loadingIndicatorEl = this.submitButtonEl.querySelector('.loading-indicator');
            if(submitTextEl) submitTextEl.style.display = 'inline-block';
            if(loadingIndicatorEl) loadingIndicatorEl.classList.add('hidden');
        }
    },
    displayError(message) {
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.classList.remove('hidden');
        } else {
             Utils.showMessage('Error', message, true);
        }
    },
    clearError() { 
        if (this.errorElement) {
            this.errorElement.textContent = '';
            this.errorElement.classList.add('hidden');
        }
    },
    clearForm() {
        if (this.formElement) this.formElement.reset();
        if (this.cameraPreviewEl) this.cameraPreviewEl.style.display = 'block';
        if (this.capturedImageCanvasEl) {
            this.capturedImageCanvasEl.style.display = 'none';
            this.capturedImageCanvasEl.classList.add('hidden'); 
            const ctx = this.capturedImageCanvasEl.getContext('2d');
            if (this.capturedImageCanvasEl.width > 0 && this.capturedImageCanvasEl.height > 0) {
                ctx.clearRect(0, 0, this.capturedImageCanvasEl.width, this.capturedImageCanvasEl.height);
            }
        }
        if (this.storyPhotoDataStatusEl) this.storyPhotoDataStatusEl.value = '';
        this.updateLocationInputs(null, null);
        this.toggleCameraButtons('initial');
        this.clearError();
        if (this.presenter && typeof this.presenter.resetMapPicker === 'function') {
            this.presenter.resetMapPicker();
        }
    },

    destroy() {
        if (this.mainContent) this.mainContent.innerHTML = '';
        console.log("AddStoryView dihancurkan.");
    }
};

export default AddStoryView;
