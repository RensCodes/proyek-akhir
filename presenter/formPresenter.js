import { postStory } from '../api.js';
import { renderForm } from '../view/formView.js';

export const initFormPresenter = () => {
    renderForm(async (e) => {
      e.preventDefault();
  
      const nameEl = document.getElementById('name');
      const descriptionEl = document.getElementById('description');
      const latEl = document.getElementById('lat');
      const lonEl = document.getElementById('lon');
      const photoEl = document.getElementById('photo');
  
      if (!nameEl || !descriptionEl || !latEl || !lonEl || !photoEl) {
        alert('Form input tidak lengkap!');
        return;
      }
  
      const name = nameEl.value.trim();
      const description = descriptionEl.value.trim();
      const lat = latEl.value.trim();
      const lon = lonEl.value.trim();
      const photoFile = photoEl.files[0];
  
      if (!name || !description || !lat || !lon || !photoFile) {
        alert('Semua field wajib diisi dan upload foto!');
        return;
      }
  
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('lat', lat);
      formData.append('lon', lon);
      formData.append('photo', photoFile);
  
      const token = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
  
      try {
        await postStory(formData, token);
        alert('Cerita berhasil dikirim!');
        location.hash = '#/';
      } catch (error) {
        console.error(error);
        alert('Gagal mengirim cerita.');
      }
    });
  };
  
