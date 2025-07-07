import{U as e}from"./index-BKrFl1gL.js";const a={mainContent:null,presenter:null,setPresenter(n){this.presenter=n},renderLoading(){this.mainContent&&e.showLoadingSpinner(this.mainContent,"Memuat cerita favorit...")},renderStories(n,t="Pengguna"){if(this.mainContent){if(e.hideLoadingSpinner(this.mainContent),!n||n.length===0){this.mainContent.innerHTML=`
        <section class="page-section animate-fade-in">
          <h2>Halo, ${t}!</h2>
          <p>Kamu belum menyimpan cerita apa pun ke favorit.</p>
        </section>
      `;return}this.mainContent.innerHTML=`
      <section class="page-section animate-fade-in">
        <h2>Halo, ${t}!</h2>
        <p>Berikut daftar cerita favorit kamu:</p>
        <div class="story-list">
          ${n.map(e.renderStoryCard).join("")}
        </div>
      </section>
    `}}};export{a as default};
