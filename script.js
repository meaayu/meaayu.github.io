/* ── Theme toggle ───────────────────────────────────────────── */
const html = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("aayu-theme", theme);
  updateRoleColors(theme);
}

const savedTheme = localStorage.getItem("aayu-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
applyTheme(savedTheme || (prefersDark.matches ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
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
  const isDark = theme === "dark";
  const color  = isDark ? "#ffffff" : "#000000";

  // Targets role labels containing "developer" or "artist" (case-insensitive)
  document.querySelectorAll(
    ".role-label, .hero-eyebrow, [data-role], .role-tag"
  ).forEach(el => {
    const text = el.textContent.trim().toLowerCase();
    if (text.includes("developer") || text.includes("artist")) {
      el.style.color      = color;
      el.style.fontWeight = "400"; // lighter weight

      // Also color any sibling/child line elements
      el.querySelectorAll(".role-line, .label-line").forEach(line => {
        line.style.background = color;
      });

      const prev = el.previousElementSibling;
      if (prev && (
        prev.classList.contains("role-line") ||
        prev.classList.contains("label-line") ||
        prev.tagName === "HR"
      )) {
        prev.style.background = color;
        prev.style.borderColor = color;
      }
    }
  });
}

/* ── Remove left-side line from Developer / Artist labels ────── */
// Strips the FIRST (leftmost) decorative line element that sits
// immediately before a .role-label. Keeps only the right-side or
// trailing line if one exists.
function removeLeftLines() {
  document.querySelectorAll(
    ".role-label, .hero-eyebrow, [data-role], .role-tag"
  ).forEach(el => {
    const text = el.textContent.trim().toLowerCase();
    if (!text.includes("developer") && !text.includes("artist")) return;

    // Remove leading inline line-span siblings
    const prev = el.previousElementSibling;
    if (prev && (
      prev.classList.contains("role-line") ||
      prev.classList.contains("label-line") ||
      (prev.tagName === "SPAN" && prev.getAttribute("aria-hidden") === "true")
    )) {
      prev.remove();
    }

    // Remove inner leading line children (first child that is a line span)
    const firstChild = el.firstElementChild;
    if (firstChild && (
      firstChild.classList.contains("role-line") ||
      firstChild.classList.contains("label-line") ||
      (getComputedStyle(firstChild).height === "1px") ||
      (firstChild.style.height === "1px")
    )) {
      firstChild.remove();
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
function animateCount(el, target, duration = 1400) {
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

document.querySelectorAll("[data-count], .stat-number").forEach(el => {
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

  // Apply initial color + weight based on current theme
  const currentTheme = html.getAttribute("data-theme") || "light";
  eyebrow.style.color      = currentTheme === "dark" ? "#ffffff" : "#000000";
  eyebrow.style.fontWeight = "400";

  let i = 0;
  const type = () => {
    if (i < text.length) {
      typed.textContent += text[i++];
      setTimeout(type, 40 + Math.random() * 20);
    }
  };
  setTimeout(type, 400);
}

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
