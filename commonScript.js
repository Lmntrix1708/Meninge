// commonScript.js

// 1) your six categories
const categories = [
  {
    id: 'understanding',
    icon: '🧠',
    label: {
      en: 'Understanding Meningococcal Meningitis',
      hi: 'मेनिनजोकॉकल मेनिन्जाइटिस समझें'
    }
  },
  {
    id: 'symptoms',
    icon: '⚠️',
    label: {
      en: 'Symptoms, Risks & Complications',
      hi: 'लक्षण, जोखिम और जटिलताएँ'
    }
  },
  {
    id: 'vaccination',
    icon: '💉',
    label: {
      en: 'Vaccination & Awareness',
      hi: 'टीकाकरण और जागरूकता'
    }
  },
  {
    id: 'diagnosis',
    icon: '🔍',
    label: {
      en: 'Diagnosis & Treatment',
      hi: 'निदान और उपचार'
    }
  },
  {
    id: 'public-health',
    icon: '🏥',
    label: {
      en: 'Public Health & Surveillance',
      hi: 'सार्वजनिक स्वास्थ्य और निगरानी'
    }
  },
  {
    id: 'prevention',
    icon: '✋',
    label: {
      en: 'Prevention & Control',
      hi: 'रोकथाम और नियंत्रण'
    }
  }
];

// 2) placeholder for your existing search/highlight/auto-open logic
function initFAQSearchHighlightAndAutoOpen() {
  document.addEventListener('DOMContentLoaded', () => {
    fetch('qna.html')
      .then(r => r.ok ? r.text() : Promise.reject(r))
      .then(html => {
        const container = document.getElementById('qa-container');
        container.innerHTML = html;

        // 1) figure out which language block to pull
        const lang = localStorage.getItem('lang') === 'hi' ? 'hi' : 'en';
        const wrapperId = lang === 'hi' ? 'hindi-content' : 'english-content';
        const wrapper   = document.getElementById(wrapperId);

        // 2) grab only those faq-items
        const allItems = Array.from(wrapper.querySelectorAll('.faq-item'));

        // 3) group them by data-category
        const grouped = {};
        allItems.forEach(item => {
          const cat = item.dataset.category;
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(item);
        });

        // 4) clear out the raw HTML and rebuild by category
        container.innerHTML = '';
        categories.forEach(({id, icon, label}) => {
          const items = grouped[id];
          if (!items || !items.length) return;

          const section = document.createElement('div');
          section.classList.add('category');

          // build the header button
          const btn = document.createElement('button');
          btn.classList.add('category-btn');
          btn.innerHTML = `
            <span class="icon">${icon}</span>
            <span class="en">${label.en}</span>
            <span class="hi">${label.hi}</span>
            <span class="arrow">▼</span>
          `;
          section.appendChild(btn);

          // the container for that category’s items
          const content = document.createElement('div');
          content.classList.add('category-content');
          content.style.display = 'none';
          items.forEach(i => content.appendChild(i));
          section.appendChild(content);

          // wire up the open/close arrow
          btn.addEventListener('click', () => {
            const open = content.style.display === 'block';
            content.style.display = open ? 'none' : 'block';
            btn.querySelector('.arrow').textContent = open ? '▼' : '▲';
          });

          container.appendChild(section);
        });

        // 5) show only the correct language labels on each category button
        document.querySelectorAll('.category-btn .en')
          .forEach(el => el.style.display = lang === 'en' ? 'inline' : 'none');
        document.querySelectorAll('.category-btn .hi')
          .forEach(el => el.style.display = lang === 'hi' ? 'inline' : 'none');

        // 6) now kick off your existing search/highlight/auto-open logic
        // (you should have wrapped that in initFAQSearchHighlightAndAutoOpen())
        initFAQSearchHighlightAndAutoOpen();
      })
      .catch(console.error);
  });
}

/**
 * Recursively walks a node and wraps every case-insensitive occurrence of `term`
 * inside a <span class="highlighted">…</span>, but only in text nodes.
 */
function highlightText(container, term) {
  if (!term) return;
  const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const re = new RegExp(term.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&'), 'gi');
  const toHighlight = [];
  let node;
  while (node = walk.nextNode()) {
    if (re.test(node.textContent)) toHighlight.push(node);
  }
  toHighlight.forEach(textNode => {
    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    textNode.textContent.replace(re, (match, offset) => {
      // plain text up to match
      frag.appendChild(document.createTextNode(textNode.textContent.slice(lastIndex, offset)));
      // highlighted match
      const span = document.createElement('span');
      span.className = 'highlighted';
      span.textContent = match;
      frag.appendChild(span);
      lastIndex = offset + match.length;
    });
    // trailing text
    frag.appendChild(document.createTextNode(textNode.textContent.slice(lastIndex)));
    textNode.parentNode.replaceChild(frag, textNode);
  });
}

function renderCategorizedFAQs() {
  const lang = localStorage.getItem('lang') === 'hi' ? 'hi' : 'en';
  const wrapperId = lang === 'hi' ? 'hindi-content' : 'english-content';

  fetch('qna.html')
    .then(r => r.ok ? r.text() : Promise.reject(r))
    .then(html => {
      // parse out only the right-language block
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const wrapper = temp.querySelector(`#${wrapperId}`);
      if (!wrapper) return;

      // collect all .faq-item
      const items = Array.from(wrapper.querySelectorAll('.faq-item'));
      // group by data-category
      const grouped = {};
      items.forEach(item => {
        const cat = item.dataset.category;
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
      });

      // clear the container
      const container = document.getElementById('qa-container');
      container.innerHTML = '';

      // for each category, if any items exist, build a section
      categories.forEach(({id, icon, label}) => {
        const bucket = grouped[id];
        if (!bucket || !bucket.length) return;

        const section = document.createElement('div');
        section.classList.add('category');

        // header button
        const btn = document.createElement('button');
        btn.classList.add('category-btn');
        btn.innerHTML = `
          <span class="icon">${icon}</span>
          <span class="en">${label.en}</span>
          <span class="hi">${label.hi}</span>
          <span class="arrow">▼</span>
        `;
        section.appendChild(btn);

        // content panel
        const content = document.createElement('div');
        content.classList.add('category-content');
        content.style.display = 'none';
        bucket.forEach(item => {
          item.dataset.orig = item.innerHTML;
          content.appendChild(item);
        });
        section.appendChild(content);

        btn.addEventListener('click', () => {
          const open = content.style.display === 'block';
          content.style.display = open ? 'none' : 'block';
          btn.querySelector('.arrow').textContent = open ? '▼' : '▲';
        });

        container.appendChild(section);
      });

      // show only the correct language labels on those buttons
      document.querySelectorAll('.category-btn .en')
        .forEach(el => el.style.display = lang === 'en' ? '' : 'none');
      document.querySelectorAll('.category-btn .hi')
        .forEach(el => el.style.display = lang === 'hi' ? '' : 'none');

      // now wire up your search/highlight/auto-open
      initFAQSearchHighlightAndAutoOpen();
    })
    .catch(console.error);
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleEn = document.getElementById('toggle-en');
  const toggleHi = document.getElementById('toggle-hi');

  function showEn() {
    document.querySelector('.banner-text .en').style.display = 'block';
    document.querySelector('.banner-text .hi').style.display = 'none';
    document.querySelectorAll('span.en').forEach(el => el.style.display = 'inline');
    document.querySelectorAll('span.hi').forEach(el => el.style.display = 'none');
    toggleEn.classList.add('active');
    toggleHi.classList.remove('active');
  }

  function showHi() {
    document.querySelector('.banner-text .en').style.display = 'none';
    document.querySelector('.banner-text .hi').style.display = 'block';
    document.querySelectorAll('span.en').forEach(el => el.style.display = 'none');
    document.querySelectorAll('span.hi').forEach(el => el.style.display = 'inline');
    toggleHi.classList.add('active');
    toggleEn.classList.remove('active');
  }

  // re-render FAQs any time the language flips
  toggleEn.onclick = () => {
    showEn();
    localStorage.setItem('lang','en');
    renderCategorizedFAQs();
  };
  toggleHi.onclick = () => {
    showHi();
    localStorage.setItem('lang','hi');
    renderCategorizedFAQs();
  };

  // on first load, set banner+nav then render
  if (localStorage.getItem('lang') === 'hi') showHi();
  else showEn();
  renderCategorizedFAQs();

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim().toLowerCase();
    document.querySelectorAll('.category').forEach(section => {
      const content = section.querySelector('.category-content');
      const items   = Array.from(content.querySelectorAll('.faq-item'));
      let anyMatch  = false;

      items.forEach(item => {
        // restore original
        item.innerHTML = item.dataset.orig;

        // decide visibility
        const text = item.textContent.toLowerCase();
        if (term && text.includes(term)) {
          item.style.display = '';
          // highlight matches
          highlightText(item, term);
          anyMatch = true;
        } else if (term) {
          item.style.display = 'none';
        } else {
          // no term => show all
          item.style.display = '';
        }
      });

      // auto-open / hide categories
      const arrow = section.querySelector('.category-btn .arrow');
      if (term) {
        if (anyMatch) {
          section.style.display        = '';
          content.style.display        = 'block';
          arrow.textContent            = '▲';
        } else {
          section.style.display        = 'none';
        }
      } else {
        // reset everything when search cleared
        section.style.display          = '';
        content.style.display          = 'none';
        arrow.textContent              = '▼';
      }
    });
  });

  // Banner slider (unchanged)
  let idx = 0, slides = document.querySelectorAll('.banner .slide');
  setInterval(() => {
    slides[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
  }, 5000);
});
