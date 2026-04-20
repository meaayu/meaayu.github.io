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

/* ── Scroll progress bar ────────────────────────────────────── */
const progressBar = document.getElementById("progress-bar");
let rafScheduled = false;

function updateProgress() {
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
const mobileOverlay = document.getElementById("mobileNavOverlay");
const mobileClose   = document.getElementById("mobileNavClose");
const mobileLinks   = mobileNav.querySelectorAll(".mobile-link");
let   lastFocus     = null;

function openMenu() {
  lastFocus = document.activeElement;
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.classList.add("active");
  mobileNav.classList.add("active");
  mobileNav.setAttribute("aria-hidden", "false");
  mobileOverlay.style.display = "block";
  requestAnimationFrame(() => mobileOverlay.classList.add("active"));
  document.body.style.overflow = "hidden";
  mobileNav.querySelector(".mobile-link")?.focus();
}

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.classList.remove("active");
  mobileNav.classList.remove("active");
  mobileNav.setAttribute("aria-hidden", "true");
  mobileOverlay.classList.remove("active");
  setTimeout(() => { mobileOverlay.style.display = "none"; }, 350);
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
mobileOverlay.addEventListener("click", closeMenu);
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

/* ── Custom cursor ───────────────────────────────────────────── */
const dot  = document.getElementById("cursor-dot");
const ring = document.getElementById("cursor-ring");

if (dot && ring && window.matchMedia("(hover: hover)").matches) {
  document.addEventListener("mousemove", e => {
    const x = e.clientX, y = e.clientY;
    document.body.classList.add("cursor-active");
    dot.style.left  = x + "px";
    dot.style.top   = y + "px";
    ring.style.left = x + "px";
    ring.style.top  = y + "px";
  }, { passive: true });

  document.querySelectorAll("a, button, .card, .tag, .btn").forEach(el => {
    el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  });

  document.addEventListener("click", e => {
    const r = document.createElement("div");
    r.className = "ink-ripple";
    r.style.cssText = `left:${e.clientX - 3}px;top:${e.clientY - 3}px`;
    document.body.appendChild(r);
    r.addEventListener("animationend", () => r.remove(), { once: true });
  });
}

/* ── 3D card tilt ────────────────────────────────────────────── */
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const dx   = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const dy   = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    card.style.transform = `perspective(700px) rotateX(${dy * -6}deg) rotateY(${dx * 6}deg) translateY(-4px)`;
    // Subtle shine overlay
    card.style.setProperty("--shine-x", `${(dx + 1) * 50}%`);
    card.style.setProperty("--shine-y", `${(dy + 1) * 50}%`);
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    card.style.removeProperty("--shine-x");
    card.style.removeProperty("--shine-y");
  });
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

/* ── Hero eyebrow typewriter ─────────────────────────────────── */
// LEFT decorative line is intentionally omitted here.
// Text color is controlled by updateRoleColors() above.
const eyebrow = document.querySelector(".hero-eyebrow");
if (eyebrow) {
  const text = eyebrow.textContent.trim();
  eyebrow.textContent = "";
  eyebrow.style.cssText = "opacity:1;animation:none";

  // ← LEFT line REMOVED (was: prefix span with width:28px, height:1px)

  const typed = document.createElement("span");
  typed.className = "eyebrow-typed";
  eyebrow.appendChild(typed);

  // Color is handled by CSS var(--accent) — don't override with inline styles
  eyebrow.style.fontWeight = "500";

  let i = 0;
  const type = () => {
    if (i < text.length) {
      typed.textContent += text[i++];
      setTimeout(type, 40 + Math.random() * 20);
    }
  };
  setTimeout(type, 400);
}

/* ── Magnetic buttons ────────────────────────────────────────── */
document.querySelectorAll(".btn, .nav-cta").forEach(btn => {
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

/* ── Back to top ─────────────────────────────────────────────── */
const backTop = document.getElementById("backTop");
if (backTop) {
  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

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
    // Update URL without jumping
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

/* ── Background ambient particles ────────────────────────────── */
(function () {
  const canvas = document.getElementById("bgParticles");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  let W, H, particles;

  function getColors() {
    const s = getComputedStyle(document.documentElement);
    return {
      accent:  s.getPropertyValue("--accent").trim()  || "#bf5430",
      accent2: s.getPropertyValue("--accent2").trim() || "#3d7265",
      muted:   s.getPropertyValue("--muted").trim()   || "#6a6158",
      ink:     s.getPropertyValue("--ink").trim()     || "rgba(26,24,21,0.16)",
    };
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // Shape types: circle, dot, cross (✦), ring, dash
  const SHAPES = ["circle", "dot", "cross", "ring", "dash"];

  function makeParticle(cols) {
    const colorArr = [cols.accent, cols.accent2, cols.muted];
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const isSmall = shape === "dot" || shape === "dash";
    return {
      x:       Math.random() * W,
      y:       Math.random() * H,
      r:       isSmall ? 1 + Math.random() * 1.5 : 2 + Math.random() * 3.5,
      dx:      (Math.random() - 0.5) * 0.18,
      dy:      -0.08 - Math.random() * 0.14,
      rot:     Math.random() * Math.PI * 2,
      drot:    (Math.random() - 0.5) * 0.006,
      opacity: 0.06 + Math.random() * 0.13,
      color:   colorArr[Math.floor(Math.random() * colorArr.length)],
      shape,
      life:    Math.random() * 400,
      maxLife: 350 + Math.random() * 500,
    };
  }

  function drawParticle(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.strokeStyle = p.color;
    ctx.fillStyle   = p.color;
    ctx.lineWidth   = 1;

    switch (p.shape) {
      case "circle":
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "dot":
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "ring":
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.lineWidth = 0.8;
        ctx.stroke();
        break;
      case "cross": {
        // ✦ 4-point sparkle
        const s = p.r * 2.2;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
        ctx.moveTo(0, -s); ctx.lineTo(0, s);
        // diagonal arms (shorter)
        const d = s * 0.5;
        ctx.moveTo(-d, -d); ctx.lineTo(d, d);
        ctx.moveTo(d, -d);  ctx.lineTo(-d, d);
        ctx.stroke();
        break;
      }
      case "dash": {
        const len = p.r * 3;
        ctx.lineWidth = 0.8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-len, 0);
        ctx.lineTo(len, 0);
        ctx.stroke();
        break;
      }
    }
    ctx.restore();
  }

  function init() {
    resize();
    const cols = getColors();
    // ~48 particles spread across full page
    particles = Array.from({ length: 48 }, () => makeParticle(cols));
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const cols   = getColors();

    particles.forEach((p, i) => {
      p.x   += p.dx;
      p.y   += p.dy;
      p.rot += p.drot;
      p.life++;

      const lifeRatio = p.life / p.maxLife;
      const fade = lifeRatio < 0.12
        ? lifeRatio / 0.12
        : lifeRatio > 0.78
        ? 1 - (lifeRatio - 0.78) / 0.22
        : 1;

      ctx.globalAlpha = p.opacity * fade * (isDark ? 0.75 : 0.55);
      drawParticle(p);

      // Respawn when out of bounds or life exhausted
      if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > W + 20) {
        const np = makeParticle(cols);
        // Respawn from bottom or side edges
        const edge = Math.random();
        if (edge < 0.6) { np.x = Math.random() * W; np.y = H + 10; }
        else if (edge < 0.8) { np.x = -10; np.y = Math.random() * H; np.dx = Math.abs(np.dx); }
        else { np.x = W + 10; np.y = Math.random() * H; np.dx = -Math.abs(np.dx); }
        np.life = 0;
        particles[i] = np;
      }
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  init();
  tick();

  let resizeRaf;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => resize());
  }, { passive: true });

  // Re-read colors on theme change
  document.documentElement.addEventListener("themechange", () => {
    const cols = getColors();
    particles.forEach(p => {
      const colorArr = [cols.accent, cols.accent2, cols.muted];
      p.color = colorArr[Math.floor(Math.random() * colorArr.length)];
    });
  });
})();


(function() {
  const canvas = document.getElementById("heroParticles");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  const hero = canvas.closest(".hero");
  let W, H, particles;

  const accent  = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#bf5430";
  const accent2 = getComputedStyle(document.documentElement).getPropertyValue("--accent2").trim() || "#3d7265";

  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1 + Math.random() * 2.5,
      dx: (Math.random() - 0.5) * 0.25,
      dy: -0.15 - Math.random() * 0.2,
      opacity: 0.15 + Math.random() * 0.35,
      color: Math.random() > 0.5 ? accent : accent2,
      shape: Math.random() > 0.7 ? "star" : "circle",
      life: 0,
      maxLife: 200 + Math.random() * 300,
    };
  }

  function drawStar(cx, cy, r) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * r * 2, Math.sin(angle) * r * 2);
    }
    ctx.restore();
  }

  function init() {
    resize();
    particles = Array.from({ length: 28 }, makeParticle);
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    particles.forEach((p, i) => {
      p.x += p.dx;
      p.y += p.dy;
      p.life++;

      const lifeRatio = p.life / p.maxLife;
      const fade = lifeRatio < 0.1 ? lifeRatio / 0.1 : lifeRatio > 0.8 ? 1 - (lifeRatio - 0.8) / 0.2 : 1;
      const alpha = p.opacity * fade * (isDark ? 0.6 : 0.45);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;

      if (p.shape === "star") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.beginPath();
        for (let j = 0; j < 4; j++) {
          const ang = (j / 4) * Math.PI * 2;
          if (j === 0) ctx.moveTo(Math.cos(ang) * p.r * 2.5, Math.sin(ang) * p.r * 2.5);
          else ctx.lineTo(Math.cos(ang) * p.r * 2.5, Math.sin(ang) * p.r * 2.5);
        }
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (p.life >= p.maxLife || p.y < -10 || p.x < -10 || p.x > W + 10) {
        particles[i] = makeParticle();
        particles[i].y = H + 10;
      }
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  init();
  tick();
  window.addEventListener("resize", () => { resize(); }, { passive: true });
})();

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
    title: "Short Film Animation",
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
  modal.classList.remove("active");
  setTimeout(() => {
    modal.style.display = "none";
    iframe.src = ""; // stop video
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
  projectPanel.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setTimeout(() => { projectOverlay.style.display = "none"; }, 400);
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

  // Copy email button
  const copyBtn = document.getElementById("copyEmailBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const email = copyBtn.querySelector(".copy-email-text")?.textContent?.trim();
      if (!email) return;
      navigator.clipboard.writeText(email).then(() => {
        copyBtn.classList.add("copied");
        announce("Email address copied!");
        setTimeout(() => copyBtn.classList.remove("copied"), 2000);
      }).catch(() => {
        // Fallback for older browsers
        const ta = document.createElement("textarea");
        ta.value = email;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        copyBtn.classList.add("copied");
        setTimeout(() => copyBtn.classList.remove("copied"), 2000);
      });
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
    submitBtn.textContent = "Sending…";
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
