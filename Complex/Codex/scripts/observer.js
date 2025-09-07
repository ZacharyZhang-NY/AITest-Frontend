// IntersectionObserver utilities and scroll effects
const Observers = (() => {
  let videoObserver;
  let reduce = () => document.documentElement.getAttribute('data-reduce') === 'true' || matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initVideoAutoplay(root = document) {
    const videos = root.querySelectorAll('video[data-auto]');
    if (!videos.length) return;
    if (reduce()) {
      videos.forEach(v => { try { v.pause(); } catch(e){} });
      return;
    }
    if ('IntersectionObserver' in window) {
      videoObserver?.disconnect?.();
      videoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const v = entry.target;
          const ratio = entry.intersectionRatio;
          if (ratio >= 0.6) {
            try { v.muted = true; v.play(); } catch(e){}
          } else {
            try { v.pause(); } catch(e){}
          }
        });
      }, { threshold: [0, 0.6, 1] });
      videos.forEach(v => videoObserver.observe(v));
    } else {
      // Fallback: scroll event
      const onScroll = () => {
        videos.forEach(v => {
          const rect = v.getBoundingClientRect();
          const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
          const ratio = visible / Math.min(window.innerHeight, rect.height);
          if (ratio >= 0.6) { try { v.muted = true; v.play(); } catch(e){} }
          else { try { v.pause(); } catch(e){} }
        });
      };
      document.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  function parallaxOnScroll(root = document) {
    const nodes = root.querySelectorAll('[data-parallax]');
    if (!nodes.length) return;
    const handler = () => {
      const top = (root.scrollingElement || root.querySelector('.content') || document).scrollTop || 0;
      nodes.forEach(n => {
        const speed = parseFloat(n.getAttribute('data-parallax')) || 0.06;
        n.style.transform = `translateY(${top * speed}px)`;
      });
    };
    (root.querySelector('.content') || document).addEventListener('scroll', handler, { passive: true });
    handler();
  }

  function lazyImages(root = document) {
    const imgs = root.querySelectorAll('img[data-src]');
    if (!imgs.length) return;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const img = e.target; img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); io.unobserve(img);
          }
        });
      });
      imgs.forEach(i => io.observe(i));
    } else {
      imgs.forEach(i => { i.src = i.getAttribute('data-src'); i.removeAttribute('data-src'); });
    }
  }

  return { initVideoAutoplay, parallaxOnScroll, lazyImages };
})();

