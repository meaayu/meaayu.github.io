
/* ─── SCROLL PROGRESS BAR ──────────────────────────────────── */
const scrollProgressBar = document.getElementById('scroll-progress');
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollProgressBar) scrollProgressBar.style.width = pct + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

/* ─── SMOOTH SCROLL WITH NAV OFFSET ────────────────────────── */
function smoothScrollTo(target) {
  const nav = document.getElementById('mainNav');
  const navH = nav ? nav.getBoundingClientRect().height : 0;
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - navH - 8;
  window.scrollTo({ top, behavior: 'smooth' });
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const hash = a.getAttribute('href');
    if (hash === '#' || hash === '') return;
    const el = document.querySelector(hash);
    if (!el) return;
    e.preventDefault();
    smoothScrollTo(el);
    // update URL without jumping
    history.pushState(null, '', hash);
  });
});

/* ─── SCROLL PROGRESS ──────────────────────────────────────── */
const scrollBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (total > 0) scrollBar.style.width = (window.scrollY / total * 100) + '%';
}, {passive:true});

/* ─── NAV SCROLL ───────────────────────────────────────────── */
const nav = document.getElementById('mainNav');
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('visible', window.scrollY > 600);
}, {passive:true});
backToTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

/* ─── MOBILE NAV ───────────────────────────────────────────── */
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const mobileNavOverlay = document.getElementById('mobileNavOverlay');
const mobileNavClose = document.getElementById('mobileNavClose');
function openMobileNav() {
  mobileNav.classList.add('active');
  mobileNavOverlay.classList.add('active');
  menuToggle.classList.add('active');
  menuToggle.setAttribute('aria-expanded','true');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  mobileNav.classList.remove('active');
  mobileNavOverlay.classList.remove('active');
  menuToggle.classList.remove('active');
  menuToggle.setAttribute('aria-expanded','false');
  document.body.style.overflow = '';
}
menuToggle.addEventListener('click', () => {
  mobileNav.classList.contains('active') ? closeMobileNav() : openMobileNav();
});
mobileNavClose.addEventListener('click', closeMobileNav);
mobileNavOverlay.addEventListener('click', closeMobileNav);
document.querySelectorAll('.mobile-link').forEach(a => a.addEventListener('click', closeMobileNav));

// Focus trap for mobile nav
mobileNav.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const focusable = [...mobileNav.querySelectorAll('a, button')].filter(el => !el.disabled);
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
  else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
});

/* ─── REVEAL ON SCROLL ─────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
  });
}, {threshold: 0.12});
revealEls.forEach(el => io.observe(el));



/* ─── HERO TYPEWRITER ──────────────────────────────────────── */
const taglines = [
  'Code × Art × Motion',
  'Hand-drawn & Alive',
  'Pixels with Soul',
  'Sketches Come to Life',
];
const taglineEl = document.getElementById('taglineText');
let tIdx = 0, charIdx = 0, deleting = false;
function typewriterTick() {
  const target = taglines[tIdx];
  if (!deleting) {
    charIdx++;
    taglineEl.textContent = target.slice(0, charIdx);
    if (charIdx === target.length) {
      setTimeout(() => { deleting = true; typewriterTick(); }, 2400);
      return;
    }
    setTimeout(typewriterTick, 60 + Math.random() * 40);
  } else {
    charIdx--;
    taglineEl.textContent = target.slice(0, charIdx);
    if (charIdx === 0) {
      deleting = false;
      tIdx = (tIdx + 1) % taglines.length;
      setTimeout(typewriterTick, 350);
      return;
    }
    setTimeout(typewriterTick, 30);
  }
}
setTimeout(typewriterTick, 1800);

/* ─── WORK CARD 3D TILT ────────────────────────────────────── */
document.querySelectorAll('.work-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    if (card.classList.contains('filtered-out')) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `translateY(-5px) rotate(0.4deg) rotateX(${-y*6}deg) rotateY(${x*6}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ─── WORK FILTERS ─────────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.work-filter');
const workCards = document.querySelectorAll('.work-card');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    workCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('filtered-out', !match);
    });
  });
});

/* ─── PROJECT MODAL ────────────────────────────────────────── */
const projectData = {
  '1': {
    title: 'Portfolio Site',
    panelType: 'Web Project',
    desc: 'A hand-crafted web experience merging aesthetics with smooth interactions.',
    tags: ['Web Dev','HTML/CSS/JS'],
    link: '#', linkText: 'View Live ↗',
    items: [
      { title: 'Design Philosophy', body: 'Every element is drawn by hand first — rough sketches, gestural thumbnails — then translated into pixels while keeping all the warmth and imperfection.' },
      { title: 'Tech Stack', body: 'Built with vanilla HTML/CSS/JS for maximum control, with SVG filters for the hand-drawn aesthetic and CSS custom properties for the dark/light theme system.' },
    ]
  },
  '2': {
    title: 'Hand Drawn Animation',
    panelType: 'Animation',
    desc: 'Frame-by-frame character animation with expressive motion and personality.',
    tags: ['Animation','2D','Tahoma2D'],
    youtube: 'JgvbpIypir4'
  },
  '3': {
    title: 'Logo Design Series',
    panelType: 'Graphic Design',
    desc: 'Hand-rendered logo concepts exploring bold typography and mark-making.',
    tags: ['Graphic Design','Branding','Typography'],
    items: [
      { title: 'Concept Development', body: 'Each mark starts as a rough pencil sketch, exploring multiple letterform weights and angles before moving into digital refinement.' },
      { title: 'Tools Used', body: 'Pencil & paper for ideation, then Adobe Illustrator and Procreate for digital execution and color exploration.' },
    ]
  },
  '4': {
    title: 'Art Showcase',
    panelType: 'Illustration Series',
    desc: 'Atmospheric landscapes and character studies blending digital brushwork with traditional sensibility — each piece starts as pencil on paper.',
    tags: ['Illustration','Krita','Digital Painting'],
    images: [
      'project/practice 1.jpg',
      'project/practice 2.jpg',
      'project/practice 3.jpg',
      'project/practice 4.jpg',
      'project/practice 5.jpg'
    ],
    artMeta: {
      medium: 'Digital (Krita)',
      year: '2024 — 2025',
      style: 'Atmospheric / Painterly',
      tools: 'Krita · Procreate · Wacom'
    },
    process: [
      'Rough gesture sketch with pencil on paper',
      'Ink linework scan → digitise & clean up',
      'Flat colour blocking in Krita',
      'Light & atmosphere pass with custom brushes',
      'Final detail and texture layer'
    ],
    footerNote: '✦ Personal studies, not client work',
    footerLink: 'https://instagram.com/m__aayu__',
    footerLinkText: 'See more on Instagram ↗'
  },
};

const overlay = document.getElementById('projectOverlay');
const panel = document.getElementById('projectPanel');
const closeBtn = document.getElementById('projectClose');

function openProject(id) {
  const d = projectData[id]; if(!d) return;

  document.getElementById('projectTitle').textContent = d.title;
  document.getElementById('projectDesc').textContent = d.desc;
  document.getElementById('projectPanelType').textContent = d.panelType || 'Project';

  // Image count badge
  const countBadge = document.getElementById('projectImgCount');
  if (d.images && d.images.length) {
    countBadge.textContent = `✦ ${d.images.length} pieces`;
    countBadge.style.display = 'inline-block';
  } else {
    countBadge.style.display = 'none';
  }

  const tagsEl = document.getElementById('projectTags');
  tagsEl.innerHTML = d.tags.map(t => `<span class="tag">${t}</span>`).join('');

  /* ── media: youtube OR images ── */
  const mediaEl = document.getElementById('projectMedia');
  mediaEl.innerHTML = '';
  if (d.youtube) {
    mediaEl.innerHTML = `
      <a class="project-yt-wrap" href="https://www.youtube.com/watch?v=${d.youtube}" target="_blank" rel="noopener" aria-label="Watch on YouTube">
        <div class="project-yt-bg">
          <svg viewBox="0 0 560 315" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <rect width="560" height="315" fill="#1a1510"/>
            <g opacity="0.06" stroke="#e8ddd0" stroke-width="0.8">
              <line x1="0" y1="45" x2="560" y2="45"/><line x1="0" y1="90" x2="560" y2="90"/>
              <line x1="0" y1="135" x2="560" y2="135"/><line x1="0" y1="180" x2="560" y2="180"/>
              <line x1="0" y1="225" x2="560" y2="225"/><line x1="0" y1="270" x2="560" y2="270"/>
            </g>
            <text x="280" y="145" font-family="Caveat,cursive" font-size="22" fill="#e8ddd0" opacity="0.25" text-anchor="middle">Hand Drawn Animation</text>
            <text x="280" y="175" font-family="Patrick Hand,cursive" font-size="13" fill="#d4693a" opacity="0.4" text-anchor="middle">click to watch on YouTube ↗</text>
          </svg>
        </div>
        <div class="project-yt-play">
          <div class="project-yt-play-btn">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </a>`;
  } else if (d.images && d.images.length) {
    // Skeleton while first image loads
    mediaEl.innerHTML = `<div class="gallery-skeleton" id="gallerySkeleton" style="aspect-ratio:4/3"></div>`;
    const heroImg = new Image();
    heroImg.onload = () => { document.getElementById('gallerySkeleton')?.remove(); renderGallery(d.images, mediaEl); };
    heroImg.onerror = () => { document.getElementById('gallerySkeleton')?.remove(); renderGallery(d.images, mediaEl); };
    heroImg.src = d.images[0];
  }

  overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false');
  panel.classList.add('open'); panel.setAttribute('aria-modal','true');
  document.body.style.overflow = 'hidden';
  panel.scrollTop = 0;

  // Render project items + art-specific meta
  const itemsEl = document.getElementById('projectItems');
  itemsEl.innerHTML = '';

  if (d.artMeta) {
    const m = d.artMeta;
    itemsEl.innerHTML += `
      <div class="art-meta-row">
        <div class="art-meta-chip">
          <div class="art-meta-chip-label">Medium</div>
          <div class="art-meta-chip-value">${m.medium}</div>
        </div>
        <div class="art-meta-chip">
          <div class="art-meta-chip-label">Year</div>
          <div class="art-meta-chip-value">${m.year}</div>
        </div>
        <div class="art-meta-chip">
          <div class="art-meta-chip-label">Style</div>
          <div class="art-meta-chip-value">${m.style}</div>
        </div>
        <div class="art-meta-chip">
          <div class="art-meta-chip-label">Tools</div>
          <div class="art-meta-chip-value">${m.tools}</div>
        </div>
      </div>`;
  }

  if (d.process && d.process.length) {
    itemsEl.innerHTML += `
      <div class="art-process">
        <div class="art-process-label">Process</div>
        <div class="art-process-steps">
          ${d.process.map((step, i) => `
            <div class="art-process-step">
              <span class="art-step-num">${i + 1}</span>
              <span>${step}</span>
            </div>`).join('')}
        </div>
      </div>`;
  }

  if (d.items && d.items.length) {
    itemsEl.innerHTML += d.items.map(item => `
      <div class="project-item">
        <h4>${item.title}</h4>
        <p>${item.body}</p>
      </div>`).join('');
  }
  if (d.link) {
    itemsEl.innerHTML += `<a class="project-link" href="${d.link}" target="_blank" rel="noopener">${d.linkText || 'View Project ↗'}</a>`;
  }

  // Footer action bar
  const footer = document.getElementById('projectPanelFooter');
  if (d.footerNote || d.footerLink) {
    footer.style.display = 'flex';
    document.getElementById('panelFooterNote').textContent = d.footerNote || '';
    const fa = document.getElementById('panelFooterAction');
    fa.href = d.footerLink || '#';
    fa.textContent = d.footerLinkText || 'View More ↗';
  } else {
    footer.style.display = 'none';
  }
}

function closeProject() {
  overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true');
  panel.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Gallery render ── */
let galleryImages = [];
let galleryIndex = 0;

function renderGallery(images, container) {
  galleryImages = images;

  const thumbsHtml = images.map((src, i) =>
    `<div class="gallery-thumbstrip-item${i === 0 ? ' active' : ''}" data-idx="${i}">
      <img src="${src}" alt="Artwork ${i+1}" loading="lazy"/>
    </div>`
  ).join('');

  const pipsHtml = images.map((_, i) =>
    `<button class="gallery-pip${i === 0 ? ' active' : ''}" data-idx="${i}" aria-label="Go to image ${i+1}"></button>`
  ).join('');

  container.innerHTML = `
    <div class="gallery-hero-wrap">
      <img class="project-gallery-hero" id="galleryHero" src="${images[0]}" alt="Artwork"/>
      <button class="gallery-hero-arrow gallery-hero-prev" id="galleryHeroPrev" aria-label="Previous artwork">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="gallery-hero-arrow gallery-hero-next" id="galleryHeroNext" aria-label="Next artwork">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div class="gallery-pips" id="galleryPips">${pipsHtml}</div>
      <div class="gallery-zoom-hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        zoom
      </div>
    </div>
    <div class="gallery-thumbstrip" id="galleryThumbstrip">${thumbsHtml}</div>
    <div class="gallery-infobar">
      <div class="gallery-infobar-left">
        <span class="gallery-counter" id="galleryCounter">1 / ${images.length}</span>
      </div>
      <button class="gallery-expand-btn" id="galleryExpandBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        fullscreen
      </button>
    </div>`;

  const hero = container.querySelector('#galleryHero');
  hero.addEventListener('click', () => openLightbox(galleryIndex));

  container.querySelector('#galleryExpandBtn').addEventListener('click', () => openLightbox(galleryIndex));

  container.querySelector('#galleryHeroPrev').addEventListener('click', (e) => {
    e.stopPropagation();
    const prev = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    setGalleryImage(prev, container);
  });
  container.querySelector('#galleryHeroNext').addEventListener('click', (e) => {
    e.stopPropagation();
    const next = (galleryIndex + 1) % galleryImages.length;
    setGalleryImage(next, container);
  });

  container.querySelectorAll('.gallery-thumbstrip-item').forEach(item => {
    item.addEventListener('click', () => {
      setGalleryImage(parseInt(item.dataset.idx), container);
    });
  });

  container.querySelectorAll('.gallery-pip').forEach(pip => {
    pip.addEventListener('click', (e) => {
      e.stopPropagation();
      setGalleryImage(parseInt(pip.dataset.idx), container);
    });
  });
}

function setGalleryImage(idx, container) {
  galleryIndex = idx;
  const hero = container ? container.querySelector('#galleryHero') : document.getElementById('galleryHero');
  if (hero) {
    hero.style.opacity = '0';
    hero.style.transform = 'scale(0.97)';
    hero.src = galleryImages[idx];
    hero.onload = () => {
      hero.style.transition = 'opacity 0.35s, transform 0.35s';
      hero.style.opacity = '1';
      hero.style.transform = 'scale(1)';
    };
    hero.onerror = () => {
      hero.style.opacity = '1';
      hero.style.transform = 'scale(1)';
    };
  }
  // Update thumbstrip
  document.querySelectorAll('.gallery-thumbstrip-item').forEach(t => {
    t.classList.toggle('active', parseInt(t.dataset.idx) === idx);
  });
  // Update pips
  document.querySelectorAll('.gallery-pip').forEach(p => {
    p.classList.toggle('active', parseInt(p.dataset.idx) === idx);
  });
  const counter = document.getElementById('galleryCounter');
  if (counter) counter.textContent = `${idx + 1} / ${galleryImages.length}`;
}

/* ── Lightbox with prev/next ── */
const lightbox = document.getElementById('galleryLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxDots = document.getElementById('lightboxDots');

function buildDots(total, current) {
  lightboxDots.innerHTML = Array.from({length: total}, (_, i) =>
    `<button class="lightbox-dot${i === current ? ' active' : ''}" data-i="${i}" aria-label="Go to image ${i+1}"></button>`
  ).join('');
  lightboxDots.querySelectorAll('.lightbox-dot').forEach(dot => {
    dot.addEventListener('click', () => openLightbox(parseInt(dot.dataset.i)));
  });
}

function openLightbox(idx) {
  galleryIndex = idx;
  lightboxImg.classList.remove('lb-fade');
  lightboxImg.src = galleryImages[idx];
  lightboxCounter.textContent = `${idx + 1} / ${galleryImages.length}`;
  buildDots(galleryImages.length, idx);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function lightboxNav(dir) {
  const next = (galleryIndex + dir + galleryImages.length) % galleryImages.length;
  lightboxImg.classList.add('lb-fade');
  setTimeout(() => {
    openLightbox(next);
    setGalleryImage(next, null);
  }, 180);
}

document.getElementById('lightboxClose').addEventListener('click', () => {
  lightbox.classList.remove('open');
  if (!document.getElementById('projectPanel').classList.contains('open')) {
    document.body.style.overflow = '';
  }
});
document.getElementById('lightboxPrev').addEventListener('click', () => lightboxNav(-1));
document.getElementById('lightboxNext').addEventListener('click', () => lightboxNav(1));
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) {
    lightbox.classList.remove('open');
    if (!document.getElementById('projectPanel').classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }
});
document.querySelectorAll('.work-card').forEach(card => {
  card.addEventListener('click', () => openProject(card.dataset.project));
  card.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') openProject(card.dataset.project); });
});
closeBtn.addEventListener('click', closeProject);
overlay.addEventListener('click', closeProject);

/* ─── CONTACT FORM ─────────────────────────────────────────── */
const msgInput = document.getElementById('contactMsg');
const charCount = document.getElementById('charCount');
msgInput.addEventListener('input', () => {
  charCount.textContent = msgInput.value.length;
});

document.getElementById('contactSubmit').addEventListener('click', () => {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const msg = msgInput.value.trim();
  let valid = true;
  ['nameErr','emailErr','msgErr'].forEach(id => {
    document.getElementById(id).classList.remove('show');
    document.getElementById(id).textContent = '';
  });
  if(!name) { document.getElementById('nameErr').textContent = '← name required'; document.getElementById('nameErr').classList.add('show'); valid = false; }
  if(!email || !email.includes('@')) { document.getElementById('emailErr').textContent = '← valid email needed'; document.getElementById('emailErr').classList.add('show'); valid = false; }
  if(!msg) { document.getElementById('msgErr').textContent = '← say something!'; document.getElementById('msgErr').classList.add('show'); valid = false; }
  if(valid) {
    const btn = document.getElementById('contactSubmit');
    btn.textContent = 'Sent! ✦';
    btn.style.background = '#5ba08a';
    setTimeout(() => { btn.textContent = 'Send it ↗'; btn.style.background = ''; }, 3000);
  }
});

/* ─── MUSIC WIDGET ─────────────────────────────────────────── */
const audio = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
const musicNowPlaying = document.getElementById('musicNowPlaying');
const iconPlay = musicToggle.querySelector('.icon-play');
const iconPause = musicToggle.querySelector('.icon-pause');

function setMusicState(isPlaying) {
  iconPlay.style.display = isPlaying ? 'none' : '';
  iconPause.style.display = isPlaying ? '' : 'none';
  musicToggle.classList.toggle('playing', isPlaying);
  musicToggle.setAttribute('aria-label', isPlaying ? 'Pause music' : 'Play music');
  musicNowPlaying.classList.toggle('visible', isPlaying);
}

musicToggle.addEventListener('click', () => {
  if (audio.paused) {
    audio.play().then(() => setMusicState(true)).catch(() => {});
  } else {
    audio.pause();
    setMusicState(false);
  }
});
audio.addEventListener('pause', () => setMusicState(false));
audio.addEventListener('play', () => setMusicState(true));

/* ─── THEME TOGGLE ─────────────────────────────────────────── */
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');
const mobileThemeLabel = mobileThemeToggle.querySelector('.mobile-theme-label');
const sunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>`;
const moonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
let lightMode = localStorage.getItem('theme') === 'light';
function applyTheme(light) {
  lightMode = light;
  document.body.classList.toggle('light-mode', lightMode);
  localStorage.setItem('theme', lightMode ? 'light' : 'dark');
  themeToggle.innerHTML = lightMode ? moonIcon : sunIcon;
  themeToggle.title = lightMode ? 'Switch to dark' : 'Switch to light';
  themeToggle.setAttribute('aria-label', lightMode ? 'Switch to dark mode' : 'Switch to light mode');
  if (mobileThemeLabel) mobileThemeLabel.textContent = lightMode ? 'Dark mode' : 'Light mode';
}
applyTheme(lightMode); // apply on load
themeToggle.addEventListener('click', () => applyTheme(!lightMode));
mobileThemeToggle.addEventListener('click', () => applyTheme(!lightMode));

/* ─── ESC + ARROW KEY HANDLER ──────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (lightbox.classList.contains('open')) {
      lightbox.classList.remove('open');
      if (!document.getElementById('projectPanel').classList.contains('open')) {
        document.body.style.overflow = '';
      }
      return;
    }
    closeProject();
    closeMobileNav();
    const ytModal = document.querySelector('.yt-modal[aria-hidden="false"]');
    if (ytModal) { ytModal.setAttribute('aria-hidden','true'); }
  }
  if (lightbox.classList.contains('open')) {
    if (e.key === 'ArrowRight') lightboxNav(1);
    if (e.key === 'ArrowLeft')  lightboxNav(-1);
  }
});

/* ─── PAINT BRUSH CURSOR TRAIL ──────────────────────────────── */
(function() {
  const dots = [];
  const NUM = 10;
  const colors = ['var(--accent)', 'rgba(212,105,58,0.7)', 'rgba(212,105,58,0.5)', 'rgba(91,160,138,0.3)', 'rgba(212,105,58,0.3)'];
  for (let i = 0; i < NUM; i++) {
    const d = document.createElement('div');
    const size = Math.max(1.5, 5 - i * 0.38);
    const color = colors[Math.floor(i / 2)] || 'rgba(212,105,58,0.15)';
    d.style.cssText = `position:fixed;pointer-events:none;z-index:9999;width:${size}px;height:${size * (1 + i * 0.06)}px;border-radius:${50 - i*2}%;background:${color};opacity:${Math.max(0.06, 0.42 - i*0.04)};will-change:transform;mix-blend-mode:screen;`;
    document.body.appendChild(d);
    dots.push({ el: d, x: 0, y: 0 });
  }
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  function animTrail() {
    let px = mx, py = my;
    dots.forEach((dot, i) => {
      const speed = 0.48 - i * 0.042;
      dot.x += (px - dot.x) * speed;
      dot.y += (py - dot.y) * speed;
      dot.el.style.transform = `translate(${dot.x - 2.5}px, ${dot.y - 2.5}px) rotate(${i * 8}deg)`;
      px = dot.x; py = dot.y;
    });
    requestAnimationFrame(animTrail);
  }
  animTrail();
  if ('ontouchstart' in window) dots.forEach(d => d.el.style.display = 'none');
})();
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      navLinks.forEach(a => {
        a.classList.toggle('nav-active', a.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, {threshold: 0.4});
sections.forEach(s => sectionObserver.observe(s));
