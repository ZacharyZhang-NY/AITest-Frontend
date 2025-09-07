// Core app behaviors: theme, tabs, ripple, like/collect, pull-to-refresh
(function(){
  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return root.querySelectorAll(sel); }

  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(theme) {
    if (!theme) return;
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch(e){}
  }
  function applyReduceMotion(enabled) {
    const v = enabled ? 'true' : 'false';
    document.documentElement.setAttribute('data-reduce', v);
    try { localStorage.setItem('reduce', v); } catch(e){}
  }
  function applyFontScale(scale) {
    document.documentElement.setAttribute('data-fontscale', scale);
    try { localStorage.setItem('fontscale', scale); } catch(e){}
  }
  function applyContrast(level) {
    document.documentElement.setAttribute('data-contrast', level);
    try { localStorage.setItem('contrast', level); } catch(e){}
  }

  function restorePrefs() {
    try {
      const savedTheme = localStorage.getItem('theme');
      applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
      const reduce = localStorage.getItem('reduce') === 'true'; applyReduceMotion(reduce);
      const fs = localStorage.getItem('fontscale') || 'base'; applyFontScale(fs);
      const contrast = localStorage.getItem('contrast') || 'base'; applyContrast(contrast);
    } catch(e) {
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function bindThemeToggles() {
    qsa('[data-action="toggle-theme"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    });
    const reduceChk = qs('#reduceMotion');
    if (reduceChk) {
      reduceChk.checked = document.documentElement.getAttribute('data-reduce') === 'true';
      reduceChk.addEventListener('change', e => applyReduceMotion(e.target.checked));
    }
    const contrastChk = qs('#contrastHigh');
    if (contrastChk) {
      contrastChk.checked = document.documentElement.getAttribute('data-contrast') === 'high';
      contrastChk.addEventListener('change', e => applyContrast(e.target.checked ? 'high' : 'base'));
    }
    const fontSel = qs('#fontScale');
    if (fontSel) {
      fontSel.value = document.documentElement.getAttribute('data-fontscale') || 'base';
      fontSel.addEventListener('change', e => applyFontScale(e.target.value));
    }
  }

  // Tab bar highlight
  function initTabBar() {
    const current = document.body.getAttribute('data-current-tab');
    if (!current) return;
    qsa('.tab-item').forEach(a => {
      if (a.dataset.tab === current) a.setAttribute('aria-current','page');
    });
  }

  // Segmented control thumb
  function initSegments() {
    qsa('.segment').forEach(seg => {
      seg.addEventListener('click', e => {
        const idx = [...seg.querySelectorAll('button')].indexOf(e.target.closest('button'));
        if (idx >= 0) seg.setAttribute('data-index', idx.toString());
      });
    });
  }

  // Ripple effect
  function initRipples() {
    qsa('.ripple').forEach(el => {
      el.addEventListener('pointerdown', e => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        el.style.setProperty('--x', `${x}px`); el.style.setProperty('--y', `${y}px`);
        el.classList.remove('is-animating'); void el.offsetWidth; el.classList.add('is-animating');
        setTimeout(() => el.classList.remove('is-animating'), 450);
      });
    });
  }

  // Like & Collect micro animations
  function initSocialButtons() {
    qsa('[data-like-button]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        Motion.bounce(btn);
        Motion.particlesAround(btn, 'var(--red)');
      });
    });
    qsa('[data-collect-button]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        Motion.bounce(btn);
        Motion.particlesAround(btn, 'var(--amber)');
      });
    });
  }

  // Pull to refresh
  function initPullToRefresh() {
    const scroller = qs('.content');
    if (!scroller) return;
    const indicator = document.createElement('div');
    indicator.className = 'ptr-indicator';
    scroller.parentElement.appendChild(indicator);
    let startY = 0; let pulling = false; let deg = 0; let locked = false;
    const reduce = document.documentElement.getAttribute('data-reduce') === 'true' || matchMedia('(prefers-reduced-motion: reduce)').matches;

    scroller.addEventListener('touchstart', (e) => {
      if (scroller.scrollTop <= 0) { startY = e.touches[0].clientY; pulling = true; locked = false; }
    }, { passive: true });
    scroller.addEventListener('touchmove', (e) => {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) {
        e.preventDefault();
        indicator.classList.add('visible');
        deg = Math.min(360, dy * 3);
        indicator.style.setProperty('--deg', `${deg}deg`);
      }
    }, { passive: false });
    scroller.addEventListener('touchend', async () => {
      if (!pulling) return; pulling = false;
      if (deg > 240 && !locked) { // trigger threshold
        locked = true;
        if (!reduce) Motion.pulse(indicator);
        await new Promise(res => setTimeout(res, 800));
      }
      indicator.classList.remove('visible');
      indicator.style.removeProperty('--deg');
    });
  }

  // Swipe-to-actions for list
  function initSwipeables() {
    qsa('.swipe-item').forEach(item => {
      let startX=0, currentX=0, dragging=false;
      const content = item.querySelector('.swipe-content');
      const actions = item.querySelector('.swipe-actions');
      if (!content || !actions) return;
      item.addEventListener('touchstart', e => { dragging = true; startX = e.touches[0].clientX; }, { passive: true });
      item.addEventListener('touchmove', e => {
        if (!dragging) return; currentX = e.touches[0].clientX; const dx = currentX - startX; if (dx < 0) { content.style.transform = `translateX(${dx}px)`; actions.style.opacity = Math.min(1, Math.abs(dx)/80); }
      }, { passive: true });
      item.addEventListener('touchend', () => {
        dragging = false; const dx = currentX - startX; if (dx < -60) { content.style.transform = 'translateX(-96px)'; actions.style.opacity = 1; } else { content.style.transform = ''; actions.style.opacity = 0; }
      });
    });
  }

  // Search suggestions demo
  function initSearchSuggest() {
    const input = qs('#searchTopics');
    const panel = qs('#suggestPanel');
    if (!input || !panel) return;
    const suggestions = [ '坡度 ≤ 8%', '电梯停运', '无障碍卫生间', '门宽 ≥ 80cm', '盲道连续' ];
    input.addEventListener('input', () => {
      const v = input.value.trim();
      panel.innerHTML = '';
      if (!v) { panel.hidden = true; return; }
      suggestions.filter(s => s.includes(v)).slice(0,5).forEach(s => {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded'; btn.textContent = s;
        btn.addEventListener('click', () => { input.value = s; panel.hidden = true; input.dispatchEvent(new Event('change')); });
        panel.appendChild(btn);
      });
      panel.hidden = panel.childElementCount === 0;
    });
    document.addEventListener('click', (e) => { if (!panel.contains(e.target) && e.target !== input) panel.hidden = true; });
  }

  // Double-tap to zoom for images
  function initDoubleTapZoom() {
    qsa('[data-zoomable] img').forEach(img => {
      let last=0; let zoom=false;
      img.style.transition = 'transform .25s ease';
      img.addEventListener('click', e => {
        const now = Date.now();
        if (now - last < 350) {
          zoom = !zoom; img.style.transform = zoom ? 'scale(1.8)' : 'scale(1)';
        }
        last = now;
      });
    });
  }

  // View Transition navigation helper
  function navWithTransition(url) {
    if (document.startViewTransition) {
      document.startViewTransition(() => { window.location.href = url; });
    } else {
      window.location.href = url;
    }
  }
  window.navWithTransition = navWithTransition;

  // Image error fallback outline
  function guardImages() {
    qsa('img').forEach(img => {
      img.addEventListener('error', () => {
        img.alt = img.alt || 'Image unavailable';
        img.style.background = '#0ea5e9';
        img.style.color = 'white';
        img.style.display = 'grid';
        img.style.placeItems = 'center';
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    restorePrefs();
    bindThemeToggles();
    initTabBar();
    initSegments();
    initRipples();
    initSocialButtons();
    initPullToRefresh();
    initSwipeables();
    initSearchSuggest();
    initDoubleTapZoom();
    Observers.initVideoAutoplay(document);
    Observers.lazyImages(document);
    Observers.parallaxOnScroll(document);
    guardImages();
  });
})();

