/* ── Accessible announcements ────────────────────────────────── */
function announce(msg) {
  const el = document.getElementById("announcement");
  if (!el) return;
  el.textContent = "";
  requestAnimationFrame(() => { el.textContent = msg; });
}

/* ── Theme toggle ───────────────────────────────────────────── */
const html = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme, animate = false) {
  if (animate) {
    // Position ripple origin at the toggle button
    const rect = themeToggle.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    document.body.style.setProperty("--ripple-x", cx + "px");
    document.body.style.setProperty("--ripple-y", cy + "px");

    // Use View Transitions API if available
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        html.setAttribute("data-theme", theme);
        localStorage.setItem("aayu-theme", theme);
        updateRoleColors(theme);
      });
    } else {
      // Fallback: CSS ripple class
      document.body.classList.add("theme-switching");
      html.setAttribute("data-theme", theme);
      localStorage.setItem("aayu-theme", theme);
      updateRoleColors(theme);
      setTimeout(() => document.body.classList.remove("theme-switching"), 420);
    }
  } else {
    html.setAttribute("data-theme", theme);
    localStorage.setItem("aayu-theme", theme);
    updateRoleColors(theme);
  }
}

const savedTheme = localStorage.getItem("aayu-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
applyTheme(savedTheme || (prefersDark.matches ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next, true);
});

// Mobile nav theme toggle — mirrors the main toggle
const mobileThemeToggle = document.getElementById("mobileThemeToggle");
if (mobileThemeToggle) {
  mobileThemeToggle.addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next, true);
  });
}

// Auto-switch if OS theme changes and user has no saved preference
prefersDark.addEventListener("change", e => {
  if (!localStorage.getItem("aayu-theme")) {
    applyTheme(e.matches ? "dark" : "light");
  }
});

/* ── Role label color sync (Developer / Artist) ─────────────── */
// Targets elements with class .role-label (or .hero-eyebrow) and
// their sibling .role-line decorators — set in HTML as:
//   <span class="role-label">Developer</span>
//   <span class="role-label">Artist</span>
// Color: black in light mode, white in dark mode.
// The LEFT decorative line (::before / .role-line) is removed via JS
// by adding class "no-left-line" which your CSS should handle,
// OR this script strips inline left-border/left-line siblings directly.

function updateRoleColors(theme) {
  // Only targets explicit .role-label or [data-role] elements, not hero-eyebrow
  // which uses design token colors from CSS
  document.querySelectorAll(".role-label, [data-role], .role-tag").forEach(el => {
    const text = el.textContent.trim().toLowerCase();
    if (text.includes("developer") || text.includes("artist")) {
      const isDark = theme === "dark";
      el.style.color      = isDark ? "#ffffff" : "#000000";
      el.style.fontWeight = "400";
    }
  });
}

/* ── Remove left-side decorative lines from role labels ──────── */
function removeLeftLines() {
  document.querySelectorAll(".role-label, [data-role], .role-tag").forEach(el => {
    const prev = el.previousElementSibling;
    if (prev && (
      prev.classList.contains("role-line") ||
      prev.classList.contains("label-line")
    )) {
      prev.remove();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  removeLeftLines();
  updateRoleColors(html.getAttribute("data-theme") || "light");
});

/* ── Back to top (declare early so scroll handler can reference it) ── */
const backTop = document.getElementById("backTop");
if (backTop) {
  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ── Scroll progress bar ────────────────────────────────────── */
const progressBar = document.getElementById("progress-bar");
let rafScheduled = false;

function updateProgress() {
  if (!progressBar) { rafScheduled = false; return; }
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressBar.style.width = Math.min(pct, 100) + "%";
  rafScheduled = false;
}

/* ── Sticky nav ─────────────────────────────────────────────── */
const nav = document.getElementById("mainNav");
window.addEventListener("scroll", () => {
  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(() => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
      backTop?.classList.toggle("visible", window.scrollY > 500);
      updateProgress();
    });
  }
}, { passive: true });

/* ── Mobile nav ─────────────────────────────────────────────── */
const menuToggle    = document.getElementById("menuToggle");
const mobileNav     = document.getElementById("mobileNav");
const mobileOverlay = document.getElementById("mobileNavOverlay") || document.querySelector(".mobile-nav-overlay");
const mobileClose   = document.getElementById("mobileNavClose");
const mobileLinks   = mobileNav.querySelectorAll(".mobile-link");
let   lastFocus     = null;

function openMenu() {
  lastFocus = document.activeElement;
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.classList.add("active");
  mobileNav.classList.add("active");
  mobileNav.setAttribute("aria-hidden", "false");
  if (mobileOverlay) mobileOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
  mobileNav.querySelector(".mobile-link")?.focus();
}

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.classList.remove("active");
  mobileNav.classList.remove("active");
  mobileNav.setAttribute("aria-hidden", "true");
  if (mobileOverlay) mobileOverlay.classList.remove("active");
  document.body.style.overflow = "";
  lastFocus?.focus();
}

// Trap focus inside mobile nav when open
mobileNav.addEventListener("keydown", e => {
  if (e.key !== "Tab") return;
  const focusable = [...mobileNav.querySelectorAll(
    'a, button, [tabindex]:not([tabindex="-1"])'
  )].filter(el => !el.disabled);
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  }
});

menuToggle.addEventListener("click", () =>
  mobileNav.classList.contains("active") ? closeMenu() : openMenu()
);
mobileClose.addEventListener("click", closeMenu);
mobileLinks.forEach(l => l.addEventListener("click", closeMenu));
mobileOverlay?.addEventListener("click", closeMenu);
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && mobileNav.classList.contains("active")) closeMenu();
});

/* ── Sketchy border sync ─────────────────────────────────────── */
function syncSketchy() {
  document.querySelectorAll(".sk-wrap").forEach(el => {
    const w = el.offsetWidth, h = el.offsetHeight;
    el.querySelectorAll(".sk-svg").forEach(svg => {
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.setAttribute("width",  w);
      svg.setAttribute("height", h);
      const r = svg.querySelector("rect");
      if (r) {
        r.setAttribute("x",      2);
        r.setAttribute("y",      2);
        r.setAttribute("width",  Math.max(0, w - 4));
        r.setAttribute("height", Math.max(0, h - 4));
      }
    });
  });
}

syncSketchy();

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(syncSketchy, 120);
}, { passive: true });

/* ── Scroll reveal ───────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      revealObserver.unobserve(e.target);
      setTimeout(syncSketchy, 700);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
document.querySelectorAll("h2").forEach(el => revealObserver.observe(el));

/* ── Stats entrance ──────────────────────────────────────────── */
const statsEl = document.querySelector(".stats");
if (statsEl) {
  new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
  }, { threshold: 0.3 }).observe(statsEl);
}

/* ── Animated number counter for stats ──────────────────────── */
function animateCount(el, target, duration = 500) {
  const start     = performance.now();
  const isDecimal = String(target).includes(".");
  const from      = 0;
  const update    = now => {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const val      = from + (target - from) * eased;
    el.textContent = isDecimal ? val.toFixed(1) : Math.floor(val);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el  = e.target;
    const raw = parseFloat(el.dataset.count ?? el.textContent);
    if (!isNaN(raw)) animateCount(el, raw);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll("[data-count], .stat-num, .stat-number").forEach(el => {
  const raw = parseFloat(el.dataset.count ?? el.textContent);
  if (!isNaN(raw)) {
    el.dataset.count = raw;
    el.textContent   = "0";
    counterObserver.observe(el);
  }
});





/* ── Hero art parallax ───────────────────────────────────────── */
const heroArt = document.querySelector(".hero-art");
if (heroArt && window.matchMedia("(hover: hover)").matches) {
  document.addEventListener("mousemove", e => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 14;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
    heroArt.style.transform = `translate(${x}px, ${y}px)`;
  }, { passive: true });
}



/* ── Magnetic buttons ────────────────────────────────────────── */
document.querySelectorAll(".btn:not(.nav-cta)").forEach(btn => {
  btn.addEventListener("mousemove", e => {
    const r  = btn.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) * 0.25;
    const dy = (e.clientY - r.top  - r.height / 2) * 0.25;
    btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-3px) rotate(-0.7deg)`;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});

/* ── Skill bar animation ─────────────────────────────────────── */
const skillsBelt = document.querySelector(".skills-grid");
if (skillsBelt) {
  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll(".skill-bar-fill").forEach((bar, i) => {
          setTimeout(() => {
            bar.style.width = (bar.dataset.w || 0) + "%";
            // Reveal percentage label after bar animates
            const pct = bar.closest(".skill-bar-row")?.querySelector(".skill-bar-pct");
            if (pct) {
              setTimeout(() => { pct.style.opacity = "0.75"; }, 600);
            }
          }, i * 80);
        });
        barObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  barObserver.observe(skillsBelt);
}

/* ── Active nav link on scroll ───────────────────────────────── */
const sections   = document.querySelectorAll("section[id], header[id]");
const navLinks   = document.querySelectorAll(".nav-links a[href^='#']");

let currentActive = null;

const activeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      if (currentActive === id) return;
      currentActive = id;
      navLinks.forEach(a => {
        a.classList.toggle("nav-active", a.getAttribute("href") === `#${id}`);
      });
    }
  });
}, {
  rootMargin: "-40% 0px -55% 0px",
  threshold: 0
});

sections.forEach(s => activeObserver.observe(s));

/* ── Smooth anchor scroll ────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    // Update URL without jumping (replaceState avoids polluting history)
    history.pushState(null, "", a.getAttribute("href"));
  });
});

/* ── Lazy-load images ────────────────────────────────────────── */
if ("loading" in HTMLImageElement.prototype) {
  document.querySelectorAll("img[data-src]").forEach(img => {
    img.src = img.dataset.src;
  });
} else {
  const lazyObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.target.dataset.src) {
        e.target.src = e.target.dataset.src;
        lazyObserver.unobserve(e.target);
      }
    });
  });
  document.querySelectorAll("img[data-src]").forEach(img => lazyObserver.observe(img));
}

/* ── Reduced-motion respect ──────────────────────────────────── */
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("reduced-motion");
}






/* ── Project detail modal ────────────────────────────────────── */
const projects = {
  1: {
    title: "Interactive Portfolio Site",
    desc: "A hand-crafted web experience merging sketchy aesthetics with smooth interactions.",
    tags: ["Web Dev", "UI/UX", "React"],
    items: [
      {
        name: "Personal Portfolio v1",
        preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='340'%3E%3Crect width='600' height='340' fill='%23bf5430'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%23fff' opacity='0.8'%3EPortfolio v1%3C/text%3E%3C/svg%3E",
        link: "#",
      },
      {
        name: "Client Showcase Page",
        preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='340'%3E%3Crect width='600' height='340' fill='%233d7265'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%23fff' opacity='0.8'%3EClient Showcase%3C/text%3E%3C/svg%3E",
        link: "#",
      },
      {
        name: "Design System UI",
        preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='340'%3E%3Crect width='600' height='340' fill='%231a1815'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%23fff' opacity='0.8'%3EDesign System%3C/text%3E%3C/svg%3E",
        link: "#",
      },
    ],
  },
  2: {
    title: "Hand Drawn Animation",
    desc: "Hand-drawn 2D animation exploring motion, emotion, and negative space.",
    tags: ["Animation", "Storyboarding"],
    items: [
      {
        name: "Frame Study — Loop",
        preview: "https://img.youtube.com/vi/JgvbpIypir4/hqdefault.jpg",
        link: "https://youtu.be/JgvbpIypir4?si=tXsfJr3ySPf_kNLm",
        type: "youtube",
      },
      {
        name: "Character Walk Cycle",
        preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='340'%3E%3Crect width='600' height='340' fill='%233d7265'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%23fff' opacity='0.8'%3EWalk Cycle%3C/text%3E%3C/svg%3E",
        link: "#",
      },
    ],
  },
  3: {
    title: "Brand Identity System",
    desc: "Complete visual identity including logo, type system, color palette, and usage guidelines.",
    tags: ["Graphic Design", "Branding"],
    items: [
      {
        name: "Logo & Wordmark",
        preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='340'%3E%3Crect width='600' height='340' fill='%23bf5430'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%23fff' opacity='0.8'%3ELogo System%3C/text%3E%3C/svg%3E",
        link: "#",
      },
      {
        name: "Color & Type Guide",
        preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='340'%3E%3Crect width='600' height='340' fill='%233d7265'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%23fff' opacity='0.8'%3EType & Color%3C/text%3E%3C/svg%3E",
        link: "#",
      },
      {
        name: "Brand Usage Sheet",
        preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='340'%3E%3Crect width='600' height='340' fill='%231a1815'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%23fff' opacity='0.8'%3EBrand Sheet%3C/text%3E%3C/svg%3E",
        link: "#",
      },
    ],
  },
  4: {
    title: "Art Showcase",
    desc: "A curated collection of original illustrations, sketches, and mixed-media artwork spanning character design, environments, and experimental pieces.",
    tags: ["Illustration", "Concept Art", "Mixed Media"],
    items: [
      {
        name: "Character Illustrations",
        preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='340'%3E%3Crect width='600' height='340' fill='%23bf5430'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%23fff' opacity='0.8'%3ECharacter Art%3C/text%3E%3C/svg%3E",
        link: "#",
      },
      {
        name: "Environment Sketches",
        preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='340'%3E%3Crect width='600' height='340' fill='%233d7265'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%23fff' opacity='0.8'%3EEnvironments%3C/text%3E%3C/svg%3E",
        link: "#",
      },
      {
        name: "Mixed Media Experiments",
        preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='340'%3E%3Crect width='600' height='340' fill='%231a1815'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%23fff' opacity='0.8'%3EMixed Media%3C/text%3E%3C/svg%3E",
        link: "#",
      },
    ],
  },
};

const projectOverlay = document.getElementById("projectOverlay");
const projectPanel   = document.getElementById("projectPanel");
const projectClose   = document.getElementById("projectClose");

function extractYTId(url) {
  const match = url.match(/(?:youtu\.be\/|v=|\/v\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

function openYTPlayer(ytId, title) {
  window.open(`https://www.youtube.com/watch?v=${ytId}`, "_blank", "noopener,noreferrer");
}

function closeYTPlayer() {
  const modal = document.getElementById("ytModal");
  const iframe = document.getElementById("ytIframe");
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  setTimeout(() => {
    modal.style.display = "none";
    if (iframe) iframe.src = ""; // stop video
  }, 300);
}

function openProject(id) {
  const p = projects[id];
  if (!p) return;

  // Tags
  document.getElementById("projectTags").innerHTML =
    p.tags.map(t => `<span class="tag">${t}</span>`).join("");

  // Title & desc
  document.getElementById("projectTitle").textContent = p.title;
  document.getElementById("projectDesc").textContent  = p.desc;

  // Sub-project grid
  document.getElementById("projectItems").innerHTML = p.items.map(item => {
    const isYT = item.type === "youtube";
    const ytId  = isYT ? extractYTId(item.link) : null;

    const previewHtml = isYT
      ? `<div class="pitem-preview pitem-yt" data-ytid="${ytId}" data-ytlink="${item.link}" role="button" tabindex="0" aria-label="Watch ${item.name} on YouTube">
           <img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" alt="${item.name}" loading="lazy" />
           <span class="pitem-play">
             <svg viewBox="0 0 68 48" aria-hidden="true"><path d="M66.5 7.6C65.7 4.7 63.3 2.4 60.4 1.6 55.1 0 34 0 34 0S12.9 0 7.6 1.6C4.7 2.4 2.4 4.7 1.6 7.6 0 12.9 0 24s1.6 11.1 1.6 16.4C2.4 43.3 4.7 45.6 7.6 46.4 12.9 48 34 48 34 48s21.1 0 26.4-1.6c2.9-.8 5.2-3.1 6-6C68 35.1 68 24 68 24s0-11.1-1.5-16.4z" fill="#ff0000"/><path d="M27 34l18-10-18-10v20z" fill="#fff"/></svg>
             <span class="pitem-play-label">Watch on YouTube ↗</span>
           </span>
         </div>`
      : `<div class="pitem-preview">
           <img src="${item.preview}" alt="${item.name}" loading="lazy" />
         </div>`;

    const linkHtml = item.link !== "#"
      ? `<a class="pitem-link" href="${item.link}" target="_blank" rel="noopener noreferrer">${isYT ? "YouTube ↗" : "View ↗"}</a>`
      : `<span class="pitem-link" style="opacity:0.3">Soon</span>`;

    return `
      <div class="pitem">
        ${previewHtml}
        <div class="pitem-footer">
          <span class="pitem-name">${item.name}</span>
          ${linkHtml}
        </div>
      </div>`;
  }).join("");

  // Attach click handlers for inline YouTube player
  document.querySelectorAll(".pitem-yt[data-ytid]").forEach(el => {
    const play = () => openYTPlayer(el.dataset.ytid, el.querySelector("img")?.alt || "");
    el.addEventListener("click", play);
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); } });
  });

  // Show
  projectOverlay.style.display = "block";
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
    projectOverlay.classList.add("active");
    projectPanel.classList.add("active");
  });
  projectPanel.setAttribute("aria-hidden", "false");
  projectClose.focus();
  announce(`Viewing ${p.title}`);
}

function closeProject() {
  projectOverlay.classList.remove("active");
  projectPanel.classList.remove("active");
  projectPanel.classList.add("closing");
  projectPanel.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setTimeout(() => {
    projectPanel.classList.remove("closing");
    projectOverlay.style.display = "none";
  }, 300);
  announce("Project closed");
}

document.querySelectorAll(".work-card[data-project]").forEach(card => {
  card.addEventListener("click", () => openProject(card.dataset.project));
  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openProject(card.dataset.project);
    }
  });
});

projectClose.addEventListener("click", closeProject);
projectOverlay.addEventListener("click", closeProject);
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (document.getElementById("ytModal")?.classList.contains("active")) closeYTPlayer();
    else if (projectPanel.classList.contains("active")) closeProject();
  }
});

document.getElementById("ytClose")?.addEventListener("click", closeYTPlayer);
document.getElementById("ytModal")?.addEventListener("click", e => {
  if (e.target === e.currentTarget) closeYTPlayer();
});

/* ── Contact form ────────────────────────────────────────────── */
(function() {
  const pills = document.querySelectorAll(".subj-pill");
  let selectedSubject = "Web Project";

  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      selectedSubject = pill.dataset.value;
    });
  });

  const nameInput  = document.getElementById("contactName");
  const emailInput = document.getElementById("contactEmail");
  const msgInput   = document.getElementById("contactMsg");
  const submitBtn  = document.getElementById("contactSubmit");
  const charCount  = document.getElementById("charCount");
  const charCounter = charCount?.closest(".char-counter");

  // Character counter
  if (msgInput && charCount) {
    msgInput.addEventListener("input", () => {
      const len = msgInput.value.length;
      charCount.textContent = len;
      if (charCounter) {
        charCounter.classList.toggle("warn", len > 420);
      }
    });
  }



  function validate() {
    let ok = true;
    document.getElementById("nameErr").textContent = "";
    document.getElementById("emailErr").textContent = "";
    document.getElementById("msgErr").textContent = "";
    nameInput?.classList.remove("error");
    emailInput?.classList.remove("error");
    msgInput?.classList.remove("error");

    if (!nameInput?.value.trim()) {
      document.getElementById("nameErr").textContent = "Name is required.";
      nameInput?.classList.add("error");
      ok = false;
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(emailInput?.value ?? "")) {
      document.getElementById("emailErr").textContent = "Enter a valid email.";
      emailInput?.classList.add("error");
      ok = false;
    }
    if ((msgInput?.value.trim().length ?? 0) < 10) {
      document.getElementById("msgErr").textContent = "Message must be at least 10 characters.";
      msgInput?.classList.add("error");
      ok = false;
    }
    return ok;
  }

  submitBtn?.addEventListener("click", () => {
    if (!validate()) return;
    // Simulate async send
    const origHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = "Sending… <svg class=\"sk-svg\" aria-hidden=\"true\"><rect class=\"acc\" rx=\"4\"/></svg>";
    submitBtn._origHTML = origHTML;
    submitBtn.classList.add("sending");
    submitBtn.disabled = true;
    setTimeout(() => {
      submitBtn.classList.remove("sending");
      document.getElementById("contactFormInner").style.display = "none";
      const success = document.getElementById("formSuccess");
      if (success) success.hidden = false;
      announce("Message sent successfully!");
    }, 900);
  });
})();

/* ── Work category filters ───────────────────────────────────── */
(function() {
  const filters  = document.querySelectorAll(".work-filter");
  const cards    = document.querySelectorAll(".work-card[data-category]");
  if (!filters.length || !cards.length) return;

  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      // Update active state
      filters.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const active = btn.dataset.filter;

      cards.forEach(card => {
        const cat = card.dataset.category || "";
        const show = active === "all" || cat === active;

        if (show) {
          delete card.dataset.hidden;
          card.classList.remove("filter-in");
          // Force reflow then animate in
          void card.offsetWidth;
          card.classList.add("filter-in");
          // Clean up animation class after it plays
          setTimeout(() => card.classList.remove("filter-in"), 350);
        } else {
          card.dataset.hidden = "1";
        }
      });

      // Re-sync sketchy borders after layout change
      setTimeout(syncSketchy, 360);
      announce(`Showing ${active === "all" ? "all work" : active + " projects"}`);
    });
  });
})();

/* ── Hero art: trigger draw animations when in view ─────────── */
(function() {
  const art = document.querySelector(".hero-art");
  if (!art) return;

  // Set initial stroke-dashoffset on elements that need it
  art.querySelectorAll(".hero-draw").forEach(el => {
    const dash = el.style.strokeDasharray || el.getAttribute("stroke-dasharray") || "230";
    el.style.strokeDashoffset = dash;
  });
  art.querySelectorAll(".hero-fadein").forEach(el => {
    el.style.opacity = "0";
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      // Trigger CSS animations by removing inline overrides
      art.querySelectorAll(".hero-draw").forEach(el => {
        el.style.animation = "";
      });
      art.querySelectorAll(".hero-fadein").forEach(el => {
        el.style.animation = "";
      });
      observer.unobserve(art);
    });
  }, { threshold: 0.2 });

  observer.observe(art);
})();

/* ── Keyboard navigation: skip-to-content ────────────────────── */
(function() {
  // Add a skip link dynamically if not already present
  if (!document.getElementById("skip-link")) {
    const skip = document.createElement("a");
    skip.id = "skip-link";
    skip.href = "#skills"; /* #skills = first content section after nav */
    skip.textContent = "Skip to main content";
    skip.setAttribute("aria-label", "Skip navigation and go to main content");
    skip.style.cssText = [
      "position:fixed", "top:-100%", "left:1rem", "z-index:9999",
      "background:var(--accent)", "color:#fff", "padding:0.5rem 1rem",
      "border-radius:0 0 8px 8px", "font-family:DM Sans,sans-serif",
      "font-size:0.85rem", "font-weight:600", "text-decoration:none",
      "transition:top 0.2s"
    ].join(";");
    skip.addEventListener("focus", () => { skip.style.top = "0"; });
    skip.addEventListener("blur",  () => { skip.style.top = "-100%"; });
    document.body.prepend(skip);
  }
})();

/* ── Animate hero badge on load ─────────────────────────────── */
(function() {
  const badge = document.querySelector(".hero-art-badge");
  if (!badge) return;
  badge.style.opacity = "0";
  badge.style.transform = "rotate(-3deg) scale(0.7)";
  setTimeout(() => {
    badge.style.transition = "opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
    badge.style.opacity = "1";
    badge.style.transform = "rotate(-3deg) scale(1)";
  }, 900);
})();

/* ── Subtle parallax on section headings ─────────────────────── */
(function() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const headings = document.querySelectorAll("section h2");
  window.addEventListener("scroll", () => {
    headings.forEach(h => {
      const rect = h.getBoundingClientRect();
      const mid = window.innerHeight / 2;
      const offset = ((rect.top - mid) / mid) * 5;
      h.style.transform = h.classList.contains("in")
        ? `translateY(${offset}px)`
        : "translateY(14px)";
    });
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   ✦ ENHANCEMENTS
   ═══════════════════════════════════════════════════════════════ */

/* cursor removed */

/* ── TYPEWRITER EFFECT on hero tagline sub ───────────────────── */
(function() {
  const el = document.querySelector(".hero-tagline-sub");
  if (!el) return;
  const phrases = ["Code × Art × Motion", "Developer & Artist", "Based in Nepal ✦", "Let's build something ↗"];
  let pi = 0, ci = 0, deleting = false, wait = 0;

  const cursor = document.createElement("span");
  cursor.className = "typewriter-cursor";

  const textNode = document.createTextNode("");
  el.textContent = "";
  el.appendChild(textNode);
  el.appendChild(cursor);

  function tick() {
    if (wait > 0) { wait--; setTimeout(tick, 80); return; }
    const phrase = phrases[pi];
    if (!deleting) {
      textNode.textContent = phrase.slice(0, ci + 1);
      ci++;
      if (ci === phrase.length) { deleting = true; wait = 22; setTimeout(tick, 80); return; }
    } else {
      textNode.textContent = phrase.slice(0, ci - 1);
      ci--;
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; wait = 5; setTimeout(tick, 80); return; }
    }
    setTimeout(tick, deleting ? 42 : 68);
  }

  setTimeout(tick, 1200);
})();

/* tilt removed */

/* ── ACTIVE NAV LINK HIGHLIGHT — handled by activeObserver above ── */

/* ── STAT COUNT-UP — handled by counterObserver above ── */

/* ── SKILL CARD STAGGER DELAYS ───────────────────────────────── */
(function() {
  document.querySelectorAll(".skills-grid .skill-card").forEach((card, i) => {
    card.style.setProperty("--d", i);
  });
})();
