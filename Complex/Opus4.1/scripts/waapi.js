class AnimationController {
  constructor() {
    this.animations = new Map();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  likeAnimation(element) {
    if (this.reducedMotion) return;

    const keyframes = [
      { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      { transform: 'scale(1.4) rotate(-5deg)', opacity: 1, offset: 0.3 },
      { transform: 'scale(0.9) rotate(3deg)', opacity: 1, offset: 0.6 },
      { transform: 'scale(1.1) rotate(-1deg)', opacity: 1, offset: 0.8 },
      { transform: 'scale(1) rotate(0deg)', opacity: 1 }
    ];

    const animation = element.animate(keyframes, {
      duration: 600,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      fill: 'forwards'
    });

    this.createHeartParticles(element);
    return animation;
  }

  createHeartParticles(element) {
    const particleCount = 12;
    const container = element.parentElement || element;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('span');
      particle.innerHTML = '❤️';
      particle.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        font-size: 16px;
        pointer-events: none;
        z-index: 1000;
      `;

      container.appendChild(particle);

      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 50 + Math.random() * 30;

      const keyframes = [
        { 
          transform: 'translate(-50%, -50%) scale(0)',
          opacity: 1 
        },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(1.2)`,
          opacity: 0.8,
          offset: 0.5
        },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * distance * 1.5}px), calc(-50% + ${Math.sin(angle) * distance * 1.5}px)) scale(0.8)`,
          opacity: 0
        }
      ];

      const animation = particle.animate(keyframes, {
        duration: 1000,
        easing: 'ease-out',
        fill: 'forwards'
      });

      animation.onfinish = () => particle.remove();
    }
  }

  bookmarkAnimation(element) {
    if (this.reducedMotion) return;

    const keyframes = [
      { transform: 'scale(1) translateY(0)', opacity: 1 },
      { transform: 'scale(1.2) translateY(-5px)', opacity: 1, offset: 0.3 },
      { transform: 'scale(0.95) translateY(0)', opacity: 1, offset: 0.6 },
      { transform: 'scale(1) translateY(0)', opacity: 1 }
    ];

    return element.animate(keyframes, {
      duration: 400,
      easing: 'ease-out'
    });
  }

  rippleEffect(element, x, y) {
    if (this.reducedMotion) return;

    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      pointer-events: none;
      width: ${size}px;
      height: ${size}px;
      left: ${x - rect.left - size / 2}px;
      top: ${y - rect.top - size / 2}px;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    const animation = ripple.animate([
      { transform: 'scale(0)', opacity: 1 },
      { transform: 'scale(2)', opacity: 0 }
    ], {
      duration: 600,
      easing: 'ease-out'
    });

    animation.onfinish = () => ripple.remove();
    return animation;
  }

  slideIn(element, direction = 'bottom') {
    if (this.reducedMotion) {
      element.style.opacity = '1';
      return;
    }

    const transforms = {
      bottom: 'translateY(100%)',
      top: 'translateY(-100%)',
      left: 'translateX(-100%)',
      right: 'translateX(100%)'
    };

    const keyframes = [
      { 
        transform: transforms[direction],
        opacity: 0
      },
      {
        transform: 'translate(0, 0)',
        opacity: 1
      }
    ];

    return element.animate(keyframes, {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    });
  }

  fadeIn(element, duration = 300) {
    if (this.reducedMotion) {
      element.style.opacity = '1';
      return;
    }

    return element.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], {
      duration,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }

  scaleIn(element) {
    if (this.reducedMotion) {
      element.style.transform = 'scale(1)';
      return;
    }

    return element.animate([
      { transform: 'scale(0.8)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 }
    ], {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    });
  }

  shake(element) {
    if (this.reducedMotion) return;

    const keyframes = [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)', offset: 0.1 },
      { transform: 'translateX(10px)', offset: 0.2 },
      { transform: 'translateX(-10px)', offset: 0.3 },
      { transform: 'translateX(10px)', offset: 0.4 },
      { transform: 'translateX(-10px)', offset: 0.5 },
      { transform: 'translateX(10px)', offset: 0.6 },
      { transform: 'translateX(-10px)', offset: 0.7 },
      { transform: 'translateX(10px)', offset: 0.8 },
      { transform: 'translateX(-10px)', offset: 0.9 },
      { transform: 'translateX(0)' }
    ];

    return element.animate(keyframes, {
      duration: 500,
      easing: 'ease-in-out'
    });
  }

  progressBar(element, progress) {
    const currentWidth = parseFloat(element.style.width) || 0;
    
    return element.animate([
      { width: `${currentWidth}%` },
      { width: `${progress}%` }
    ], {
      duration: 300,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }

  numberCounter(element, start, end, duration = 1000) {
    if (this.reducedMotion) {
      element.textContent = end;
      return;
    }

    const startTime = performance.now();
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }

  stagger(elements, animationFn, delay = 50) {
    elements.forEach((element, index) => {
      setTimeout(() => {
        animationFn(element);
      }, index * delay);
    });
  }

  morphPath(element, fromPath, toPath, duration = 300) {
    if (this.reducedMotion) {
      element.setAttribute('d', toPath);
      return;
    }

    return element.animate([
      { d: fromPath },
      { d: toPath }
    ], {
      duration,
      easing: 'ease-in-out',
      fill: 'forwards'
    });
  }

  tilt3D(element, e) {
    if (this.reducedMotion) return;

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  }

  reset3D(element) {
    element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  }

  expandCollapse(element, expanded) {
    const height = expanded ? element.scrollHeight : 0;
    
    return element.animate([
      { height: element.offsetHeight + 'px' },
      { height: height + 'px' }
    ], {
      duration: 300,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }

  stop(animation) {
    if (animation && typeof animation.cancel === 'function') {
      animation.cancel();
    }
  }

  stopAll() {
    this.animations.forEach(animation => this.stop(animation));
    this.animations.clear();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.animationController = new AnimationController();

  document.addEventListener('click', (e) => {
    if (e.target.closest('.like-btn')) {
      window.animationController.likeAnimation(e.target.closest('.like-btn'));
    }

    if (e.target.closest('.bookmark-btn')) {
      window.animationController.bookmarkAnimation(e.target.closest('.bookmark-btn'));
    }

    if (e.target.closest('.ripple')) {
      window.animationController.rippleEffect(e.target.closest('.ripple'), e.clientX, e.clientY);
    }
  });

  document.querySelectorAll('.card-3d').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      window.animationController.tilt3D(card, e);
    });

    card.addEventListener('mouseleave', () => {
      window.animationController.reset3D(card);
    });
  });
});