/* ═══════════════════════════════════════════════════════
   MÏAM CHARITABLE TRUST — SCRIPT v4
   ═══════════════════════════════════════════════════════ */
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const noMotion = () => window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const isMobile = () => window.innerWidth <= 1024;

/* ── NAV SCROLL ── */
function initNavScroll() {
  const nav = $('#nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── MOBILE DRAWER ── */
function initMobileNav() {
  const btn = $('#hamburger-btn');
  const links = $('#nav-links');
  if (!btn || !links) return;

  const open = () => {
    links.classList.add('open');
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    links.classList.remove('open');
    btn.classList.add('active');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () =>
    links.classList.contains('open') ? close() : open()
  );

  // Close when tapping backdrop (the ::before pseudo)
  links.addEventListener('click', (e) => {
    if (e.target === links) close();
  });

  // Close regular links (not dropdown triggers)
  $$('.nav__link:not(.nav__dropdown-trigger)', links).forEach(l =>
    l.addEventListener('click', close)
  );
  $$('.nav__dropdown-link', links).forEach(l =>
    l.addEventListener('click', close)
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

/* ── DROPDOWNS (desktop hover + mobile accordion) ── */
function initDropdowns() {
  const dropdowns = $$('.nav__dropdown');

  const closeAll = (except) => {
    dropdowns.forEach(dd => {
      if (dd === except) return;
      dd.classList.remove('is-open');
      const t = $('.nav__dropdown-trigger', dd);
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  };

  dropdowns.forEach(dd => {
    const trigger = $('.nav__dropdown-trigger', dd);
    if (!trigger) return;
    let timer = null;

    const openDD = () => {
      clearTimeout(timer);
      closeAll(dd);
      dd.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    };
    const closeDD = () => {
      dd.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    // Desktop: hover
    dd.addEventListener('mouseenter', () => {
      if (!isMobile()) openDD();
    });
    dd.addEventListener('mouseleave', () => {
      if (!isMobile()) { timer = setTimeout(closeDD, 180); }
    });

    // Click: works both desktop + mobile
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dd.classList.contains('is-open') ? closeDD() : openDD();
    });

    $$('.nav__dropdown-link', dd).forEach(l =>
      l.addEventListener('click', () => closeDD())
    );
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav__dropdown')) closeAll();
  });
}

/* ── SCROLL REVEAL ── */
function initScrollReveal() {
  if (noMotion()) {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => obs.observe(el));
}

/* ── COUNTER ANIMATION ── */
function animateCounter(el, target, dur = 1600) {
  const start = performance.now();
  const step = (ts) => {
    const p = Math.min((ts - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(target * e);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = $$('.impact-stat__number[data-target]');
  if (!counters.length) return;
  if (noMotion()) { counters.forEach(el => (el.textContent = el.dataset.target)); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        animateCounter(en.target, parseInt(en.target.dataset.target, 10));
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => obs.observe(el));
}

/* ── SMOOTH SCROLL ── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const navH = $('#nav')?.offsetHeight ?? 0;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navH - 12,
        behavior: 'smooth'
      });
    });
  });
}

/* ── NEWSLETTER ── */
function initNewsletter() {
  const form = $('#newsletter-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('.footer__newsletter-input', form);
    const btn = $('.footer__newsletter-btn', form);
    if (input.value.trim()) {
      btn.innerHTML = '<span class="material-icons-outlined">check</span>';
      btn.style.background = 'var(--clr-forest)';
      input.value = '';
      setTimeout(() => {
        btn.innerHTML = '<span class="material-icons-outlined">send</span>';
        btn.style.background = '';
      }, 3000);
    }
  });
}

/* ── HERO STAGGER ── */
function initHeroStagger() {
  if (noMotion()) return;
  const items = [
    $('.hero__govt-bar'),
    ...$$('.hero__badge-row .trust-pill'),
    $('.hero__headline'),
    $('.hero__sub'),
    $('.hero__ctas'),
  ].filter(Boolean);
  items.forEach((el, i) => {
    el.style.cssText = 'opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s cubic-bezier(.34,1.56,.64,1)';
    setTimeout(() => { el.style.opacity = ''; el.style.transform = ''; }, 280 + i * 110);
  });
}

/* ── PIE CHART ── */
function initPieChart() {
  const pie = $('.pie-chart__visual');
  if (!pie || noMotion()) return;
  pie.style.background = 'transparent';
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        pie.style.transition = 'background 1.2s ease';
        pie.style.background = `conic-gradient(var(--clr-teal) 0% 35%,var(--clr-forest-light) 35% 60%,var(--clr-coral) 60% 80%,var(--clr-amber) 80% 100%)`;
        obs.unobserve(pie);
      }
    });
  }, { threshold: 0.5 });
  obs.observe(pie);
}

/* ── SCROLL TO TOP ── */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () =>
    btn.classList.toggle('visible', window.scrollY > 400), { passive: true }
  );
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── ACTIVE NAV ── */
function initActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav__link').forEach(l => {
    const href = l.getAttribute('href') || '';
    if (href && !href.startsWith('#') && href.startsWith(page)) l.classList.add('active');
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  initMobileNav();
  initDropdowns();
  initScrollReveal();
  initCounters();
  initSmoothScroll();
  initNewsletter();
  initHeroStagger();
  initPieChart();
  initScrollTop();
  initActiveNav();
  console.log('%cMïam Charitable Trust','font-size:18px;font-weight:bold;color:#0D9488;');
});
