
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

/* ─── NAV SCROLL ───────────────────────────────────────────── */
const nav = document.getElementById('mainNav');
const backToTop = document.getElementById('backToTop');
const cornerCluster = document.getElementById('cornerCluster');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  if (cornerCluster) cornerCluster.classList.toggle('visible', window.scrollY > 300);
}, {passive:true});
if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

/* ─── ACTIVE NAV SECTION HIGHLIGHT ─────────────────────────── */
(function () {
  const sections = ['skills', 'work', 'about', 'contact'];
  const desktopLinks = {};
  const mobileLinks = {};

  sections.forEach(id => {
    const dLink = document.querySelector(`.nav-links a[href="#${id}"]`);
    const mLink = document.querySelector(`.mobile-link[href="#${id}"]`);
    if (dLink) desktopLinks[id] = dLink;
    if (mLink) mobileLinks[id] = mLink;
  });

  function setActive(id) {
    sections.forEach(s => {
      if (desktopLinks[s]) desktopLinks[s].classList.toggle('nav-active', s === id);
      if (mobileLinks[s]) mobileLinks[s].classList.toggle('nav-active', s === id);
    });
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });

  // Clear active when scrolled back to top
  window.addEventListener('scroll', () => {
    if (window.scrollY < 100) setActive(null);
  }, { passive: true });
})();

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
  // Focus the close button for accessibility
  setTimeout(() => mobileNavClose.focus(), 60);
}
function closeMobileNav() {
  mobileNav.classList.remove('active');
  mobileNavOverlay.classList.remove('active');
  menuToggle.classList.remove('active');
  menuToggle.setAttribute('aria-expanded','false');
  document.body.style.overflow = '';
  menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  mobileNav.classList.contains('active') ? closeMobileNav() : openMobileNav();
});
mobileNavClose.addEventListener('click', closeMobileNav);
mobileNavOverlay.addEventListener('click', closeMobileNav);
document.querySelectorAll('.mobile-link, .mobile-nav-resume-btn').forEach(a => a.addEventListener('click', closeMobileNav));

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
// If reduced motion, just show a static tagline
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  if (taglineEl) taglineEl.textContent = taglines[0];
} else {
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
} // end prefers-reduced-motion check

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

/* ─── PROJECT MODAL (redesigned) ───────────────────────────── */
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
    desc: 'Frame-by-frame character animation with expressive motion and personality — every frame drawn by hand, then composited with warmth and grain.',
    tags: ['Animation','2D','Tahoma2D','Frame-by-frame'],
    youtube: 'JgvbpIypir4',
    items: [
      { title: 'The Process', body: 'Each second of animation is roughly 12 hand-drawn frames. Characters are roughed in pencil, cleaned up with ink, then scanned and composited in Tahoma2D with a paper texture overlay.' },
      { title: 'Tools & Workflow', body: 'Pencil & paper for roughs → Tahoma2D for digital ink & compositing → exported as PNG sequences → final edit in DaVinci Resolve for colour grading.' },
    ],
    footerNote: '✦ Personal animation study',
    footerLink: 'https://www.youtube.com/watch?v=JgvbpIypir4',
    footerLinkText: 'Watch on YouTube ↗'
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
      'project/practice 5.jpg',
      'project/practice 6.jpg',
      'project/practice 7.jpg',
      'project/practice 8.jpg',
      'project/practice 9.jpg',
      'project/practice 10.jpg',
      'project/practice 11.jpg',
      'project/practice 12.jpg',
      'project/practice 13.jpg',
      'project/practice 14.jpg',
      'project/practice 15.jpg',
      'project/practice 16.jpg',
      'project/practice 17.jpg',
      'project/practice 18.jpg',
      'project/practice 19.jpg',
      'project/practice 20.jpg'
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

  // Populate header
  const typeLabel = d.panelType || 'Project';
  document.getElementById('projectTitle').textContent = d.title;
  document.getElementById('ppTitleMini').textContent = d.title;
  document.getElementById('projectDesc').textContent = d.desc;
  document.getElementById('projectPanelType').textContent = typeLabel;

  // Image count badge
  const countBadge = document.getElementById('projectImgCount');
  if (d.images && d.images.length) {
    countBadge.textContent = `✦ ${d.images.length} pieces`;
    countBadge.style.display = 'inline-flex';
  } else {
    countBadge.style.display = 'none';
  }

  const tagsEl = document.getElementById('projectTags');
  tagsEl.innerHTML = d.tags.map(t => `<span class="pp-tag">${t}</span>`).join('');

  /* ── media: youtube OR images ── */
  const mediaEl = document.getElementById('projectMedia');
  mediaEl.innerHTML = '';
  if (d.youtube) {
    const ytId = d.youtube;
    const ytUrl = `https://www.youtube.com/watch?v=${ytId}`;

    mediaEl.innerHTML = `
      <div class="project-yt-wrap" id="ytWrap">
        <!-- Filmstrip top -->
        <div class="yt-filmstrip-bar" aria-hidden="true">
          ${Array.from({length:14},()=>'<span class="yt-sprocket"></span>').join('')}
        </div>

        <!-- Thumbnail stage — click opens inline preview modal -->
        <div class="yt-thumb-stage" id="ytThumbStage" role="button" tabindex="0"
             aria-label="Preview Hand Drawn Animation">
          <img
            class="yt-thumb-img"
            src="https://img.youtube.com/vi/${ytId}/maxresdefault.jpg"
            alt="Hand Drawn Animation thumbnail"
            onerror="this.src='https://img.youtube.com/vi/${ytId}/hqdefault.jpg'"
          />
          <!-- Paper grain + line overlay -->
          <svg class="yt-hatch-overlay" viewBox="0 0 640 360" preserveAspectRatio="none"
               xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <filter id="ytGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch"/>
              <feColorMatrix type="saturate" values="0"/>
              <feBlend in="SourceGraphic" mode="multiply"/>
            </filter>
            <rect width="640" height="360" fill="#1a1510" opacity="0.28" filter="url(#ytGrain)"/>
            <g stroke="#e8ddd0" stroke-width="0.5" stroke-opacity="0.05">
              ${Array.from({length:18},(_,i)=>`<line x1="0" y1="${i*21}" x2="640" y2="${i*21}"/>`).join('')}
            </g>
            <text x="14" y="22" font-family="Caveat,cursive" font-size="11" fill="#d4693a" opacity="0.65">frame-by-frame ✦</text>
            <text x="626" y="350" font-family="Caveat,cursive" font-size="10" fill="#e8ddd0" text-anchor="end" opacity="0.4">Tahoma2D</text>
          </svg>
          <!-- Play button -->
          <div class="yt-play-ring" aria-hidden="true">
            <svg class="yt-play-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <!-- Sketch corner brackets -->
          <svg class="yt-corners" viewBox="0 0 100 100" preserveAspectRatio="none"
               xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M2 18 L2 2 L18 2" fill="none" stroke="#d4693a" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.8"/>
            <path d="M82 2 L98 2 L98 18" fill="none" stroke="#d4693a" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.8"/>
            <path d="M2 82 L2 98 L18 98" fill="none" stroke="#d4693a" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.8"/>
            <path d="M82 98 L98 98 L98 82" fill="none" stroke="#d4693a" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.8"/>
          </svg>
          <div class="yt-watch-label">▶ preview</div>
        </div>

        <!-- Filmstrip bottom -->
        <div class="yt-filmstrip-bar" aria-hidden="true">
          ${Array.from({length:14},()=>'<span class="yt-sprocket"></span>').join('')}
        </div>

        <!-- Meta bar -->
        <div class="yt-meta-bar">
          <span class="yt-meta-chip">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M6 3V13M10 3V13M1 6h14M1 10h14"/></svg>
            12 fps hand-drawn
          </span>
          <span class="yt-meta-chip">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
            frame-by-frame
          </span>
          <a class="yt-external-link" href="${ytUrl}" target="_blank" rel="noopener noreferrer" aria-label="Watch on YouTube">
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5V8.5l6.25 3.5-6.25 3.5z"/></svg>
            Watch on YouTube ↗
          </a>
        </div>
      </div>`;

    /* ── Inline video preview modal ── */
    // Create modal once and reuse
    let ytPreviewModal = document.getElementById('ytPreviewModal');
    if (!ytPreviewModal) {
      ytPreviewModal = document.createElement('div');
      ytPreviewModal.id = 'ytPreviewModal';
      ytPreviewModal.className = 'yt-preview-modal';
      ytPreviewModal.setAttribute('role', 'dialog');
      ytPreviewModal.setAttribute('aria-modal', 'true');
      ytPreviewModal.setAttribute('aria-label', 'Video preview');
      ytPreviewModal.innerHTML = `
        <div class="yt-preview-box">
          <!-- filmstrip top -->
          <div class="yt-preview-filmstrip" aria-hidden="true">
            ${Array.from({length:20},()=>'<span class="yt-sprocket"></span>').join('')}
          </div>
          <div class="yt-preview-header">
            <span class="yt-preview-title">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="color:#d4693a"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5V8.5l6.25 3.5-6.25 3.5z"/></svg>
              Hand Drawn Animation
            </span>
            <div class="yt-preview-header-actions">
              <a class="yt-preview-yt-btn" href="${ytUrl}" target="_blank" rel="noopener noreferrer">
                Watch on YouTube ↗
              </a>
              <button class="yt-preview-close" id="ytPreviewClose" aria-label="Close preview">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <div class="yt-preview-frame-wrap" id="ytPreviewFrameWrap">
            <!-- iframe injected on open -->
          </div>
          <!-- filmstrip bottom -->
          <div class="yt-preview-filmstrip" aria-hidden="true">
            ${Array.from({length:20},()=>'<span class="yt-sprocket"></span>').join('')}
          </div>
            <div class="yt-preview-footer">
              <span class="yt-preview-note">✦ Hand Drawn Animation &nbsp;·&nbsp; press Esc to close</span>
            </div>
        </div>`;
      document.body.appendChild(ytPreviewModal);
    }

    function openYtPreview() {
      const frameWrap = document.getElementById('ytPreviewFrameWrap');
      frameWrap.innerHTML = `
        <iframe
          id="ytPreviewIframe"
          src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1"
          title="Hand Drawn Animation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          loading="lazy"
        ></iframe>`;

      // If the iframe fires an error (blocked), swap in the fallback card
      const iframe = document.getElementById('ytPreviewIframe');
      iframe.addEventListener('error', showFallback);

      ytPreviewModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      document.getElementById('ytPreviewClose').focus();
    }

    function showFallback() {
      const frameWrap = document.getElementById('ytPreviewFrameWrap');
      if (!frameWrap) return;
      frameWrap.innerHTML = `
        <div class="yt-no-embed">
          <img class="yt-no-embed-bg"
            src="https://img.youtube.com/vi/${ytId}/maxresdefault.jpg" alt=""
            onerror="this.src='https://img.youtube.com/vi/${ytId}/hqdefault.jpg'"/>
          <div class="yt-no-embed-overlay"></div>
          <div class="yt-no-embed-content">
            <div class="yt-no-embed-icon">
              <svg viewBox="0 0 24 24" fill="white" width="38" height="38"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <p class="yt-no-embed-msg">Couldn't load the player.<br/>Watch directly on YouTube instead.</p>
            <a class="yt-no-embed-btn" href="${ytUrl}" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5V8.5l6.25 3.5-6.25 3.5z"/></svg>
              Watch on YouTube ↗
            </a>
          </div>
        </div>`;
    }

    function closeYtPreview() {
      ytPreviewModal.classList.remove('open');
      // Stop video by clearing iframe src
      const frameWrap = document.getElementById('ytPreviewFrameWrap');
      if (frameWrap) frameWrap.innerHTML = '';
      // Restore scroll only if project panel is also closed
      if (!panel.classList.contains('open')) document.body.style.overflow = '';
    }

    const stage = mediaEl.querySelector('#ytThumbStage');
    stage.addEventListener('click', openYtPreview);
    stage.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openYtPreview(); }
    });

    document.getElementById('ytPreviewClose').addEventListener('click', closeYtPreview);
    ytPreviewModal.addEventListener('click', e => {
      if (e.target === ytPreviewModal) closeYtPreview();
    });

    // ESC closes preview modal too — remove any previous listener first
    if (window._ytEscHandler) document.removeEventListener('keydown', window._ytEscHandler);
    window._ytEscHandler = function ytEsc(e) {
      if (e.key === 'Escape' && ytPreviewModal.classList.contains('open')) {
        closeYtPreview();
      }
    };
    document.addEventListener('keydown', window._ytEscHandler);
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
  // Reset scroll
  const ppScroll = document.getElementById('ppScroll');
  if (ppScroll) ppScroll.scrollTop = 0;
  panel.scrollTop = 0;
  // Move focus to close button for accessibility
  setTimeout(() => {
    const closeBtn = document.getElementById('projectClose');
    if (closeBtn) closeBtn.focus();
  }, 50);

  // Render project items + art-specific meta
  const itemsEl = document.getElementById('projectItems');
  itemsEl.innerHTML = '';

  if (d.artMeta) {
    const m = d.artMeta;
    itemsEl.innerHTML += `
      <div class="pp-meta-grid">
        <div class="pp-meta-chip">
          <div class="pp-meta-label">Medium</div>
          <div class="pp-meta-value">${m.medium}</div>
        </div>
        <div class="pp-meta-chip">
          <div class="pp-meta-label">Year</div>
          <div class="pp-meta-value">${m.year}</div>
        </div>
        <div class="pp-meta-chip">
          <div class="pp-meta-label">Style</div>
          <div class="pp-meta-value">${m.style}</div>
        </div>
        <div class="pp-meta-chip">
          <div class="pp-meta-label">Tools</div>
          <div class="pp-meta-value">${m.tools}</div>
        </div>
      </div>`;
  }

  if (d.process && d.process.length) {
    itemsEl.innerHTML += `
      <div class="pp-process">
        <div class="pp-process-label">Process</div>
        <div class="pp-process-steps">
          ${d.process.map((step, i) => `
            <div class="pp-process-step">
              <span class="pp-step-num">${i + 1}</span>
              <span class="pp-step-text">${step}</span>
            </div>`).join('')}
        </div>
      </div>`;
  }

  if (d.items && d.items.length) {
    itemsEl.innerHTML += `<div class="pp-items">` + d.items.map(item => `
      <div class="pp-item">
        <h4 class="pp-item-title">${item.title}</h4>
        <p class="pp-item-body">${item.body}</p>
      </div>`).join('') + `</div>`;
  }
  if (d.link) {
    itemsEl.innerHTML += `<a class="pp-project-link" href="${d.link}" target="_blank" rel="noopener">${d.linkText || 'View Project ↗'}</a>`;
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

  // Sticky topbar scroll shadow
  const ppScroll2 = document.getElementById('ppScroll');
  const topbar = document.getElementById('ppTopbar');
  if (ppScroll2 && topbar) {
    ppScroll2.onscroll = () => {
      topbar.classList.toggle('pp-topbar--shadowed', ppScroll2.scrollTop > 20);
    };
  }
}

function closeProject() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  panel.classList.remove('open');
  panel.setAttribute('aria-modal', 'false');
  // Only restore scroll if lightbox is also closed
  if (!document.getElementById('galleryLightbox').classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

/* ── Gallery render ── */
let galleryImages = [];
let galleryIndex = 0;

function renderGallery(images, container) {
  galleryImages = images;

  /* Build a coming-soon SVG placeholder (data URL) */
  const comingSoonSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240">
    <rect width="320" height="240" fill="#1a1510"/>
    <rect x="1" y="1" width="318" height="238" fill="none" stroke="rgba(232,221,208,0.15)" stroke-width="1.5" stroke-dasharray="6 4"/>
    <circle cx="160" cy="95" r="28" fill="none" stroke="rgba(212,105,58,0.4)" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="148" y1="83" x2="172" y2="107" stroke="rgba(212,105,58,0.4)" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="172" y1="83" x2="148" y2="107" stroke="rgba(212,105,58,0.4)" stroke-width="1.5" stroke-linecap="round"/>
    <text x="160" y="148" font-family="Caveat,cursive" font-size="18" fill="rgba(232,221,208,0.55)" text-anchor="middle">coming soon</text>
    <text x="160" y="170" font-family="Caveat,cursive" font-size="12" fill="rgba(212,105,58,0.5)" text-anchor="middle">✦ work in progress ✦</text>
  </svg>`;
  const comingSoonDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(comingSoonSVG);

  const thumbComingSoonSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 60" width="80" height="60">
    <rect width="80" height="60" fill="#1a1510"/>
    <rect x="1" y="1" width="78" height="58" fill="none" stroke="rgba(232,221,208,0.12)" stroke-width="1" stroke-dasharray="3 3"/>
    <line x1="30" y1="22" x2="50" y2="38" stroke="rgba(212,105,58,0.35)" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="50" y1="22" x2="30" y2="38" stroke="rgba(212,105,58,0.35)" stroke-width="1.2" stroke-linecap="round"/>
    <text x="40" y="52" font-family="Caveat,cursive" font-size="7" fill="rgba(232,221,208,0.4)" text-anchor="middle">soon</text>
  </svg>`;
  const thumbComingSoonDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(thumbComingSoonSVG);

  const thumbsHtml = images.map((src, i) =>
    `<div class="gallery-thumbstrip-item${i === 0 ? ' active' : ''}" data-idx="${i}">
      <img src="${src}" alt="Artwork ${i+1}"
        onerror="this.src='${thumbComingSoonDataUrl}';this.parentElement.classList.add('gallery-thumb--coming-soon');"
      />
      <span class="gallery-thumb-num">${i+1}</span>
    </div>`
  ).join('');

  const pipsHtml = images.map((_, i) =>
    `<button class="gallery-pip${i === 0 ? ' active' : ''}" data-idx="${i}" aria-label="Go to image ${i+1}"></button>`
  ).join('');

  const showPips = images.length <= 12;

  container.innerHTML = `
    <div class="gallery-hero-wrap">
      <img class="project-gallery-hero" id="galleryHero" src="${images[0]}" alt="Artwork"
        onerror="this.src='${comingSoonDataUrl}';this.closest('.gallery-hero-wrap').classList.add('gallery-hero--coming-soon');"
      />
      <button class="gallery-hero-arrow gallery-hero-prev" id="galleryHeroPrev" aria-label="Previous artwork">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="gallery-hero-arrow gallery-hero-next" id="galleryHeroNext" aria-label="Next artwork">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      ${showPips ? `<div class="gallery-pips" id="galleryPips">${pipsHtml}</div>` : ''}
      <div class="gallery-swipe-hint" aria-hidden="true">← swipe →</div>
    </div>
    <div class="gallery-thumbstrip" id="galleryThumbstrip">${thumbsHtml}</div>
    <div class="gallery-infobar" id="galleryInfobar" style="--gallery-progress:${(1/images.length*100).toFixed(1)}%">
      <span class="gallery-counter" id="galleryCounter">1 / ${images.length}</span>
      <button class="gallery-expand-btn" id="galleryExpandBtn" aria-label="Open fullscreen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
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

  /* ── Touch / swipe support ── */
  const heroWrap = container.querySelector('.gallery-hero-wrap');
  let _tsX = null;
  heroWrap.addEventListener('touchstart', e => { _tsX = e.touches[0].clientX; }, { passive: true });
  heroWrap.addEventListener('touchend', e => {
    if (_tsX === null) return;
    const dx = e.changedTouches[0].clientX - _tsX;
    if (Math.abs(dx) > 40) {
      const dir = dx < 0 ? 1 : -1;
      setGalleryImage((galleryIndex + dir + galleryImages.length) % galleryImages.length, container);
    }
    _tsX = null;
  }, { passive: true });

  /* ── Arrow-key navigation when panel is open (not in lightbox) ── */
  function galleryKeyHandler(e) {
    if (!document.getElementById('projectPanel').classList.contains('open')) return;
    if (document.getElementById('galleryLightbox').classList.contains('open')) return;
    if (e.key === 'ArrowRight') setGalleryImage((galleryIndex + 1) % galleryImages.length, container);
    if (e.key === 'ArrowLeft')  setGalleryImage((galleryIndex - 1 + galleryImages.length) % galleryImages.length, container);
  }
  document.removeEventListener('keydown', window._galleryKeyHandler);
  window._galleryKeyHandler = galleryKeyHandler;
  document.addEventListener('keydown', galleryKeyHandler);
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
      hero.closest('.gallery-hero-wrap')?.classList.remove('gallery-hero--coming-soon');
    };
    hero.onerror = () => {
      const comingSoonSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240"><rect width="320" height="240" fill="#1a1510"/><rect x="1" y="1" width="318" height="238" fill="none" stroke="rgba(232,221,208,0.15)" stroke-width="1.5" stroke-dasharray="6 4"/><circle cx="160" cy="95" r="28" fill="none" stroke="rgba(212,105,58,0.4)" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="148" y1="83" x2="172" y2="107" stroke="rgba(212,105,58,0.4)" stroke-width="1.5" stroke-linecap="round"/><line x1="172" y1="83" x2="148" y2="107" stroke="rgba(212,105,58,0.4)" stroke-width="1.5" stroke-linecap="round"/><text x="160" y="148" font-family="Caveat,cursive" font-size="18" fill="rgba(232,221,208,0.55)" text-anchor="middle">coming soon</text><text x="160" y="170" font-family="Caveat,cursive" font-size="12" fill="rgba(212,105,58,0.5)" text-anchor="middle">✦ work in progress ✦</text></svg>`;
      hero.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(comingSoonSVG);
      hero.style.transition = 'opacity 0.35s, transform 0.35s';
      hero.style.opacity = '1';
      hero.style.transform = 'scale(1)';
      hero.closest('.gallery-hero-wrap')?.classList.add('gallery-hero--coming-soon');
    };
  }
  // Update thumbstrip
  const thumbstrip = document.getElementById('galleryThumbstrip');
  document.querySelectorAll('.gallery-thumbstrip-item').forEach(t => {
    const isActive = parseInt(t.dataset.idx) === idx;
    t.classList.toggle('active', isActive);
    // Scroll active thumb into view
    if (isActive && thumbstrip) {
      const tLeft = t.offsetLeft - thumbstrip.clientWidth / 2 + t.clientWidth / 2;
      thumbstrip.scrollTo({ left: tLeft, behavior: 'smooth' });
    }
  });
  // Update pips
  document.querySelectorAll('.gallery-pip').forEach(p => {
    p.classList.toggle('active', parseInt(p.dataset.idx) === idx);
  });
  // Update counter
  const counter = document.getElementById('galleryCounter');
  if (counter) counter.textContent = `${idx + 1} / ${galleryImages.length}`;
  // Update progress bar
  const infobar = document.getElementById('galleryInfobar');
  if (infobar) infobar.style.setProperty('--gallery-progress', ((idx + 1) / galleryImages.length * 100).toFixed(1) + '%');
}

/* ── Lightbox with prev/next ── */
const lightbox = document.getElementById('galleryLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxDots = document.getElementById('lightboxDots');

function buildDots(total, current) {
  // Hide dot nav for large galleries — counter is enough
  if (total > 12) {
    lightboxDots.classList.add('hidden');
    return;
  }
  lightboxDots.classList.remove('hidden');
  lightboxDots.innerHTML = Array.from({length: total}, (_, i) =>
    `<button class="lightbox-dot${i === current ? ' active' : ''}" data-i="${i}" aria-label="Go to image ${i+1}"></button>`
  ).join('');
  lightboxDots.querySelectorAll('.lightbox-dot').forEach(dot => {
    dot.addEventListener('click', () => openLightbox(parseInt(dot.dataset.i)));
  });
}

/* ── Lightbox swipe support ── */
let _lbTsX = null;
lightbox.addEventListener('touchstart', e => { _lbTsX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  if (_lbTsX === null) return;
  const dx = e.changedTouches[0].clientX - _lbTsX;
  if (Math.abs(dx) > 45) lightboxNav(dx < 0 ? 1 : -1);
  _lbTsX = null;
}, { passive: true });

/* ── Inject keyboard hint into lightbox footer ── */
(function() {
  const lbFooter = document.querySelector('.lightbox-footer');
  if (lbFooter && !lbFooter.querySelector('.lightbox-kbd-hint')) {
    const hint = document.createElement('span');
    hint.className = 'lightbox-kbd-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = '← → to navigate · Esc to close';
    lbFooter.prepend(hint);
  }
})();

function openLightbox(idx) {
  galleryIndex = idx;
  lightboxImg.classList.remove('lb-fade');
  lightboxImg.onerror = () => {
    const cs = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240"><rect width="320" height="240" fill="#1a1510"/><rect x="1" y="1" width="318" height="238" fill="none" stroke="rgba(232,221,208,0.15)" stroke-width="1.5" stroke-dasharray="6 4"/><circle cx="160" cy="95" r="28" fill="none" stroke="rgba(212,105,58,0.4)" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="148" y1="83" x2="172" y2="107" stroke="rgba(212,105,58,0.4)" stroke-width="1.5" stroke-linecap="round"/><line x1="172" y1="83" x2="148" y2="107" stroke="rgba(212,105,58,0.4)" stroke-width="1.5" stroke-linecap="round"/><text x="160" y="148" font-family="Caveat,cursive" font-size="18" fill="rgba(232,221,208,0.55)" text-anchor="middle">coming soon</text><text x="160" y="170" font-family="Caveat,cursive" font-size="12" fill="rgba(212,105,58,0.5)" text-anchor="middle">✦ work in progress ✦</text></svg>`;
    lightboxImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cs);
  };
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
  const len = msgInput.value.length;
  charCount.textContent = len;
  // Warn when approaching limit
  const counter = charCount.closest ? charCount.closest('.char-counter') : charCount.parentElement;
  if (counter) counter.style.color = len > 450 ? 'var(--accent)' : '';
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if(!name) { document.getElementById('nameErr').textContent = '← name required'; document.getElementById('nameErr').classList.add('show'); valid = false; }
  if(!email || !emailRegex.test(email)) { document.getElementById('emailErr').textContent = '← valid email needed'; document.getElementById('emailErr').classList.add('show'); valid = false; }
  if(!msg) { document.getElementById('msgErr').textContent = '← say something!'; document.getElementById('msgErr').classList.add('show'); valid = false; }
  if(valid) {
    const btn = document.getElementById('contactSubmit');
    btn.textContent = 'Sent! ✦';
    btn.style.background = '#5ba08a';
    setTimeout(() => { btn.textContent = 'Send it ↗'; btn.style.background = ''; }, 3000);
  }
});


/* ─── THEME TOGGLE ─────────────────────────────────────────── */
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');
const mobileThemeLabel = mobileThemeToggle ? mobileThemeToggle.querySelector('.mobile-theme-label') : null;
const sunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>`;
const moonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
// Respect OS preference as fallback
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');
let lightMode = savedTheme ? savedTheme === 'light' : !prefersDark;
function applyTheme(light) {
  lightMode = light;
  document.body.classList.toggle('light-mode', lightMode);
  document.documentElement.style.colorScheme = lightMode ? 'light' : 'dark';
  localStorage.setItem('theme', lightMode ? 'light' : 'dark');
  // Update both desktop and mobile toggle icons
  const icon = lightMode ? moonIcon : sunIcon;
  if (themeToggle) themeToggle.innerHTML = icon;
  if (mobileThemeToggle) {
    const svgEl = mobileThemeToggle.querySelector('svg');
    if (svgEl) svgEl.outerHTML = icon; // swap icon inside mobile btn
    // Re-query after DOM change
    const newSvg = mobileThemeToggle.querySelector('svg');
    if (newSvg) newSvg.setAttribute('aria-hidden', 'true');
  }
  if (themeToggle) {
    themeToggle.title = lightMode ? 'Switch to dark' : 'Switch to light';
    themeToggle.setAttribute('aria-label', lightMode ? 'Switch to dark mode' : 'Switch to light mode');
  }
  if (mobileThemeLabel) mobileThemeLabel.textContent = lightMode ? 'Dark mode' : 'Light mode';
}
applyTheme(lightMode); // apply on load
if (themeToggle) themeToggle.addEventListener('click', () => applyTheme(!lightMode));
if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', () => applyTheme(!lightMode));

/* ─── FLOATING MUSIC TOGGLE ────────────────────────────────── */
const musicFloat = document.getElementById('musicFloat');
const bgMusic    = document.getElementById('bgMusic');
let   musicOn    = false;

function setMusic(play) {
  musicOn = play;
  if (play) {
    bgMusic.volume = 0.4;
    bgMusic.play().catch(() => {}); // silently handle autoplay block
    musicFloat.classList.add('playing');
    musicFloat.setAttribute('aria-label', 'Pause lo-fi music');
    musicFloat.title = 'Pause lo-fi music';
  } else {
    bgMusic.pause();
    musicFloat.classList.remove('playing');
    musicFloat.setAttribute('aria-label', 'Play lo-fi music');
    musicFloat.title = 'Play lo-fi music';
  }
}

musicFloat.addEventListener('click', () => setMusic(!musicOn));

// Pause when tab is hidden, resume when visible (if was playing)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (musicOn) bgMusic.pause();
  } else {
    if (musicOn) bgMusic.play().catch(() => {});
  }
});

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
  }
  if (lightbox.classList.contains('open')) {
    if (e.key === 'ArrowRight') lightboxNav(1);
    if (e.key === 'ArrowLeft')  lightboxNav(-1);
  }
});

/* ─── PAINT BRUSH CURSOR TRAIL ──────────────────────────────── */
(function() {
  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return; // skip on touch devices entirely
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
})();
/* Active nav tracking handled above near nav scroll setup */


/* ═══════════════════════════════════════════════════════════════
   UI/UX IMPROVEMENTS — JS
═══════════════════════════════════════════════════════════════ */


/* ── 1. TOAST NOTIFICATION SYSTEM ────────────────────────────── */
function showToast(msg, duration = 2400) {
  let toast = document.getElementById('aayu-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'aayu-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    // Positioning only — visual styles come from CSS #aayu-toast rule
    toast.style.cssText = [
      'position:fixed',
      'bottom:7rem',
      'left:50%',
      'transform:translateX(-50%) translateY(12px)',
      'z-index:10000',
      'pointer-events:none',
      'opacity:0',
      'transition:opacity 0.28s, transform 0.28s',
      'white-space:nowrap',
    ].join(';');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  void toast.offsetHeight;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(12px)';
  }, duration);
}


/* ── 2. KEYBOARD SHORTCUTS ───────────────────────────────────── */
//   T = toggle theme
//   H = scroll to top
document.addEventListener('keydown', (e) => {
  // Ignore when focus is inside a text field
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  if (e.key === 't' || e.key === 'T') {
    applyTheme(!lightMode);
    showToast(lightMode ? '☀️  Light mode' : '🌙  Dark mode');
  }
  if (e.key === 'h' || e.key === 'H') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});


/* ── 3. SKILL TAG STAGGER ON CARD HOVER ──────────────────────── */
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.querySelectorAll('.skill-tag').forEach((tag, i) => {
      tag.style.transitionDelay = `${i * 35}ms`;
      tag.style.transform = 'translateY(-2px)';
    });
  });
  card.addEventListener('mouseleave', () => {
    card.querySelectorAll('.skill-tag').forEach(tag => {
      tag.style.transitionDelay = '0ms';
      tag.style.transform = '';
    });
  });
});


/* ── 4. THUMB SHINE + OPEN BADGE — inject into each work card ── */
document.querySelectorAll('.work-thumb').forEach(thumb => {
  const shine = document.createElement('div');
  shine.className = 'work-thumb-shine';
  thumb.appendChild(shine);
});
// Inject "open" badge into each work card for click affordance
document.querySelectorAll('.work-card').forEach(card => {
  const badge = document.createElement('div');
  badge.className = 'work-open-badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.textContent = 'open ↗';
  card.appendChild(badge);
});


/* ── 5. CONTACT FORM LABEL — already present in HTML markup ─── */


/* ── 6. CONTACT FORM — mailto fallback + confetti ────────────── */
function burstConfetti() {
  const colors = ['#d4693a','#5ba08a','#9a5a8a','#e8ddd0','#d4693a','#e8963a'];
  for (let i = 0; i < 22; i++) {
    const dot = document.createElement('div');
    const size = 4 + Math.random() * 5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const cx = ((Math.random() - 0.5) * 200) + 'px';
    const cy = '-' + (50 + Math.random() * 90) + 'px';
    dot.style.cssText = [
      'position:fixed',
      'pointer-events:none',
      'z-index:10001',
      `width:${size}px`,
      `height:${size * (0.5 + Math.random() * 0.8)}px`,
      `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
      `background:${color}`,
      'left:50%',
      'bottom:5rem',
      `--cx:${cx}`,
      `--cy:${cy}`,
      'animation:confettiFly 0.9s ease-out forwards',
    ].join(';');
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 1000);
  }
}

// confettiFly @keyframes is defined in style.css — no need to inject again

const _submitBtn = document.getElementById('contactSubmit');
let _formSent = false;
if (_submitBtn) {
  _submitBtn.addEventListener('click', () => {
    setTimeout(() => {
      if (_submitBtn.textContent.includes('Sent') && !_formSent) {
        _formSent = true;
        burstConfetti();
        const name  = (document.getElementById('contactName')?.value  || '').trim();
        const email = (document.getElementById('contactEmail')?.value || '').trim();
        const msg   = (document.getElementById('contactMsg')?.value   || '').trim();
        const sub   = encodeURIComponent(`Hey Aayu — from ${name}`);
        const body  = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
        setTimeout(() => {
          window.open(`mailto:itsaayush.m@gmail.com?subject=${sub}&body=${body}`, '_blank');
          // Reset form fields after sending
          if (document.getElementById('contactName'))  document.getElementById('contactName').value = '';
          if (document.getElementById('contactEmail')) document.getElementById('contactEmail').value = '';
          if (document.getElementById('contactMsg'))   document.getElementById('contactMsg').value = '';
          if (charCount) charCount.textContent = '0';
          _formSent = false;
        }, 700);
      }
    }, 80);
  });
}


/* ── 7. DELAYED KEYBOARD SHORTCUT HINT ───────────────────────── */
// Only show if user hasn't scrolled (they're still on hero)
let _hintShown = false;
const _hintTimer = setTimeout(() => {
  if (!_hintShown && window.scrollY < 100) {
    showToast('Tip: press T to toggle theme ✦', 3000);
    _hintShown = true;
  }
}, 5000);
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    _hintShown = true; // cancel hint if user already scrolled
    clearTimeout(_hintTimer);
  }
}, { passive: true, once: true });


/* ─── LAZY IMAGE FADE-IN ──────────────────────────────────── */
// Fire loaded class on all lazy images after they load for CSS fade-in
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  if (img.complete) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
  }
});


/* ─── SYSTEM DARK MODE LISTENER ──────────────────────────── */
// Automatically track OS preference changes when no manual override
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('theme')) {
    applyTheme(!e.matches);
  }
});
