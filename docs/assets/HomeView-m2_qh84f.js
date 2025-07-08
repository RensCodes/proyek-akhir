import{U as o}from"./index-CiRWjb8D.js";import h from"./DbService-BL4Dz8du.js";const b="BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk",l={async isSubscribed(){return"serviceWorker"in navigator?!!await(await navigator.serviceWorker.ready).pushManager.getSubscription():!1},async subscribeUser(){if(!("serviceWorker"in navigator))throw new Error("Service Worker tidak didukung.");if(!("PushManager"in window))throw new Error("Push API tidak didukung di browser ini.");const t=await navigator.serviceWorker.ready,e=await t.pushManager.getSubscription();if(e)return e;const a=this._urlBase64ToUint8Array(b),s=await t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:a});return await this._sendSubscriptionToServer(s),s},async unsubscribeUser(){const e=await(await navigator.serviceWorker.ready).pushManager.getSubscription();return e?(await this._removeSubscriptionFromServer(e),await e.unsubscribe()):!1},async _sendSubscriptionToServer(t){try{await fetch("/api/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})}catch(e){console.error("[NotificationService] Gagal kirim subscription ke server:",e)}},async _removeSubscriptionFromServer(t){try{await fetch("/api/unsubscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})}catch(e){console.error("[NotificationService] Gagal hapus subscription dari server:",e)}},_urlBase64ToUint8Array(t){const e="=".repeat((4-t.length%4)%4),a=(t+e).replace(/\-/g,"+").replace(/_/g,"/"),s=atob(a),n=new Uint8Array(s.length);for(let r=0;r<s.length;++r)n[r]=s.charCodeAt(r);return n}},g={mainContent:null,presenter:null,_mapContainerId:"home-map-display-container",setPresenter(t){this.presenter=t},renderLoading(){if(!this.mainContent){console.error("HomeView: mainContent element not found.");return}o.showLoadingSpinner(this.mainContent,"Memuat cerita Anda...")},renderStories(t,e){var r,d;if(!this.mainContent){console.error("HomeView: mainContent element not found.");return}o.hideLoadingSpinner(this.mainContent);let a="";!t||t.length===0?a='<p class="empty-stories-message">Belum ada cerita untuk ditampilkan. <a href="#add-story" class="add-story-link-inline">Buat cerita pertama Anda!</a></p>':t.forEach(i=>{const c=i.name||"Cerita Tanpa Judul",p=i.description||"Tidak ada deskripsi.",u=i.name||"Penulis Tidak Diketahui",m=i.photoUrl||(i.photoBase64?`data:image/jpeg;base64,${i.photoBase64}`:"https://placehold.co/600x400/e0e0e0/757575?text=Gambar+tidak+tersedia");a+=`
          <article class="story-card">
            <img 
              src="${m}" 
              alt="Foto untuk ${c}" 
              class="story-card-image" 
              data-story-id="${i.id}">
            <div class="story-card-content">
              <h3 class="story-card-title" data-story-id="${i.id}">${c}</h3>
              <p class="story-card-author">
                <i class="fas fa-user-circle"></i>${u}
              </p>
              <p class="story-card-description">
                ${p.substring(0,100)}${p.length>100?"...":""}
              </p>
            </div>
            <div class="story-card-footer">
              <p class="story-card-date">
                <i class="fas fa-calendar-check"></i>
                ${o.formatDate(i.createdAt)}
              </p>
              ${i.lat&&i.lon?`
                <button class="btn btn-secondary btn-sm btn-block view-on-map-btn" 
                        data-lat="${i.lat}" data-lon="${i.lon}" data-title="${c}">
                  <i class="fas fa-map-marked-alt"></i>Lihat di Peta
                </button>
              `:'<p class="no-location-text">Lokasi tidak tersedia</p>'}
              <button class="btn btn-outline-primary btn-sm save-story-btn" data-id="${i.id}">
                <i class="fas fa-save"></i> Simpan Story
              </button>
              <button class="btn btn-outline-primary btn-sm save-to-favorite-btn" data-story-id="${i.id}">
                <i class="fas fa-bookmark"></i> Simpan ke Favorit
              </button>
            </div>
          </article>
        `});const s=`
      <section id="home-map-section" class="map-section-home">
        <h2 class="section-title">Peta Sebaran Cerita</h2>
        <div id="${this._mapContainerId}" class="map-display-container"></div>
      </section>
    `;this.mainContent.innerHTML=`
      <section class="page-section animate-fade-in">
        <div class="page-header">
          <h1 class="page-title">Selamat Datang, ${e||"Pengguna"}!</h1>
          <a href="#add-story" id="navigateToAddStoryBtn" class="btn btn-success">
            <i class="fas fa-plus"></i>Buat Cerita Baru
          </a>
          <div class="notification-toggle-buttons" style="margin-top: 10px;">
            <button id="subscribeNotificationBtn" class="btn btn-success btn-sm">Aktifkan Notifikasi</button>
            <button id="unsubscribeNotificationBtn" class="btn btn-outline-danger btn-sm" style="display: none;">Matikan Notifikasi</button>
          </div>
        </div>
        <div class="story-card-grid">
          ${a}
        </div>
        ${t&&t.filter(i=>i.lat&&i.lon).length>0?s:""}
      </section>
    `;const n=t.filter(i=>i.lat&&i.lon);if(n.length>0&&((d=(r=this.presenter)==null?void 0:r._mapService)!=null&&d.initDisplayMap)){const i=this.getMapContainerId();this.presenter._mapService.initDisplayMap(i,n)}this._addEventListeners(),this._setupNotificationButtons(),this._addSaveToFavoriteListeners(t)},renderError(t){this.mainContent&&(o.hideLoadingSpinner(this.mainContent),this.mainContent.innerHTML=`<div class="error-message-container"><p class="error-message">${t}</p></div>`)},_addEventListeners(){if(!this.mainContent||!this.presenter)return;this.mainContent.querySelectorAll(".save-story-btn").forEach(e=>{e.addEventListener("click",async a=>{const s=a.currentTarget.dataset.id,n=a.currentTarget;if(s&&typeof this.presenter.handleSaveStory=="function")try{await this.presenter.handleSaveStory(s),n.innerHTML='<i class="fas fa-check-circle"></i> Disimpan ✅',n.disabled=!0,n.classList.remove("btn-outline-primary"),n.classList.add("btn-success")}catch(r){console.error("Gagal menyimpan cerita:",r),n.innerHTML='<i class="fas fa-times-circle"></i> Gagal',setTimeout(()=>{n.innerHTML='<i class="fas fa-save"></i> Simpan Story'},2e3)}})}),this.mainContent.querySelectorAll(".view-on-map-btn").forEach(e=>{e.addEventListener("click",a=>{const{lat:s,lon:n,title:r}=a.currentTarget.dataset;s&&n&&typeof this.presenter.handleViewOnMap=="function"&&this.presenter.handleViewOnMap({lat:parseFloat(s),lon:parseFloat(n),title:r})})});const t=document.getElementById("navigateToAddStoryBtn");t&&t.addEventListener("click",e=>{e.preventDefault(),typeof this.presenter.navigateToAddStoryPage=="function"&&this.presenter.navigateToAddStoryPage()}),this.mainContent.querySelectorAll(".story-card-image, .story-card-title").forEach(e=>{e.addEventListener("click",a=>{const s=a.currentTarget.dataset.storyId;s&&typeof this.presenter.handleViewStoryDetail=="function"&&this.presenter.handleViewStoryDetail(s)})})},async _setupNotificationButtons(){const t=document.getElementById("subscribeNotificationBtn"),e=document.getElementById("unsubscribeNotificationBtn");if(!(!t||!e)){t.addEventListener("click",async()=>{try{await l.subscribeUser(),t.style.display="none",e.style.display="inline-block",alert("Notifikasi diaktifkan!")}catch(a){console.error(a),alert("Gagal mengaktifkan notifikasi.")}}),e.addEventListener("click",async()=>{try{await l.unsubscribeUser(),e.style.display="none",t.style.display="inline-block",alert("Notifikasi dimatikan.")}catch(a){console.error(a),alert("Gagal mematikan notifikasi.")}});try{const a=await l.isSubscribed();t.style.display=a?"none":"inline-block",e.style.display=a?"inline-block":"none"}catch(a){console.error("Gagal memeriksa status notifikasi:",a)}}},_addSaveToFavoriteListeners(t){this.mainContent.querySelectorAll(".save-to-favorite-btn").forEach(a=>{a.addEventListener("click",async()=>{const s=a.dataset.storyId,n=t.find(r=>r.id===s);if(n)try{const r={...n,id:n.id||`saved-${Date.now()}`,createdAt:n.createdAt||new Date().toISOString()};await h.saveStoryToSaved(r),a.innerHTML='<i class="fas fa-check-circle"></i> Favorit ✅',a.disabled=!0,a.classList.remove("btn-outline-primary"),a.classList.add("btn-success")}catch(r){console.error("Gagal simpan ke favorit:",r),alert("Gagal menyimpan ke favorit.")}})})},getMapContainerId(){return this._mapContainerId},destroy(){this.mainContent&&(this.mainContent.innerHTML=""),console.log("HomeView dihancurkan.")}};export{g as default};
