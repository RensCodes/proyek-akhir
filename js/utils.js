const Utils = {
  performViewTransition: (callback) => {
    if (!document.startViewTransition) {
      callback();
      return null;
    }
    return document.startViewTransition(callback);
  },

  showMessage: (title, message, isError = false) => {
    const modal = document.getElementById('messageModal');
    const modalTitle = document.getElementById('messageModalTitle');
    const modalText = document.getElementById('messageModalText');
    const modalCloseButton = document.getElementById('messageModalClose');

    if (!modal || !modalTitle || !modalText || !modalCloseButton) {
      console.error('Modal elements not found for Utils.showMessage!');
      alert(`${title}: ${message}`); 
      return;
    }

    modalTitle.textContent = title;
    modalTitle.className = `modal-title ${isError ? 'modal-title-error' : 'modal-title-success'}`;
    modalTitle.style.color = isError ? '#dc3545' : '#343a40';

    modalText.textContent = message;

    modal.classList.add('active');
    modalCloseButton.focus();

    const newButton = modalCloseButton.cloneNode(true);
    newButton.textContent = "Tutup";
    newButton.className = "btn btn-primary modal-close-btn"; 
    modalCloseButton.parentNode.replaceChild(newButton, modalCloseButton);
    newButton.addEventListener('click', () => modal.classList.remove('active'), { once: true });
  },

  showLoadingSpinner: (container, message = 'Memuat...') => {
    if (!container) return null;
    container.innerHTML = ''; 
    const spinnerContainer = Utils.createElement('div', { class: 'loading-indicator-container' });

    const spinner = Utils.createElement('div', { 
      class: 'spinner',
      'aria-label': 'Loading indicator',
      role: 'status'
    });

    const spinnerText = Utils.createElement('p', { class: 'loading-text' }, [message]);

    spinnerContainer.append(spinner, spinnerText);
    container.appendChild(spinnerContainer);
    return spinnerContainer;
  },

  hideLoadingSpinner: (container) => {
    if (!container) return;
    const spinnerContainer = container.querySelector('.loading-indicator-container');
    if (spinnerContainer) {
      spinnerContainer.remove();
    }
  },

  createElement: (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    for (const key in attributes) {
      element.setAttribute(key, attributes[key]);
    }
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });
    return element;
  },

  async base64ToFile(base64, filename, mimeType) {
    try {
      const res = await fetch(base64);
      const blob = await res.blob();
      return new File([blob], filename, { type: mimeType || blob.type });
    } catch (error) { 
      console.error("Error converting base64 to File:", error);
      throw new Error("Gagal memproses gambar.");
    }
  },

  formatDate(dateString) {
    if (!dateString) return 'Tanggal tidak diketahui';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch (e) {
      console.error(`Gagal memformat tanggal: "${dateString}"`, e); 
      return dateString; 
    }
  },

  renderStoryCard: (story) => {
    const imageSrc = story.photoUrl || (story.photoBase64 ? `data:image/jpeg;base64,${story.photoBase64}` : 'fallback.jpg');
    const date = Utils.formatDate(story.createdAt);
    const location = (story.lat && story.lon) ? `<p><strong>Lokasi:</strong> ${story.lat}, ${story.lon}</p>` : '';

    return `
      <div class="story-card animate-fade-in">
        <img src="${imageSrc}" alt="Foto cerita" loading="lazy" />
        <div class="story-card-body">
          <p class="story-desc">${story.description}</p>
          <p><strong>Tanggal:</strong> ${date}</p>
        </div>
      </div>
    `;
  }
};

export default Utils;
