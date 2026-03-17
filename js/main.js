/* ══════════════════════════════════════════════════
   AMPARTABOX 2.0 — main.js
══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ════════════════════
     CURSOR
  ════════════════════ */
  const cur  = document.getElementById('cur');
  const curR = document.getElementById('curR');
  let mx=0, my=0, rx=0, ry=0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });

  (function loop() {
    rx += (mx - rx) * .1;
    ry += (my - ry) * .1;
    curR.style.left = rx + 'px';
    curR.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll(
    'a,button,.about-row,.tl-node-card,.loc-big,.loc-mini,.am-item,.hstat,.hw-pip'
  ).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
  });

  /* ════════════════════
     DOCK SCROLL
  ════════════════════ */
  const dock = document.querySelector('.dock-bar');
  if (dock) {
    window.addEventListener('scroll', () => {
      dock.style.opacity = window.scrollY > 80 ? '1' : '1';
    });
  }

  /* ════════════════════
     MOBILE DOCK MENU
  ════════════════════ */
  const ham   = document.getElementById('dockHam');
  const mobi  = document.getElementById('dockMobile');
  if (ham && mobi) {
    ham.addEventListener('click', e => {
      e.stopPropagation();
      mobi.classList.toggle('open');
    });
    document.addEventListener('click', () => mobi.classList.remove('open'));
    mobi.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobi.classList.remove('open')));
  }

  /* ════════════════════
     HERO CAROUSEL
  ════════════════════ */
  const inner = document.getElementById('hwInner');
  const pips  = document.querySelectorAll('.hw-pip');
  const slides = document.querySelectorAll('.c-slide');
  let cur_slide = 0;
  let timer;

  function goTo(n) {
    cur_slide = (n + slides.length) % slides.length;
    if (inner) inner.style.transform = `translateX(-${cur_slide * 100}%)`;
    pips.forEach((p, i) => p.classList.toggle('on', i === cur_slide));
    slides.forEach((s, i) => s.classList.toggle('active', i === cur_slide));
    // update text
    const infos = document.querySelectorAll('.hw-slide-info');
    infos.forEach((info, i) => {
      info.style.opacity = i === cur_slide ? '1' : '0';
      info.style.transform = i === cur_slide ? 'none' : 'translateY(8px)';
    });
  }

  function autoplay() { timer = setInterval(() => goTo(cur_slide + 1), 5000); }
  function stopAuto() { clearInterval(timer); }

  pips.forEach((p, i) => p.addEventListener('click', () => { stopAuto(); goTo(i); autoplay(); }));
  goTo(0);
  autoplay();

  /* ════════════════════
     SCROLL REVEAL
  ════════════════════ */
  const els = document.querySelectorAll('[data-r]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const d = Number(e.target.dataset.d || 0);
        setTimeout(() => e.target.classList.add('in'), d);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });

  els.forEach(el => obs.observe(el));
  // Fallback
  setTimeout(() => els.forEach(el => el.classList.add('in')), 2800);

  /* ════════════════════
     KPI COUNTERS
  ════════════════════ */
  document.querySelectorAll('[data-count]').forEach(el => {
    const kObs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { animNum(el); kObs.disconnect(); }
    }, { threshold: .5 });
    kObs.observe(el);
  });

  function animNum(el) {
    const target  = +el.dataset.count;
    const suffix  = el.dataset.suffix || '';
    const dur     = 1200;
    const t0      = performance.now();
    (function step(now) {
      const p   = Math.min((now - t0) / dur, 1);
      const val = target * (1 - Math.pow(1 - p, 3));
      el.textContent = Math.round(val) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ════════════════════
     SMOOTH ANCHOR
  ════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

});
