(() => {
  'use strict';

  const html = document.documentElement;
  const body = document.body;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const APP = {
    _forceFallback: false,
    supportsScrollTimeline() {
      if (this._forceFallback) return false;
      try { return CSS.supports('animation-timeline: auto'); } catch { return false; }
    },
    forceFallback(v) { this._forceFallback = !!v; },
    sampleRootProgress() {
      const p = getComputedStyle(html).getPropertyValue('--scroll-progress').trim();
      return parseFloat(p || '0');
    },
    checkStickySupport() {
      const el = document.querySelector('.stage-sticky');
      if (!el) return false;
      const cs = getComputedStyle(el);
      return cs.position === 'sticky' || cs.position === '-webkit-sticky';
    },
    reinitScrolling() {
      teardownScroll();
      initScrollSystem();
    }
  };
  window.APP = APP;

  /* Utils */
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const fmtInt = (n) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  /* Global scroll progress bar */
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollTop = doc.scrollTop || body.scrollTop || 0;
        const max = (doc.scrollHeight - doc.clientHeight) || 1;
        const p = clamp01(scrollTop / max);
        html.style.setProperty('--scroll-progress', String(p));
        ticking = false;
      });
      ticking = true;
    }
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* Section progress fallback (IO + rAF updates) */
  let observers = [];
  function teardownScroll() {
    observers.forEach(o => o.disconnect());
    observers = [];
  }
  function initScrollSystem() {
    const useCSS = APP.supportsScrollTimeline();
    html.classList.toggle('css-scroll-timeline', useCSS);

    const sections = [
      '#sec-hero', '#sec-about', '#journey-a', '#journey-b', '#journey-c',
      '#sec-map', '#sec-features', '#sec-crowd', '#sec-faq', '#sec-cta'
    ].map(s => document.querySelector(s)).filter(Boolean);

    if (!useCSS) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          const el = e.target;
          if (e.isIntersecting) el.classList.add('in-view');
          else el.classList.remove('in-view');
        }
      }, { root: null, threshold: [0, 0.01, 0.5, 1] });

      sections.forEach(sec => {
        io.observe(sec);
        observers.push(io);
      });

      const update = () => {
        const vh = window.innerHeight || 1;
        for (const sec of sections) {
          const r = sec.getBoundingClientRect();
          // Progress 0..1 from entering viewport top to leaving bottom
          const total = r.height + vh;
          const p = clamp01((vh - r.top) / total);
          sec.style.setProperty('--progress', String(p));
        }
        requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    } else {
      // Even with CSS timelines, set --progress best-effort for CSS calc() fallbacks
      const io2 = new IntersectionObserver((entries) => {
        const vh = window.innerHeight || 1;
        for (const e of entries) {
          const sec = e.target;
          const r = sec.getBoundingClientRect();
          const total = r.height + vh;
          const p = clamp01((vh - r.top) / total);
          sec.style.setProperty('--progress', String(p));
          if (e.isIntersecting) sec.classList.add('in-view'); else sec.classList.remove('in-view');
        }
      }, { root: null, threshold: [0, 0.01, 0.5, 1] });
      sections.forEach(sec => { io2.observe(sec); observers.push(io2); });
    }
  }

  /* Magnetic button */
  function initMagnet() {
    if (prefersReduced) return; // degrade
    const btn = document.querySelector('.magnet');
    if (!btn) return;
    let raf = 0, tx = 0, ty = 0, targetX = 0, targetY = 0;
    const max = 8;
    const onMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clamp(-max, max, e.clientX - cx);
      const dy = clamp(-max, max, e.clientY - cy);
      targetX = (dx / rect.width) * max * 2;
      targetY = (dy / rect.height) * max * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const clamp = (mn, mx, v) => Math.max(mn, Math.min(mx, v));
    const tick = () => {
      tx += (targetX - tx) * 0.15;
      ty += (targetY - ty) * 0.15;
      btn.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
      if (Math.abs(tx - targetX) > 0.1 || Math.abs(ty - targetY) > 0.1) raf = requestAnimationFrame(tick); else raf = 0;
    };
    const reset = () => { targetX = 0; targetY = 0; if (!raf) raf = requestAnimationFrame(tick); };
    btn.addEventListener('pointermove', onMove);
    btn.addEventListener('pointerleave', reset);
  }

  /* 3D Tilt on feature cards */
  function initTilt() {
    const cards = [...document.querySelectorAll('.tilt')];
    if (cards.length === 0) return;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (coarse || prefersReduced) return; // disable on mobile / reduced motion
    cards.forEach(card => {
      let rAF = 0; let rx = 0, ry = 0, tx = 0, ty = 0;
      const maxDeg = 6;
      const onPointerMove = (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        ry = clamp(-1, 1, dx) * maxDeg;
        rx = clamp(-1, 1, -dy) * maxDeg;
        if (!rAF) rAF = requestAnimationFrame(tick);
      };
      const clamp = (mn, mx, v) => Math.max(mn, Math.min(mx, v));
      const tick = () => {
        tx += (ry - tx) * .2; ty += (rx - ty) * .2;
        card.style.transform = `rotateY(${tx.toFixed(2)}deg) rotateX(${ty.toFixed(2)}deg)`;
        card.style.boxShadow = `0 20px 40px rgba(17,24,39,${Math.min(0.2, Math.abs(tx)/40 + Math.abs(ty)/40)})`;
        if (Math.abs(tx - ry) > 0.1 || Math.abs(ty - rx) > 0.1) rAF = requestAnimationFrame(tick); else rAF = 0;
      };
      const reset = () => { ry = 0; rx = 0; if (!rAF) rAF = requestAnimationFrame(tick); };
      card.addEventListener('pointermove', onPointerMove);
      card.addEventListener('pointerleave', reset);
    });
  }

  /* Counters in Journey B */
  function initCounters() {
    const counters = [...document.querySelectorAll('#journey-b .counter')];
    if (counters.length === 0) return;
    let started = false;
    const start = () => {
      if (started) return; started = true;
      counters.forEach(node => {
        const to = parseFloat(node.getAttribute('data-to') || '0');
        const t0 = performance.now();
        const dur = 1200;
        const step = (now) => {
          const t = clamp01((now - t0) / dur);
          const v = Math.round(easeOutCubic(t) * to);
          node.textContent = fmtInt(v);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      const alt = document.querySelector('#journey-b .alt-path');
      if (alt) {
        alt.classList.remove('in-pulse');
        setTimeout(() => alt.classList.add('in-pulse'), 300);
      }
    };
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting && e.intersectionRatio > 0.3) start();
    }, { threshold: [0, .3, 1] });
    const stage = document.querySelector('#journey-b');
    if (stage) obs.observe(stage);
    observers.push(obs);
  }

  /* Verdict pulses in Journey A based on progress */
  function initVerdict() {
    const stage = document.querySelector('#journey-a');
    const card = stage?.querySelector('.verdict');
    const dist = stage?.querySelector('.dist');
    if (!stage || !card) return;
    const update = () => {
      const p = parseFloat(getComputedStyle(stage).getPropertyValue('--progress') || '0');
      if (p > 0.6) {
        card.setAttribute('data-state', 'not-ok');
        if (dist) dist.textContent = '150';
      } else {
        card.removeAttribute('data-state');
        if (dist) dist.textContent = '120';
      }
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  /* Checklist ticks in Journey C */
  function initChecklist() {
    const stage = document.querySelector('#journey-c');
    if (!stage) return;
    const boxes = [...stage.querySelectorAll('input[type="checkbox"]')];
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) {
        boxes.forEach((b, i) => {
          setTimeout(() => { b.checked = true; b.parentElement?.classList.add('checked'); }, 250 * (i + 1));
        });
      }
    }, { threshold: .3 });
    obs.observe(stage);
    observers.push(obs);
  }

  /* In-view toggles for map cards and hint */
  function initInView() {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) e.target.classList.add('in-view'); else e.target.classList.remove('in-view');
      }
    }, { threshold: .3 });
    document.querySelectorAll('.map-card, .steps .hint').forEach(el => io.observe(el));
    observers.push(io);
  }

  /* Accordion interactions (keyboard accessible) */
  function initAccordion() {
    const items = [...document.querySelectorAll('.accordion .item')];
    const reduce = prefersReduced;
    for (const item of items) {
      const btn = item.querySelector('.acc-btn');
      const panel = item.querySelector('.acc-panel');
      if (!btn || !panel) continue;
      panel.style.maxHeight = '0px';
      const open = () => {
        btn.setAttribute('aria-expanded', 'true');
        panel.classList.add('open');
        const h = panel.scrollHeight;
        if (reduce) { panel.style.maxHeight = h + 'px'; panel.style.opacity = '1'; return; }
        panel.animate([
          { maxHeight: '0px', opacity: 0 },
          { maxHeight: h + 'px', opacity: 1 }
        ], { duration: 220, easing: 'ease-out', fill: 'both' }).onfinish = () => {
          panel.style.maxHeight = h + 'px'; panel.style.opacity = '1';
        };
      };
      const close = () => {
        btn.setAttribute('aria-expanded', 'false');
        const h = panel.scrollHeight;
        if (reduce) { panel.style.maxHeight = '0px'; panel.style.opacity = '0'; panel.classList.remove('open'); return; }
        panel.animate([
          { maxHeight: h + 'px', opacity: 1 },
          { maxHeight: '0px', opacity: 0 }
        ], { duration: 200, easing: 'ease-in', fill: 'forwards' }).onfinish = () => {
          panel.classList.remove('open'); panel.style.maxHeight = '0px'; panel.style.opacity = '0';
        };
      };
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        expanded ? close() : open();
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
      });
    }
  }

  /* Smooth anchor with View Transitions (optional) */
  function initAnchors() {
    const supportsVT = 'startViewTransition' in document && !prefersReduced;
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const scrollToTarget = () => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.focus?.({ preventScroll: true });
        };
        if (supportsVT) {
          document.startViewTransition(() => scrollToTarget());
        } else {
          scrollToTarget();
        }
      });
    });
  }

  /* Medium-only metrics inside A for responsive requirement */
  function injectMediumMetrics() {
    const host = document.querySelector('#journey-a .stage-fg');
    if (!host || host.querySelector('.metrics-medium')) return;
    const wrap = document.createElement('div');
    wrap.className = 'metrics metrics-medium';
    wrap.innerHTML = `
      <div class="metric"><div class="label">最大坡度</div><div class="value">8%</div></div>
      <div class="metric"><div class="label">替代路段</div><div class="value">230 米</div></div>
    `;
    host.appendChild(wrap);
  }

  /* Init all */
  function init() {
    initScrollSystem();
    // Improve cross-origin reliability for hotlinked images
    document.querySelectorAll('img').forEach(img => {
      try { img.referrerPolicy = 'no-referrer'; } catch {}
      img.addEventListener('error', () => {
        if (img.dataset.retried) return;
        img.dataset.retried = '1';
        try {
          const u = new URL(img.src, location.href);
          u.searchParams.set('v', String(Date.now()));
          img.src = u.toString();
        } catch {}
      }, { once: true });
    });
    initMagnet();
    initTilt();
    initCounters();
    initVerdict();
    initChecklist();
    initInView();
    initAccordion();
    initAnchors();
    injectMediumMetrics();
    const y = document.getElementById('year'); if (y) y.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
