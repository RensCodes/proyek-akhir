import Utils from '../utils.js';

const CameraService = {
    videoStream: null,
    videoElement: null,
    canvasElement: null,

    setElements(videoElement, canvasElement) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        console.log("CameraService: Elements set", { videoElement, canvasElement });
    },

    async startCamera() {
        if (!this.videoElement || !this.canvasElement) {
            Utils.showMessage('Error Kamera', 'Elemen video atau canvas belum di-set untuk CameraService.', true);
            console.error("CameraService: Video atau Canvas element belum di-set.");
            return null;
        }
        console.log("CameraService: Memulai kamera...");
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                this.stopCamera();
                this.videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                this.videoElement.srcObject = this.videoStream;
                await new Promise((resolve, reject) => { 
                    const videoLoadTimeout = setTimeout(() => {
                        console.warn("CameraService: Timeout saat menunggu metadata video.");
                        reject(new Error("Timeout saat menunggu metadata video."));
                    }, 5000); 

                    this.videoElement.onloadedmetadata = () => {
                        clearTimeout(videoLoadTimeout);
                        console.log("CameraService: Video metadata loaded.", this.videoElement.videoWidth, this.videoElement.videoHeight);
                        if (this.videoElement.videoWidth === 0 || this.videoElement.videoHeight === 0) {
                            console.warn("CameraService: Metadata video dimuat tetapi dimensi masih 0.");
                        }
                        resolve();
                    };
                    this.videoElement.onerror = (e) => { 
                        clearTimeout(videoLoadTimeout);
                        console.error("CameraService: Error pada elemen video saat memuat metadata.", e);
                        reject(new Error("Error pada elemen video."));
                    }
                });
                this.videoElement.style.display = 'block';
                this.canvasElement.style.display = 'none';
                console.log("CameraService: Kamera berhasil dimulai.");
                return this.videoStream;
            } catch (err) {
                console.error("CameraService: Error mengakses kamera: ", err);
                let message = `Tidak dapat mengakses kamera: ${err.message}.`;
                if (err.name === "NotAllowedError") message = 'Anda menolak izin kamera.';
                else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") message = 'Kamera tidak ditemukan.';
                else if (err.name === "NotReadableError") message = 'Kamera sedang digunakan aplikasi lain.';
                Utils.showMessage('Error Kamera', message, true);
                return null;
            }
        } else {
            Utils.showMessage('Error Kamera', 'Fitur kamera tidak didukung browser ini.', true);
            console.error("CameraService: getUserMedia tidak didukung.");
            return null;
        }
    },

    captureImage() {
        console.log("CameraService: Mencoba mengambil gambar...");
        if (!this.videoStream || !this.videoElement || !this.canvasElement) {
            Utils.showMessage('Error Kamera', 'Kamera belum diinisialisasi atau stream tidak aktif.', true);
            console.error("CameraService: Stream, video, atau canvas tidak tersedia untuk captureImage.");
            return null;
        }
        if (this.videoElement.readyState < this.videoElement.HAVE_METADATA || this.videoElement.videoWidth === 0 || this.videoElement.videoHeight === 0) {
            Utils.showMessage('Error Kamera', 'Dimensi video tidak valid atau video belum siap. Coba mulai ulang kamera.', true);
            console.error("CameraService: Dimensi video 0 atau video belum siap.", {
                width: this.videoElement.videoWidth,
                height: this.videoElement.videoHeight,
                readyState: this.videoElement.readyState
            });
            return null;
        }

        console.log("CameraService: Menggambar video ke canvas. Dimensi Video:", this.videoElement.videoWidth, "x", this.videoElement.videoHeight);
        this.canvasElement.width = this.videoElement.videoWidth;
        this.canvasElement.height = this.videoElement.videoHeight;
        const context = this.canvasElement.getContext('2d');
        if (!context) {
            Utils.showMessage('Error Canvas', 'Tidak bisa mendapatkan konteks 2D dari canvas.', true);
            console.error("CameraService: Gagal mendapatkan konteks 2D dari canvas.");
            return null;
        }
        try {
            context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
        } catch (drawError) {
            Utils.showMessage('Error Menggambar', 'Gagal menggambar video ke canvas.', true);
            console.error("CameraService: Error saat drawImage:", drawError);
            return null;
        }
        
        let imageDataUrl = null;
        try {
            imageDataUrl = this.canvasElement.toDataURL('image/jpeg', 0.8); 
            console.log("CameraService: Gambar berhasil diambil. Data URL (awal):", imageDataUrl ? imageDataUrl.substring(0, 50) + "..." : "null");
        } catch (toDataURLError) {
            Utils.showMessage('Error Konversi Gambar', 'Gagal mengonversi gambar ke format data URL.', true);
            console.error("CameraService: Error saat toDataURL:", toDataURLError);
            return null;
        }
        
        this.stopCamera(); 
        
        return imageDataUrl;
    },

    stopCamera() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => {
                track.stop();
                console.log(`CameraService: Track ${track.kind} dihentikan.`);
            });
            this.videoStream = null;
            if (this.videoElement && this.videoElement.srcObject) {
                this.videoElement.srcObject = null; 
            }
            console.log("CameraService: Stream kamera dihentikan sepenuhnya.");
        }
    }
};

export default CameraService;
