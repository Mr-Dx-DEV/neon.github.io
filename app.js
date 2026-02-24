// ===== Mobile nav =====
const navBtn = document.getElementById("navBtn");
const nav = document.getElementById("nav");

navBtn?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navBtn.setAttribute("aria-expanded", open ? "true" : "false");
});

// Close nav when clicking a link (mobile)
nav?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => nav.classList.remove("open"));
});

// ===== Year =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Reveal animations (IntersectionObserver) =====
const reveals = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");

      // Animate progress bars only when visible
      e.target.querySelectorAll(".bar__fill").forEach(fill => {
        const w = fill.style.width;
        fill.style.width = "0%";
        requestAnimationFrame(() => (fill.style.width = w));
      });

      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach((el) => io.observe(el));

// ===== Parallax portrait (subtle) =====
const portrait = document.getElementById("portrait");
let mx = 0, my = 0;
window.addEventListener("mousemove", (e) => {
  mx = (e.clientX / window.innerWidth - 0.5);
  my = (e.clientY / window.innerHeight - 0.5);
  if (!portrait) return;
  portrait.style.transform = `translate3d(${mx * 10}px, ${my * 10}px, 0)`;
}, { passive: true });

// ===== Particles canvas (subtle) =====
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let w, h, dpr;
let dots = [];

function resize() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  w = canvas.width = Math.floor(window.innerWidth * dpr);
  h = canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  const count = Math.floor((window.innerWidth * window.innerHeight) / 22000);
  dots = Array.from({ length: Math.max(40, Math.min(130, count)) }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: (Math.random() * 1.6 + 0.6) * dpr,
    vx: (Math.random() - 0.5) * 0.25 * dpr,
    vy: (Math.random() - 0.5) * 0.25 * dpr,
    a: Math.random() * 0.35 + 0.10
  }));
}
window.addEventListener("resize", resize, { passive: true });
resize();

function step() {
  ctx.clearRect(0, 0, w, h);

  // dots
  for (const p of dots) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < -20) p.x = w + 20;
    if (p.x > w + 20) p.x = -20;
    if (p.y < -20) p.y = h + 20;
    if (p.y > h + 20) p.y = -20;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${p.a})`;
    ctx.fill();
  }

  // connecting lines (subtle)
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const a = dots[i], b = dots[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const max = 140 * dpr;
      if (dist < max) {
        const alpha = (1 - dist / max) * 0.10;
        ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(step);
}
step();
