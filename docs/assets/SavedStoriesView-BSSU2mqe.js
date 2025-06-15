import{U as s}from"./index-C5_RTWmi.js";const d={mainContent:null,presenter:null,setPresenter(t){this.presenter=t},renderLoading(){this.mainContent&&s.showLoadingSpinner(this.mainContent,"Memuat cerita tersimpan...")},renderSavedStories(t){if(!this.mainContent)return;s.hideLoadingSpinner(this.mainContent);let a="";!t||t.length===0?a='<p class="empty-stories-message">Tidak ada cerita yang tersimpan di database lokal (IndexedDB).</p>':t.forEach(e=>{const n=e.name||"Cerita Tanpa Judul",i=e.description||"Tidak ada deskripsi.",r=e.name||"Penulis Tidak Diketahui";a+=`
                    <article class="story-card saved-story-card">
                        <img src="${e.photoUrl}" alt="Foto untuk ${n}" 
                             class="story-card-image"
                             onerror="this.onerror=null;this.src='https://placehold.co/600x400/e0e0e0/757575?text=Gagal+Muat';">
                        <div class="story-card-content">
                            <h3 class="story-card-title">${n}</h3>
                            <p class="story-card-author"><i class="fas fa-user-circle"></i>${r}</p>
                            <p class="story-card-description">${i.substring(0,100)}${i.length>100?"...":""}</p>
                        </div>
                        <div class="story-card-footer">
                            <p class="story-card-date"><i class="fas fa-calendar-check"></i>Disimpan: ${s.formatDate(e.createdAt)}</p>
                            
                            <!-- TOMBOL HAPUS UNTUK SETIAP CERITA -->
                            <button class="btn btn-danger btn-sm btn-block delete-story-btn" data-story-id="${e.id}">
                                <i class="fas fa-trash-alt"></i> Hapus dari Database
                            </button>
                        </div>
                    </article>
                `}),this.mainContent.innerHTML=`
            <section class="page-section animate-fade-in">
                <div class="page-header">
                    <h1 class="page-title">Cerita Tersimpan</h1>
                    
                    <!-- TOMBOL HAPUS SEMUA CERITA -->
                    <button id="deleteAllStoriesBtn" class="btn btn-danger">
                        <i class="fas fa-exclamation-triangle"></i> Hapus Semua Data
                    </button>
                </div>
                <div class="story-card-grid">
                    ${a}
                </div>
            </section>
        `,this._addEventListeners()},renderError(t){this.mainContent&&(s.hideLoadingSpinner(this.mainContent),this.mainContent.innerHTML=`<div class="error-message-container"><p class="error-message">${t}</p></div>`)},_addEventListeners(){if(!this.mainContent||!this.presenter)return;this.mainContent.addEventListener("click",a=>{const e=a.target.closest(".delete-story-btn");if(e){const n=e.dataset.storyId;n&&confirm("Apakah Anda yakin ingin menghapus cerita ini?")&&this.presenter.handleDeleteStory(n)}});const t=document.getElementById("deleteAllStoriesBtn");t&&t.addEventListener("click",()=>{confirm("PERINGATAN: Tindakan ini akan menghapus SEMUA cerita yang tersimpan. Apakah Anda yakin?")&&this.presenter.handleDeleteAllStories()})},destroy(){this.mainContent&&(this.mainContent.innerHTML=""),console.log("SavedStoriesView dihancurkan.")}};export{d as default};
