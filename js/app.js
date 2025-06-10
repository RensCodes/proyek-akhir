import Router from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
    
    Router.init('main-content'); 
    
    console.log("StoryVerse App (Custom CSS & MVP) Loaded!");
});
