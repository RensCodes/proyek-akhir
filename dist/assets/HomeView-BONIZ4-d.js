import{U as r}from"./index-Q4aJbjSp.js";const c={mainContent:null,presenter:null,_mapContainerId:"home-map-display-container",setPresenter(e){this.presenter=e},renderLoading(){if(!this.mainContent){console.error("HomeView: mainContent element not found.");return}r.showLoadingSpinner(this.mainContent,"Memuat cerita Anda...")},renderStories(e,n){if(!this.mainContent){console.error("HomeView: mainContent element not found.");return}r.hideLoadingSpinner(this.mainContent);let a="";!e||e.length===0?a='<p class="empty-stories-message">Belum ada cerita untuk ditampilkan. <a href="#add-story" class="add-story-link-inline">Buat cerita pertama Anda!</a></p>':e.forEach(t=>{const s=t.name||"Cerita Tanpa Judul",o=t.description||"Tidak ada deskripsi.",d=t.name||"Penulis Tidak Diketahui";a+=`
                    <article class="story-card">
                        <img src="${t.photoUrl}" alt="Foto untuk ${s}" 
                             class="story-card-image" 
                             data-story-id="${t.id}"
                             onerror="this.onerror=null;this.src='https://placehold.co/600x400/e0e0e0/757575?text=Gagal+Muat';">
                        <div class="story-card-content">
                            <h3 class="story-card-title" data-story-id="${t.id}">${s}</h3>
                            <p class="story-card-author">
                                <i class="fas fa-user-circle"></i>${d} 
                            </p>
                            <p class="story-card-description">
                                ${o.substring(0,100)}${o.length>100?"...":""}
                            </p>
                        </div>
                        <div class="story-card-footer">
                            <p class="story-card-date">
                                <i class="fas fa-calendar-check"></i>
                                ${r.formatDate(t.createdAt)}
                            </p>
                            ${t.lat&&t.lon?`
                                <button class="btn btn-secondary btn-sm btn-block view-on-map-btn" 
                                        data-lat="${t.lat}" data-lon="${t.lon}" data-title="${s}">
                                    <i class="fas fa-map-marked-alt"></i>Lihat di Peta
                                </button>
                            `:'<p class="no-location-text">Lokasi tidak tersedia</p>'}
                        </div>
                    </article>
                `});const i=`
            <section id="home-map-section" class="map-section-home">
                <h2 class="section-title">Peta Sebaran Cerita</h2>
                <div id="${this._mapContainerId}" class="map-display-container">
                    </div>
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
        `,this._addEventListeners()},renderError(e){this.mainContent&&(r.hideLoadingSpinner(this.mainContent),this.mainContent.innerHTML=`<div class="error-message-container"><p class="error-message">${e}</p></div>`)},_addEventListeners(){if(!this.mainContent||!this.presenter)return;this.mainContent.querySelectorAll(".view-on-map-btn").forEach(n=>{n.addEventListener("click",a=>{if(typeof this.presenter.handleViewOnMap=="function"){const i=parseFloat(a.currentTarget.dataset.lat),t=parseFloat(a.currentTarget.dataset.lon),s=a.currentTarget.dataset.title;this.presenter.handleViewOnMap({lat:i,lon:t,title:s})}})});const e=document.getElementById("navigateToAddStoryBtn");e&&e.addEventListener("click",n=>{n.preventDefault(),typeof this.presenter.navigateToAddStoryPage=="function"&&this.presenter.navigateToAddStoryPage()}),this.mainContent.querySelectorAll(".story-card-image, .story-card-title").forEach(n=>{n.addEventListener("click",a=>{const i=a.currentTarget.dataset.storyId;i&&typeof this.presenter.handleViewStoryDetail=="function"&&console.log("Klik pada cerita ID:",i,"(Fitur detail belum diimplementasikan sepenuhnya di Presenter)")})})},getMapContainerId(){return this._mapContainerId},destroy(){this.mainContent&&(this.mainContent.innerHTML=""),console.log("HomeView dihancurkan.")}};export{c as default};
