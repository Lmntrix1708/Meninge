// commonScript.js
document.addEventListener('DOMContentLoaded', () => {
  const toggleEn = document.getElementById('toggle-en');
  const toggleHi = document.getElementById('toggle-hi');
  const enQA = document.getElementById('english-content');
  const hiQA = document.getElementById('hindi-content');

  function showEn() {
    // Banner text
    document.querySelector('.banner-text .en').style.display = 'block';
    document.querySelector('.banner-text .hi').style.display = 'none';
    toggleEn.classList.add('active');
    toggleHi.classList.remove('active');
    // All spans
    document.querySelectorAll('span.en').forEach(el => el.style.display = 'inline');
    document.querySelectorAll('span.hi').forEach(el => el.style.display = 'none');
    // Q&A panels (Home page)
    if (enQA && hiQA) {
      enQA.style.display = 'block';
      hiQA.style.display = 'none';
    }
  }

  function showHi() {
    document.querySelector('.banner-text .en').style.display = 'none';
    document.querySelector('.banner-text .hi').style.display = 'block';
    toggleHi.classList.add('active');
    toggleEn.classList.remove('active');
    document.querySelectorAll('span.en').forEach(el => el.style.display = 'none');
    document.querySelectorAll('span.hi').forEach(el => el.style.display = 'inline');
    if (enQA && hiQA) {
      enQA.style.display = 'none';
      hiQA.style.display = 'block';
    }
  }

  // Bind clicks + persist
  toggleEn.onclick = () => { showEn(); localStorage.setItem('lang','en'); };
  toggleHi.onclick = () => { showHi(); localStorage.setItem('lang','hi'); };

  // On load
  if (localStorage.getItem('lang') === 'hi') showHi();
  else showEn();

  // Banner slider
  let idx = 0, slides = document.querySelectorAll('.banner .slide');
  setInterval(() => {
    slides[idx].classList.remove('active');
    idx = (idx+1) % slides.length;
    slides[idx].classList.add('active');
  }, 5000);
});