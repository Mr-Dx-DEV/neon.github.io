// ===== Mobile nav =====
const navBtn = document.getElementById("navBtn");
const nav    = document.getElementById("nav");
navBtn?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navBtn.setAttribute("aria-expanded", open ? "true" : "false");
});
nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

// ===== Year =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Count-up animation =====
function countUp(el) {
  const target = parseInt(el.dataset.target, 10);
  if (!target) return;
  const duration = 1400;
  const start    = performance.now();
  const update   = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

// ===== Reveal + Progress bars + Count-up =====
const reveals = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");

    // animate progress bars
    e.target.querySelectorAll(".bar__fill").forEach(fill => {
      const w = fill.style.width;
      fill.style.width = "0%";
      requestAnimationFrame(() => (fill.style.width = w));
    });

    // count-up numbers
    e.target.querySelectorAll(".stat__num[data-target]").forEach(countUp);

    io.unobserve(e.target);
  });
}, { threshold: 0.10 });
reveals.forEach(el => io.observe(el));

// ===== Parallax portrait =====
const portrait = document.getElementById("portrait");
window.addEventListener("mousemove", (e) => {
  if (!portrait) return;
  const mx = e.clientX / window.innerWidth  - 0.5;
  const my = e.clientY / window.innerHeight - 0.5;
  portrait.style.transform = `translate3d(${mx * 10}px, ${my * 10}px, 0)`;
}, { passive: true });

// ===== Gallery filter tabs =====
document.querySelectorAll(".gtab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".gtab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const filter = tab.dataset.filter;
    document.querySelectorAll(".gallery-item").forEach(item => {
      const cat = item.dataset.cat || "all";
      item.classList.toggle("hidden", filter !== "all" && cat !== filter);
    });
  });
});

// ===== GitHub Repos =====
(function fetchGitHubRepos() {
  const grid    = document.getElementById("repoGrid");
  const loading = document.getElementById("repoLoading");
  if (!grid) return;

  const LANG_COLORS = {
    JavaScript: "#f1e05a",
    TypeScript: "#2b7489",
    Lua:        "#000080",
    Python:     "#3572A5",
    HTML:       "#e34c26",
    CSS:        "#563d7c",
    PHP:        "#4F5D95",
    Shell:      "#89e051",
    Batchfile:  "#C1F12E",
    Vue:        "#41b883",
    C:          "#555555",
    "C++":      "#f34b7d",
    Go:         "#00ADD8",
    Rust:       "#dea584",
    Java:       "#b07219",
  };

  const REPO_ICONS = {
    JavaScript: "🟨", TypeScript: "🔷", Lua: "🌙", Python: "🐍",
    HTML: "🌐", CSS: "🎨", PHP: "🐘", Shell: "⚙️", Vue: "💚",
    default: "📦",
  };

  function buildCard(repo) {
    const a = document.createElement("a");
    a.className = "repo-card glass reveal";
    a.href      = repo.html_url;
    a.target    = "_blank";
    a.rel       = "noreferrer";

    const lang      = repo.language || "";
    const color     = LANG_COLORS[lang] || "#8b5cf6";
    const icon      = REPO_ICONS[lang]  || REPO_ICONS.default;
    const desc      = repo.description  || "";
    const stars     = repo.stargazers_count || 0;
    const forks     = repo.forks_count     || 0;
    const isFork    = repo.fork;

    a.innerHTML = `
      <div class="repo-card__top">
        <span class="repo-icon">${icon}</span>
        <span class="repo-name" title="${repo.name}">${repo.name}</span>
        ${isFork ? '<span class="repo-fork-badge">fork</span>' : ""}
        <span class="repo-link-icon">↗</span>
      </div>
      ${desc
        ? `<p class="repo-desc">${desc}</p>`
        : `<p class="repo-desc repo-desc--empty">No description</p>`
      }
      <div class="repo-footer">
        ${lang
          ? `<span class="repo-lang">
               <span class="repo-lang-dot" style="background:${color}"></span>
               ${lang}
             </span>`
          : ""
        }
        ${stars > 0 ? `<span class="repo-stat">⭐ ${stars}</span>` : ""}
        ${forks > 0 ? `<span class="repo-stat">⑂ ${forks}</span>` : ""}
      </div>
    `;
    return a;
  }

  fetch("https://api.github.com/users/Mr-Dx-DEV/repos?sort=updated&per_page=30&type=public")
    .then(r => {
      if (!r.ok) throw new Error("GitHub API error: " + r.status);
      return r.json();
    })
    .then(repos => {
      if (loading) loading.remove();

      if (!repos.length) {
        grid.innerHTML = `<div class="repo-error">No public repositories found.</div>`;
        return;
      }

      const fragment = document.createDocumentFragment();
      repos.forEach(repo => fragment.appendChild(buildCard(repo)));
      grid.appendChild(fragment);

      // hook new cards into the reveal observer
      grid.querySelectorAll(".repo-card.reveal").forEach(el => io.observe(el));
    })
    .catch(() => {
      if (loading) loading.remove();
      grid.innerHTML = `
        <div class="repo-error">
          Could not load repositories.<br>
          <a href="https://github.com/Mr-Dx-DEV" target="_blank" rel="noreferrer">
            View on GitHub ↗
          </a>
        </div>`;
    });
})();

// ===== Neon Particle Canvas =====
const canvas = document.getElementById("particles");
const ctx    = canvas.getContext("2d");
const COLORS = ["0,212,255","139,92,246","244,114,182","34,197,94"];
let w, h, dpr, dots = [];

function resize() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  w = canvas.width  = Math.floor(window.innerWidth  * dpr);
  h = canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width  = window.innerWidth  + "px";
  canvas.style.height = window.innerHeight + "px";
  const count = Math.floor((window.innerWidth * window.innerHeight) / 20000);
  dots = Array.from({ length: Math.max(45, Math.min(130, count)) }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    r: (Math.random() * 1.8 + 0.5) * dpr,
    vx: (Math.random() - 0.5) * 0.28 * dpr,
    vy: (Math.random() - 0.5) * 0.28 * dpr,
    a: Math.random() * 0.28 + 0.07,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
}
window.addEventListener("resize", resize, { passive: true });
resize();

function step() {
  ctx.clearRect(0, 0, w, h);
  for (const p of dots) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < -20)    p.x = w + 20;
    if (p.x > w + 20) p.x = -20;
    if (p.y < -20)    p.y = h + 20;
    if (p.y > h + 20) p.y = -20;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color},${p.a})`;
    ctx.fill();
  }
  const maxDist = 150 * dpr;
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const a = dots[i], b = dots[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < maxDist) {
        ctx.strokeStyle = `rgba(${a.color},${(1 - dist/maxDist) * 0.12})`;
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
  }
  requestAnimationFrame(step);
}
step();
