import{U as s}from"./index-B-odtj0z.js";const p={mainContent:null,presenter:null,setPresenter(e){this.presenter=e},renderLoading(){this.mainContent&&s.showLoadingSpinner(this.mainContent,"Memuat cerita tersimpan...")},renderSavedStories(e,a=!1){if(console.log("[SavedStoriesView] renderSavedStories dipanggil dengan",e.length,"cerita"),!this.mainContent)return;s.hideLoadingSpinner(this.mainContent),this.mainContent.innerHTML=`
      <section class="page-section animate-fade-in">
        <div class="page-header">
          <h1 class="page-title">Cerita Tersimpan</h1>
          <button id="deleteAllStoriesBtn" class="btn btn-danger">
            <i class="fas fa-exclamation-triangle"></i> Hapus Semua Data
          </button>
        </div>
        <div id="saved-story-container" class="story-card-grid"></div>
        <div id="loadMoreContainer" style="text-align: center; margin-top: 20px;"></div>
      </section>
    `;const n=document.getElementById("saved-story-container");if(!e||e.length===0)n.innerHTML='<p class="empty-stories-message">Tidak ada cerita yang tersimpan di database lokal.</p>';else{n.innerHTML="";for(const t of e){const o=t.name||"Cerita Tanpa Judul",d=t.description||"Tidak ada deskripsi.",c=t.name||"Anonim",m=t.photoBase64?`data:image/jpeg;base64,${t.photoBase64}`:t.photoUrl||"https://placehold.co/600x400/e0e0e0/757575?text=Gagal+Muat",i=document.createElement("article");i.className="story-card saved-story-card",i.innerHTML=`
          <img src="${m}" alt="Foto untuk ${o}" 
               class="story-card-image"
               onerror="this.onerror=null;this.src='https://placehold.co/600x400/e0e0e0/757575?text=Gagal+Muat';">
          <div class="story-card-content">
              <h3 class="story-card-title">${o}</h3>
              <p class="story-card-author"><i class="fas fa-user-circle"></i> ${c}</p>
              <p class="story-card-description">${d.substring(0,100)}${d.length>100?"...":""}</p>
          </div>
          <div class="story-card-footer">
              <p class="story-card-date"><i class="fas fa-calendar-check"></i> Disimpan: ${s.formatDate(t.createdAt)}</p>
              <button class="btn btn-danger btn-sm btn-block delete-story-btn" data-story-id="${t.id}">
                  <i class="fas fa-trash-alt"></i> Hapus dari Database
              </button>
          </div>
        `,n.appendChild(i)}}const l=document.getElementById("loadMoreContainer");l.innerHTML=a?'<button id="loadMoreBtn" class="btn btn-secondary">Lihat Lebih Banyak</button>':"";const r=document.getElementById("loadMoreBtn");r&&r.addEventListener("click",()=>{this.presenter.loadMore()}),this._addGlobalEventListeners(),this._addStoryDeleteListeners()},renderError(e){this.mainContent&&(s.hideLoadingSpinner(this.mainContent),this.mainContent.innerHTML=`<div class="error-message-container"><p class="error-message">${e}</p></div>`)},_addStoryDeleteListeners(){this.mainContent.querySelectorAll(".delete-story-btn").forEach(a=>{a.addEventListener("click",()=>{const n=a.dataset.storyId;n&&confirm("Apakah Anda yakin ingin menghapus cerita ini?")&&this.presenter.handleDeleteStory(n)})})},_addGlobalEventListeners(){const e=document.getElementById("deleteAllStoriesBtn");e&&e.addEventListener("click",()=>{confirm("PERINGATAN: Ini akan menghapus SEMUA cerita. Lanjutkan?")&&this.presenter.handleDeleteAllStories()})},destroy(){this.mainContent&&(this.mainContent.innerHTML=""),console.log("SavedStoriesView dihancurkan.")}};export{p as default};
