// commonScript.js
document.addEventListener('DOMContentLoaded', () => {
  const toggleEn = document.getElementById('toggle-en');
  const toggleHi = document.getElementById('toggle-hi');

  function showEn() {
    // 1) Banner
    document.querySelector('.banner-text .en').style.display = 'block';
    document.querySelector('.banner-text .hi').style.display = 'none';

    // 2) All spans (nav, labels, etc.)
    document.querySelectorAll('span.en').forEach(el => el.style.display = 'inline');
    document.querySelectorAll('span.hi').forEach(el => el.style.display = 'none');

    // 3) Q&A panels (only present on index.html)
    const enQA = document.getElementById('english-content');
    const hiQA = document.getElementById('hindi-content');
    if (enQA && hiQA) {
      enQA.style.display = 'block';
      hiQA.style.display = 'none';
    }

    // 4) Toggle button styles
    toggleEn.classList.add('active');
    toggleHi.classList.remove('active');
  }

  function showHi() {
    // 1) Banner
    document.querySelector('.banner-text .en').style.display = 'none';
    document.querySelector('.banner-text .hi').style.display = 'block';

    // 2) All spans
    document.querySelectorAll('span.en').forEach(el => el.style.display = 'none');
    document.querySelectorAll('span.hi').forEach(el => el.style.display = 'inline');

    // 3) Q&A panels
    const enQA = document.getElementById('english-content');
    const hiQA = document.getElementById('hindi-content');
    if (enQA && hiQA) {
      enQA.style.display = 'none';
      hiQA.style.display = 'block';
    }

    // 4) Toggle button styles
    toggleHi.classList.add('active');
    toggleEn.classList.remove('active');
  }

  // Bind the buttons
  toggleEn.onclick = () => { showEn(); localStorage.setItem('lang','en'); };
  toggleHi.onclick = () => { showHi(); localStorage.setItem('lang','hi'); };

  // On load
  if (localStorage.getItem('lang') === 'hi') showHi();
  else showEn();

  // Banner slider (unchanged)
  let idx = 0, slides = document.querySelectorAll('.banner .slide');
  setInterval(() => {
    slides[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
  }, 5000);
  
});
