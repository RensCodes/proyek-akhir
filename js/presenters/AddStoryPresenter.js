function createAddStoryPresenter(storyModel, addStoryView, router, mapService, cameraService, utilsService) {
    const presenter = {
        _storyModel: storyModel,
        _addStoryView: addStoryView,
        _router: router,
        _mapService: mapService,
        _cameraService: cameraService,
        _utils: utilsService,

        _capturedImageData: null, 
        _selectedLat: null,
        _selectedLon: null,
        _isCameraActive: false,

        showAddStoryForm() {
            this._addStoryView.clearForm();
            this._addStoryView.renderAddStoryForm();
        },
        
        initializeExternalServices(cameraPreviewEl, capturedImageCanvasEl, mapPickerContainerId) {
            this._cameraService.setElements(cameraPreviewEl, capturedImageCanvasEl);
            this._mapService.initPickerMap(mapPickerContainerId, (lat, lon) => {
                this._selectedLat = lat;
                this._selectedLon = lon;
                this._addStoryView.updateLocationInputs(lat, lon);
            });
        },

        async handleStartCamera() {
            this._addStoryView.clearError();
            const stream = await this._cameraService.startCamera();
            if (stream) {
                this._isCameraActive = true;
                this._addStoryView.toggleCameraButtons('capturing');
                this._addStoryView.showCameraPreview();
            } else {
                this._addStoryView.displayError("Gagal memulai kamera. Pastikan izin telah diberikan.");
            }
        },

        handleCaptureImage() {
            this._addStoryView.clearError();
            if (!this._isCameraActive) {
                this._addStoryView.displayError("Kamera belum aktif. Klik 'Mulai Kamera' dahulu.");
                return;
            }
            const base64ImageData = this._cameraService.captureImage();
            if (base64ImageData) {
                this._capturedImageData = base64ImageData;
                this._addStoryView.setStoryPhotoDataStatus(true);
                this._addStoryView.toggleCameraButtons('captured');
                this._addStoryView.showCapturedImage(base64ImageData); 
                this._isCameraActive = false;
            } else {
                this._addStoryView.displayError("Gagal mengambil gambar dari kamera.");
                 this._addStoryView.toggleCameraButtons('initial');
            }
        },

        handleRetakeImage() {
            this._addStoryView.clearError();
            this._cameraService.stopCamera();
            this._capturedImageData = null;
            this._addStoryView.setStoryPhotoDataStatus(false);
            this._addStoryView.toggleCameraButtons('initial');
            this._addStoryView.showCameraPreview();
            this._isCameraActive = false;
        },
        
        async handleFileSelected(file) {
            this._addStoryView.clearError();
            if (file && file.type.startsWith('image/')) {
                this._cameraService.stopCamera(); 
                this._isCameraActive = false;
                try {
                    const base64 = await this._convertFileToBase64(file);
                    this._capturedImageData = base64;
                    this._addStoryView.setStoryPhotoDataStatus(true);
                    this._addStoryView.toggleCameraButtons('file_selected');
                    this._addStoryView.showCapturedImage(base64);
                } catch (error) {
                    console.error("Error converting file to base64:", error);
                    this._addStoryView.displayError("Gagal memproses file gambar.");
                    this._capturedImageData = null;
                    this._addStoryView.setStoryPhotoDataStatus(false);
                    this._addStoryView.toggleCameraButtons('initial');
                }
            } else if (file) {
                this._addStoryView.displayError("Format file tidak didukung. Harap pilih file gambar (PNG, JPG, GIF).");
            }
        },

        _convertFileToBase64(file) { 
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        },

        async handleSubmitStory(description) {
            this._addStoryView.clearError();
            if (!description.trim()) {
                this._addStoryView.displayError("Deskripsi cerita tidak boleh kosong.");
                return;
            }
            if (!this._capturedImageData) {
                this._addStoryView.displayError("Foto cerita wajib diunggah atau diambil.");
                return;
            }
            
            let photoFile;
            try {
                if (typeof this._capturedImageData === 'string' && this._capturedImageData.startsWith('data:image')) {
                    const filename = `story-${Date.now()}.jpg`;
                    const mimeType = this._capturedImageData.substring(this._capturedImageData.indexOf(":") + 1, this._capturedImageData.indexOf(";"));
                    photoFile = await this._utils.base64ToFile(this._capturedImageData, filename, mimeType);
                } else {
                    this._addStoryView.displayError("Data gambar tidak valid untuk diunggah.");
                    return;
                }
            } catch (error) {
                console.error("Error converting base64 to file:", error);
                this._addStoryView.displayError("Gagal memproses data gambar.");
                return;
            }

            this._addStoryView.showLoading();
            try {
                const lat = this._selectedLat !== null ? parseFloat(this._selectedLat) : null;
                const lon = this._selectedLon !== null ? parseFloat(this._selectedLon) : null;

                await this._storyModel.addNewStory(description, photoFile, lat, lon);
                this._addStoryView.hideLoading();
                this._utils.showMessage('Sukses', 'Cerita baru berhasil dipublikasikan!');
                this._router.navigateTo('home');
            } catch (error) {
                this._addStoryView.hideLoading();
                this._addStoryView.displayError(error.message || "Gagal mempublikasikan cerita. Coba lagi.");
                console.error("AddStoryPresenter.handleSubmitStory error:", error);
            }
        },
        
        resetMapPicker() { 
            if (this._mapService && typeof this._mapService.destroyPickerMap === 'function') {
                this._mapService.destroyPickerMap(); 
            }
        },

        destroy() {
            if (this._addStoryView && typeof this._addStoryView.destroy === 'function') {
                this._addStoryView.destroy();
            }
            this._cameraService.stopCamera();
            this._mapService.destroyPickerMap();
            this._capturedImageData = null;
            this._selectedLat = null;
            this._selectedLon = null;
            this._storyModel = null;
            this._addStoryView = null;
            this._router = null;
            this._mapService = null;
            this._cameraService = null;
            this._utils = null;
            console.log("AddStoryPresenter instance (dari factory) dihancurkan.");
        }
    };
    addStoryView.setPresenter(presenter);
    return presenter;
}

export default createAddStoryPresenter;
