import{U as o}from"./index-B-odtj0z.js";const u={mainContent:null,presenter:null,_mapContainerId:"home-map-display-container",setPresenter(e){this.presenter=e},renderLoading(){if(!this.mainContent){console.error("HomeView: mainContent element not found.");return}o.showLoadingSpinner(this.mainContent,"Memuat cerita Anda...")},renderStories(e,n){var r,c;if(!this.mainContent){console.error("HomeView: mainContent element not found.");return}o.hideLoadingSpinner(this.mainContent);let a="";!e||e.length===0?a='<p class="empty-stories-message">Belum ada cerita untuk ditampilkan. <a href="#add-story" class="add-story-link-inline">Buat cerita pertama Anda!</a></p>':e.forEach(t=>{const d=t.name||"Cerita Tanpa Judul",l=t.description||"Tidak ada deskripsi.",p=t.name||"Penulis Tidak Diketahui",m=t.photoUrl||"https://placehold.co/600x400/e0e0e0/757575?text=Gambar+tidak+tersedia";a+=`
          <article class="story-card">
            <img 
              src="${m}" 
              alt="Foto untuk ${d}" 
              class="story-card-image" 
              data-story-id="${t.id}">
            <div class="story-card-content">
              <h3 class="story-card-title" data-story-id="${t.id}">${d}</h3>
              <p class="story-card-author">
                <i class="fas fa-user-circle"></i>${p}
              </p>
              <p class="story-card-description">
                ${l.substring(0,100)}${l.length>100?"...":""}
              </p>
            </div>
            <div class="story-card-footer">
              <p class="story-card-date">
                <i class="fas fa-calendar-check"></i>
                ${o.formatDate(t.createdAt)}
              </p>
              ${t.lat&&t.lon?`
                <button class="btn btn-secondary btn-sm btn-block view-on-map-btn" 
                        data-lat="${t.lat}" data-lon="${t.lon}" data-title="${d}">
                  <i class="fas fa-map-marked-alt"></i>Lihat di Peta
                </button>
              `:'<p class="no-location-text">Lokasi tidak tersedia</p>'}
            </div>
          </article>
        `});const i=`
      <section id="home-map-section" class="map-section-home">
        <h2 class="section-title">Peta Sebaran Cerita</h2>
        <div id="${this._mapContainerId}" class="map-display-container"></div>
      </section>
    `;this.mainContent.innerHTML=`
      <section class="page-section animate-fade-in">
        <div class="page-header">
          <h1 class="page-title">Selamat Datang, ${n||"Pengguna"}!</h1>
          <a href="#add-story" id="navigateToAddStoryBtn" class="btn btn-success">
            <i class="fas fa-plus"></i>Buat Cerita Baru
          </a>
        </div>
        <div class="story-card-grid">
          ${a}
        </div>
        ${e&&e.filter(t=>t.lat&&t.lon).length>0?i:""}
      </section>
    `;const s=e.filter(t=>t.lat&&t.lon);if(s.length>0&&((c=(r=this.presenter)==null?void 0:r._mapService)!=null&&c.initDisplayMap)){const t=this.getMapContainerId();this.presenter._mapService.initDisplayMap(t,s)}this._addEventListeners()},renderError(e){this.mainContent&&(o.hideLoadingSpinner(this.mainContent),this.mainContent.innerHTML=`<div class="error-message-container"><p class="error-message">${e}</p></div>`)},_addEventListeners(){if(!this.mainContent||!this.presenter)return;this.mainContent.querySelectorAll(".view-on-map-btn").forEach(n=>{n.addEventListener("click",a=>{if(typeof this.presenter.handleViewOnMap=="function"){const i=parseFloat(a.currentTarget.dataset.lat),s=parseFloat(a.currentTarget.dataset.lon),r=a.currentTarget.dataset.title;this.presenter.handleViewOnMap({lat:i,lon:s,title:r})}})});const e=document.getElementById("navigateToAddStoryBtn");e&&e.addEventListener("click",n=>{n.preventDefault(),typeof this.presenter.navigateToAddStoryPage=="function"&&this.presenter.navigateToAddStoryPage()}),this.mainContent.querySelectorAll(".story-card-image, .story-card-title").forEach(n=>{n.addEventListener("click",a=>{const i=a.currentTarget.dataset.storyId;i&&typeof this.presenter.handleViewStoryDetail=="function"&&console.log("Klik pada cerita ID:",i)})})},getMapContainerId(){return this._mapContainerId},destroy(){this.mainContent&&(this.mainContent.innerHTML=""),console.log("HomeView dihancurkan.")}};export{u as default};
