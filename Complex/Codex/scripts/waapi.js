// Lightweight WAAPI micro-animations and particles
// Guard for older browsers
const Motion = (() => {
  const reduce = () => document.documentElement.getAttribute('data-reduce') === 'true' || matchMedia('(prefers-reduced-motion: reduce)').matches;

  function bounce(el) {
    if (!el || reduce()) return;
    el.animate(
      [ { transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' } ],
      { duration: 220, easing: 'cubic-bezier(.2,.7,.3,1)' }
    );
  }

  function pulse(el) {
    if (!el || reduce()) return;
    el.animate(
      [ { transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' } ],
      { duration: 300, easing: 'ease-out' }
    );
  }

  function particlesAround(el, color = 'var(--accent)') {
    if (!el || reduce()) return;
    const rect = el.getBoundingClientRect();
    const originX = rect.width/2; const originY = rect.height/2;
    const container = document.createElement('span');
    container.style.position = 'absolute';
    container.style.inset = '0';
    container.style.pointerEvents = 'none';
    el.style.position = 'relative';
    el.appendChild(container);
    const count = 10;
    for (let i=0;i<count;i++) {
      const p = document.createElement('span');
      const angle = (i / count) * Math.PI * 2;
      const dist = 18 + Math.random() * 16;
      p.style.position = 'absolute';
      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;
      p.style.width = p.style.height = `${4 + Math.random()*3}px`;
      p.style.borderRadius = '50%';
      p.style.background = color;
      container.appendChild(p);
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      p.animate([
        { transform: 'translate(0,0)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px)`, opacity: 0 }
      ], { duration: 420, easing: 'ease-out' }).onfinish = () => p.remove();
    }
    setTimeout(() => container.remove(), 450);
  }

  function progressBar(el, duration=1200) {
    if (!el) return Promise.resolve();
    el.style.setProperty('--w', '0%');
    el.animate(
      [ { width: '0%' }, { width: '100%' } ],
      { duration, easing: 'ease-in-out', fill: 'forwards' }
    );
    return new Promise(res => setTimeout(res, duration));
  }

  return { bounce, pulse, particlesAround, progressBar };
})();

