// ── SPLASH ──
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash) { splash.classList.add('hide'); setTimeout(() => splash.style.display = 'none', 500); }
  }, 2200);
});

// ── STARFIELD ──
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  function createStars(n) {
    stars = [];
    for (let i = 0; i < n; i++) stars.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.2, speed: Math.random() * 0.25 + 0.04,
      opacity: Math.random() * 0.7 + 0.2,
      twinkleSpeed: Math.random() * 0.018 + 0.004,
      twinkleOffset: Math.random() * Math.PI * 2
    });
  }
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const flicker = Math.sin(frame * s.twinkleSpeed + s.twinkleOffset) * 0.4 + 0.6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.opacity * flicker})`;
      ctx.fill();
      s.y -= s.speed;
      if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
    });
    frame++;
    requestAnimationFrame(draw);
  }
  resize(); createStars(160); draw();
  window.addEventListener('resize', () => { resize(); createStars(160); });
})();

// ── SCROLL REVEAL ──
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 90);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// ── DEMO SECTION REVEAL ──
function initDemoReveal() {
  const demoItems = document.querySelectorAll('.demo-card, .demo-synthesis');
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      demoItems.forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 200);
      });
      obs.disconnect();
    }
  }, { threshold: 0.2 });
  const section = document.querySelector('.demo-section');
  if (section) obs.observe(section);
}

// ── STAT COUNTER ──
function initCounters() {
  const nums = document.querySelectorAll('.stat-num[data-target]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = Math.ceil(target / 50);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current + suffix;
          if (current >= target) clearInterval(timer);
        }, 30);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  nums.forEach(n => obs.observe(n));
}

// ── FAQ ACCORDION ──
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (q) q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!wasOpen) item.classList.add('active');
    });
  });
}

// ── BACK TO TOP ──
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initDemoReveal();
  initCounters();
  initFAQ();
  initBackToTop();
});
