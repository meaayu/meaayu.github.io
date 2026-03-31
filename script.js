// ── Canvas background ──
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let mouse = { x: -9999, y: -9999 };

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
window.addEventListener("resize", resize);

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("mouseleave", () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

// ── Particles ──
const PARTICLE_COUNT = 180;
const MOUSE_RADIUS = 160;
const CONNECTION_DIST = 180;

const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  vx: (Math.random() - 0.5) * 0.18,
  vy: (Math.random() - 0.5) * 0.18,
  r: Math.random() * 1.2 + 0.3,
  a: Math.random() * 0.15 + 0.04,
  rx: 0,
  ry: 0,
}));

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    p.x += p.vx + p.rx;
    p.y += p.vy + p.ry;

    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    // Mouse repulsion
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MOUSE_RADIUS && dist > 0) {
      const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
      const angle = Math.atan2(dy, dx);
      p.rx += Math.cos(angle) * force * 0.6;
      p.ry += Math.sin(angle) * force * 0.6;
    }

    p.rx *= 0.88;
    p.ry *= 0.88;

    // Glow near mouse
    const distToMouse = Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2);
    const glow =
      distToMouse < MOUSE_RADIUS
        ? p.a + (1 - distToMouse / MOUSE_RADIUS) * 0.5
        : p.a;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(56,189,248,${Math.min(glow, 0.9)})`;
    ctx.fill();
  });

  // Connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONNECTION_DIST) {
        const aDist = Math.sqrt((a.x - mouse.x) ** 2 + (a.y - mouse.y) ** 2);
        const bDist = Math.sqrt((b.x - mouse.x) ** 2 + (b.y - mouse.y) ** 2);
        const nearMouse = Math.min(aDist, bDist) < MOUSE_RADIUS;
        const alpha = (1 - dist / CONNECTION_DIST) * (nearMouse ? 0.35 : 0.08);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
        ctx.lineWidth = nearMouse ? 0.8 : 0.4;
        ctx.stroke();
      }
    }
  }

  // Mouse glow
  if (mouse.x > 0) {
    const gradient = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      0,
      mouse.x,
      mouse.y,
      MOUSE_RADIUS,
    );
    gradient.addColorStop(0, "rgba(56,189,248,0.07)");
    gradient.addColorStop(1, "rgba(56,189,248,0)");
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

draw();

// ── Scroll reveal ──
document.querySelectorAll(".reveal").forEach((el) => {
  new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) el.classList.add("on");
    },
    { threshold: 0.15 },
  ).observe(el);
});
