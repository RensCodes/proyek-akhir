import Config from '../config.js';

const MapService = {
    mapInstanceDisplay: null,
    mapInstancePicker: null,
    pickerMarker: null,

    initDisplayMap(containerIdOrElement, stories) {
        if (this.mapInstanceDisplay) {
            try { this.mapInstanceDisplay.remove(); } catch (e) { console.warn("Error removing previous display map:", e); }
            this.mapInstanceDisplay = null;
        }
        const mapContainer = (typeof containerIdOrElement === 'string') ? document.getElementById(containerIdOrElement) : containerIdOrElement;
        if (!mapContainer) {
            console.warn("Map display container not found for initDisplayMap.");
            return null;
        }
        mapContainer.innerHTML = '';

        let center = Config.DEFAULT_MAP_CENTER;
        let zoom = Config.DEFAULT_MAP_ZOOM;
        if (stories && stories.length > 0) {
            const validStories = stories.filter(s => s.lat && s.lon);
            if (validStories.length > 0) {
                center = [validStories[0].lat, validStories[0].lon];
                zoom = (validStories.length > 1) ? 6 : 10;
            }
        }
        
        this.mapInstanceDisplay = window.L.map(mapContainer).setView(center, zoom);
        const baseLayers = {};
        Object.entries(Config.TILE_LAYERS).forEach(([name, layerConfig]) => {
            baseLayers[name] = window.L.tileLayer(layerConfig.url, { attribution: layerConfig.attribution, maxZoom: 19 });
        });

        if (Object.keys(baseLayers).length > 0) {
            baseLayers[Object.keys(baseLayers)[0]].addTo(this.mapInstanceDisplay);
            if (Object.keys(baseLayers).length > 1) {
                window.L.control.layers(baseLayers, null, { collapsed: false }).addTo(this.mapInstanceDisplay);
            }
        }

        if (stories) {
            stories.forEach(story => {
                if (story.lat && story.lon) {
                    const marker = window.L.marker([story.lat, story.lon]).addTo(this.mapInstanceDisplay);
                    marker.bindPopup(`<b>${story.name || 'Cerita'}</b><br>${(story.description || '').substring(0,50)}...`);
                }
            });
        }
        return this.mapInstanceDisplay;
    },

    initPickerMap(containerIdOrElement, onLocationSelectCallback) {
        if (this.mapInstancePicker) {
             try { this.mapInstancePicker.remove(); } catch (e) { console.warn("Error removing previous picker map:", e); }
            this.mapInstancePicker = null;
            this.pickerMarker = null;
        }
        const mapContainer = (typeof containerIdOrElement === 'string') ? document.getElementById(containerIdOrElement) : containerIdOrElement;
        if (!mapContainer) {
            console.warn("Map picker container not found for initPickerMap.");
            return null;
        }
        mapContainer.innerHTML = '';

        this.mapInstancePicker = window.L.map(mapContainer).setView(Config.DEFAULT_MAP_CENTER, Config.DEFAULT_MAP_ZOOM);
        const baseLayers = {};
        Object.entries(Config.TILE_LAYERS).forEach(([name, layerConfig]) => {
            baseLayers[name] = window.L.tileLayer(layerConfig.url, { attribution: layerConfig.attribution, maxZoom: 19 });
        });
        
        if (Object.keys(baseLayers).length > 0) {
            baseLayers[Object.keys(baseLayers)[0]].addTo(this.mapInstancePicker);
            if (Object.keys(baseLayers).length > 1) {
                window.L.control.layers(baseLayers, null, { collapsed: true }).addTo(this.mapInstancePicker);
            }
        }

        this.mapInstancePicker.on('click', (e) => {
            const { lat, lng } = e.latlng;
            if (this.pickerMarker) {
                this.pickerMarker.setLatLng(e.latlng);
            } else {
                this.pickerMarker = window.L.marker(e.latlng).addTo(this.mapInstancePicker);
            }
            this.pickerMarker.bindPopup(`Lokasi dipilih: ${lat.toFixed(5)}, ${lng.toFixed(5)}`).openPopup();
            if (typeof onLocationSelectCallback === 'function') {
                onLocationSelectCallback(lat, lng);
            }
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    if (this.mapInstancePicker) {
                        this.mapInstancePicker.setView([latitude, longitude], 13);
                        if (this.pickerMarker) this.pickerMarker.setLatLng([latitude, longitude]);
                        else this.pickerMarker = window.L.marker([latitude, longitude]).addTo(this.mapInstancePicker);
                        this.pickerMarker.bindPopup(`Lokasi Anda saat ini. Klik peta untuk mengubah.`).openPopup();
                        if (typeof onLocationSelectCallback === 'function') onLocationSelectCallback(latitude, longitude);
                    }
                },
                () => { console.warn('Gagal mendapatkan geolokasi atau izin ditolak.'); }
            );
        }
        return this.mapInstancePicker;
    },

    panToLocation(lat, lon) {
        if (this.mapInstanceDisplay) {
            this.mapInstanceDisplay.setView([lat, lon], 15);
            this.mapInstanceDisplay.eachLayer(layer => {
                if (layer instanceof window.L.Marker) {
                    const markerLatLng = layer.getLatLng();
                    if (markerLatLng.lat === lat && markerLatLng.lng === lon) {
                        layer.openPopup();
                    }
                }
            });
        }
    },

    destroyPickerMap() {
        if (this.mapInstancePicker) {
            try { this.mapInstancePicker.remove(); } catch (e) { console.warn("Error destroying picker map:", e); }
            this.mapInstancePicker = null;
            this.pickerMarker = null;
        }
    },

    destroyDisplayMap() {
        if (this.mapInstanceDisplay) {
            try { this.mapInstanceDisplay.remove(); } catch (e) { console.warn("Error destroying display map:", e); }
            this.mapInstanceDisplay = null;
        }
    }
};

export default MapService;
