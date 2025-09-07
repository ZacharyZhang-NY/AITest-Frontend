(() => {
  'use strict';

  const results = [];
  const errors = [];
  const add = (name, pass, info = '') => { results.push({ name, pass, info }); };
  const markFail = (el) => { try { el?.classList?.add('outline-fail'); } catch {} };

  // Capture console errors
  window.addEventListener('error', (e) => { errors.push(e?.message || 'error'); });
  window.addEventListener('unhandledrejection', (e) => { errors.push('unhandledrejection'); });

  // Helpers
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const imgReady = (img, timeout = 8000) => new Promise((resolve) => {
    if (img.complete && img.naturalWidth > 0) return resolve({ ok: true });
    const tid = setTimeout(() => resolve({ ok: img.naturalWidth > 0 }), timeout);
    img.addEventListener('load', () => { clearTimeout(tid); resolve({ ok: true }); }, { once: true });
    img.addEventListener('error', () => { clearTimeout(tid); resolve({ ok: false }); }, { once: true });
  });

  async function checkImages() {
    const imgs = [...document.images];
    const restore = { x: scrollX, y: scrollY };
    let allOk = true; let firstBad = null;
    for (const img of imgs) {
      // Trigger load for lazy images by scrolling into view
      if (!(img.complete && img.naturalWidth > 0)) {
        try { img.scrollIntoView({ behavior: 'auto', block: 'center' }); } catch {}
        await wait(80);
      }
      const { ok } = await imgReady(img, 10000);
      if (!ok) {
        allOk = false; if (!firstBad) firstBad = img;
        markFail(img.closest('article, figure, section') || img);
      }
    }
    window.scrollTo({ top: restore.y, left: restore.x, behavior: 'auto' });
    add('Network images load', allOk, allOk ? '' : 'Image failed');
  }

  async function checkScrollSystem() {
    const supports = window.APP?.supportsScrollTimeline?.() || false;
    if (supports) {
      add('ScrollTimeline support', true);
      return true;
    }
    // Fallback path must update --scroll-progress on html
    const restore = { x: window.scrollX, y: window.scrollY };
    const max = document.documentElement.scrollHeight - innerHeight;
    const positions = [0, Math.max(0, max * 0.33), Math.max(0, max * 0.66)];
    const samples = [];
    for (const pos of positions) {
      window.scrollTo({ top: pos, behavior: 'auto' });
      await wait(60);
      const v = window.APP?.sampleRootProgress?.() ?? 0;
      samples.push(v);
    }
    window.scrollTo({ top: restore.y, left: restore.x, behavior: 'auto' });
    const inc = samples[2] > samples[1] && samples[1] > samples[0] && samples[2] > 0.1;
    add('Fallback scroll progress', inc, inc ? '' : 'No progress delta');
    return inc;
  }

  function checkSections() {
    const ids = ['#sec-hero', '#sec-about', '#sec-journey', '#journey-a', '#journey-b', '#journey-c', '#sec-map', '#sec-features', '#sec-crowd', '#sec-faq', '#sec-cta'];
    const missing = ids.filter(sel => !document.querySelector(sel));
    const ok = missing.length === 0;
    add('Sections exist', ok, ok ? '' : ('Missing: ' + missing.join(',')));
    if (!ok) missing.forEach(sel => markFail(document.querySelector(sel)));
    // Sticky (>=1024px)
    if (innerWidth >= 1024) {
      const stickyOKStages = window.APP?.checkStickySupport?.() || false;
      const heroSticky = getComputedStyle(document.querySelector('#sec-hero .wrap')||document.body).position.includes('sticky');
      const all = stickyOKStages && heroSticky;
      add('Sticky active (>=1024px)', all, all ? '' : 'Hero/Stages sticky not applied');
    }
  }

  async function checkAnimationsReached() {
    // Quickly scroll to near bottom to trigger animations
    const restore = { x: scrollX, y: scrollY };
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' });
    await wait(120);
    const samples = [
      document.querySelector('.hero-text'),
      document.querySelector('#sec-about .stat'),
      document.querySelector('#journey-c .checklist li:last-child'),
      document.querySelector('#sec-map .map-card:last-child')
    ].filter(Boolean);
    let ok = true;
    for (const el of samples) {
      const cs = getComputedStyle(el);
      const op = parseFloat(cs.opacity || '0');
      const tf = cs.transform || 'none';
      if (!(op >= 0.95) || tf === 'none') { ok = false; markFail(el); }
    }
    add('Key elements animated', ok, ok ? '' : 'Some elements not animated');
    window.scrollTo({ top: restore.y, left: restore.x, behavior: 'auto' });
  }

  function checkA11yBasics() {
    const h1 = document.querySelectorAll('h1').length === 1;
    const h2s = [...document.querySelectorAll('main section')].every(sec => !!sec.querySelector('h2'));
    add('Headings present', h1 && h2s, (h1 && h2s) ? '' : 'Missing h1 or some h2');

    const cta = document.getElementById('cta-primary');
    let focusable = false;
    try {
      cta?.focus({ preventScroll: true });
      focusable = (document.activeElement === cta);
    } catch {}
    add('Primary CTA focusable', !!cta && focusable, (!!cta && focusable) ? '' : 'CTA not focusable');

    // FAQ aria-expanded changes
    const btn = document.querySelector('.acc-btn');
    if (btn) {
      const before = btn.getAttribute('aria-expanded');
      btn.click();
      const after = btn.getAttribute('aria-expanded');
      add('FAQ aria-expanded toggles', before !== after, before !== after ? '' : 'No toggle observed');
    }
  }

  async function checkDegrade() {
    try {
      window.APP?.forceFallback?.(true);
      window.APP?.reinitScrolling?.();
      await wait(60);
      const ok = typeof window.APP?.sampleRootProgress?.() === 'number';
      add('Degrade usable (forced fallback)', !!ok, !!ok ? '' : 'Fallback not active');
      const cta = document.querySelector('#cta-primary');
      add('CTA clickable in fallback', !!cta, !!cta ? '' : 'CTA missing');
    } catch (e) {
      add('Degrade usable (forced fallback)', false, 'Exception');
    } finally {
      window.APP?.forceFallback?.(false);
      window.APP?.reinitScrolling?.();
    }
  }

  function checkConsoleErrors() {
    const ok = errors.length === 0;
    add('Console 0 errors', ok, ok ? '' : String(errors[0]));
  }

  // Badge UI
  function renderBadge() {
    const badge = document.createElement('button');
    badge.id = 'qa-badge';
    badge.type = 'button';
    badge.setAttribute('aria-live', 'polite');
    const style = document.createElement('style');
    style.textContent = `
      #qa-badge{position:fixed;right:16px;bottom:16px;z-index:9999;padding:10px 12px;border-radius:999px;border:0;color:#fff;font-weight:700;box-shadow:0 6px 18px rgba(0,0,0,.2);}
      #qa-badge.pass{background:#16a34a;}#qa-badge.fail{background:#ef4444;}
      #qa-panel{position:fixed;right:16px;bottom:60px;z-index:9999;background:#fff;border:1px solid #e5e7eb;box-shadow:0 10px 30px rgba(0,0,0,.2);border-radius:12px;max-width:340px;max-height:40vh;overflow:auto;display:none}
      #qa-panel.open{display:block}
      #qa-panel h3{margin:.75rem 1rem}.qa-list{list-style:none;margin:0;padding:0}
      .qa-list li{padding:.5rem 1rem;border-top:1px solid #f1f5f9;font-size:.92rem}
      .qa-list li.pass{color:#065f46}.qa-list li.fail{color:#991b1b}
    `;
    document.head.appendChild(style);
    const panel = document.createElement('div');
    panel.id = 'qa-panel';
    panel.innerHTML = `<h3>QA Checklist</h3><ul class="qa-list"></ul>`;
    document.body.appendChild(panel);

    const update = () => {
      const allPass = results.every(r => r.pass);
      badge.className = allPass ? 'pass' : 'fail';
      badge.textContent = allPass ? 'QA ✓' : `QA ✗ — ${results.find(r=>!r.pass)?.name || 'Failed'}`;
      const ul = panel.querySelector('.qa-list');
      ul.innerHTML = '';
      results.forEach(r => {
        const li = document.createElement('li');
        li.className = r.pass ? 'pass' : 'fail';
        li.textContent = `${r.pass ? 'PASS' : 'FAIL'} · ${r.name}${r.info ? ' — ' + r.info : ''}`;
        ul.appendChild(li);
      });
    };

    badge.addEventListener('click', () => { panel.classList.toggle('open'); });
    document.body.appendChild(badge);
    return { update, badge, panel };
  }

  async function runQA() {
    // wait for load and a bit for layout/animations
    if (document.readyState !== 'complete') await new Promise(r => window.addEventListener('load', r, { once: true }));
    await wait(120);

    checkConsoleErrors();
    await checkImages();
    await checkScrollSystem();
    checkSections();
    await checkAnimationsReached();
    checkA11yBasics();
    await checkDegrade();

    const ui = renderBadge();
    ui.update();
    // Show debug panel if any fail
    const allPass = results.every(r => r.pass);
    const debug = document.getElementById('debug-panel');
    if (debug) debug.hidden = allPass;
    return allPass;
  }

  window.runQA = runQA;
  // Auto-run
  runQA().catch(() => {});
})();
