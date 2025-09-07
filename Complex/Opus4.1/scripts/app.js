class AccessibilityNavigator {
  constructor() {
    this.init();
    this.setupTheme();
    this.setupFontSize();
    this.setupContrast();
    this.setupReducedMotion();
    this.setupTabBar();
    this.setupInteractions();
    this.setupPullToRefresh();
    this.setupVideoObserver();
    this.setupParallax();
    this.setupSegmentControls();
    this.setupSwipeGestures();
  }

  init() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.theme = localStorage.getItem('theme') || 'light';
    this.fontSize = localStorage.getItem('fontSize') || 'normal';
    this.contrast = localStorage.getItem('contrast') || 'normal';
    
    document.documentElement.setAttribute('data-theme', this.theme);
    document.body.setAttribute('data-font-size', this.fontSize);
    document.body.setAttribute('data-contrast', this.contrast);
  }

  setupTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('change', (e) => {
        this.theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
      });
    }
  }

  setupFontSize() {
    const fontSizeSelect = document.getElementById('font-size');
    if (fontSizeSelect) {
      fontSizeSelect.value = this.fontSize;
      fontSizeSelect.addEventListener('change', (e) => {
        this.fontSize = e.target.value;
        document.body.setAttribute('data-font-size', this.fontSize);
        localStorage.setItem('fontSize', this.fontSize);
      });
    }
  }

  setupContrast() {
    const contrastToggle = document.getElementById('contrast-toggle');
    if (contrastToggle) {
      contrastToggle.checked = this.contrast === 'high';
      contrastToggle.addEventListener('change', (e) => {
        this.contrast = e.target.checked ? 'high' : 'normal';
        document.body.setAttribute('data-contrast', this.contrast);
        localStorage.setItem('contrast', this.contrast);
      });
    }
  }

  setupReducedMotion() {
    const reducedMotionToggle = document.getElementById('reduced-motion');
    if (reducedMotionToggle) {
      reducedMotionToggle.checked = this.reducedMotion;
      reducedMotionToggle.addEventListener('change', (e) => {
        this.reducedMotion = e.target.checked;
        if (this.reducedMotion) {
          document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        } else {
          document.documentElement.style.removeProperty('--animation-duration');
        }
      });
    }
  }

  setupTabBar() {
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        tabItems.forEach(tab => tab.classList.remove('active'));
        item.classList.add('active');
        
        if (!this.reducedMotion) {
          item.style.animation = 'pulse 0.3s';
          setTimeout(() => item.style.animation = '', 300);
        }
      });
    });
  }

  setupInteractions() {
    document.querySelectorAll('.ripple').forEach(el => {
      el.addEventListener('click', (e) => {
        if (this.reducedMotion) return;
        
        const rect = el.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        el.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });

    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.reducedMotion) {
          btn.classList.add('like-animation');
          this.createParticles(btn);
          setTimeout(() => btn.classList.remove('like-animation'), 600);
        }
        btn.classList.toggle('liked');
      });
    });

    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('bookmarked');
        if (!this.reducedMotion) {
          btn.style.animation = 'pulse 0.3s';
          setTimeout(() => btn.style.animation = '', 300);
        }
      });
    });
  }

  createParticles(element) {
    const colors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#5856d6'];
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.width = '8px';
      particle.style.height = '8px';
      particle.style.borderRadius = '50%';
      
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 40 + Math.random() * 20;
      particle.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
      
      element.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
  }

  setupPullToRefresh() {
    const contentArea = document.querySelector('.content-area');
    const pullToRefresh = document.querySelector('.pull-to-refresh');
    
    if (!contentArea || !pullToRefresh) return;
    
    let startY = 0;
    let currentY = 0;
    let pulling = false;
    
    contentArea.addEventListener('touchstart', (e) => {
      if (contentArea.scrollTop === 0) {
        startY = e.touches[0].pageY;
        pulling = true;
      }
    });
    
    contentArea.addEventListener('touchmove', (e) => {
      if (!pulling) return;
      
      currentY = e.touches[0].pageY;
      const diff = currentY - startY;
      
      if (diff > 0 && diff < 150) {
        pullToRefresh.style.transform = `translateX(-50%) translateY(${diff}px)`;
        pullToRefresh.style.opacity = diff / 150;
        
        if (diff > 80) {
          pullToRefresh.classList.add('active');
        }
      }
    });
    
    contentArea.addEventListener('touchend', () => {
      if (pulling && currentY - startY > 80) {
        this.refresh();
      }
      
      pullToRefresh.style.transform = 'translateX(-50%) translateY(0)';
      pullToRefresh.style.opacity = '0';
      pullToRefresh.classList.remove('active');
      pulling = false;
    });
  }

  refresh() {
    const contentArea = document.querySelector('.content-area');
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton';
    skeleton.style.height = '200px';
    skeleton.style.margin = '16px';
    
    contentArea.insertBefore(skeleton, contentArea.firstChild);
    
    setTimeout(() => {
      skeleton.remove();
      this.showToast('Content refreshed');
    }, 1500);
  }

  setupVideoObserver() {
    if (this.reducedMotion) return;
    
    const videos = document.querySelectorAll('video');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.intersectionRatio >= 0.6) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, {
      threshold: [0, 0.6, 1]
    });
    
    videos.forEach(video => {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      observer.observe(video);
    });
  }

  setupParallax() {
    if (this.reducedMotion) return;
    
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxElements.forEach(el => {
        el.style.setProperty('--scroll-y', scrollY + 'px');
      });
    });
  }

  setupSegmentControls() {
    document.querySelectorAll('.segment-control').forEach(control => {
      const items = control.querySelectorAll('.segment-item');
      const indicator = control.querySelector('.segment-indicator');
      
      items.forEach((item, index) => {
        item.addEventListener('click', () => {
          items.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          
          if (indicator) {
            const width = 100 / items.length;
            indicator.style.width = `${width}%`;
            indicator.style.left = `${index * width}%`;
          }
        });
      });
      
      if (items[0]) items[0].click();
    });
  }

  setupSwipeGestures() {
    document.querySelectorAll('.swipeable').forEach(element => {
      let startX = 0;
      let currentX = 0;
      let moving = false;
      
      element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
        moving = true;
      });
      
      element.addEventListener('touchmove', (e) => {
        if (!moving) return;
        
        currentX = e.touches[0].pageX;
        const diff = currentX - startX;
        
        if (Math.abs(diff) > 10) {
          element.style.transform = `translateX(${diff}px)`;
        }
      });
      
      element.addEventListener('touchend', () => {
        const diff = currentX - startX;
        
        if (Math.abs(diff) > 100) {
          element.style.transform = `translateX(${diff > 0 ? '100%' : '-100%'})`;
          setTimeout(() => {
            element.style.display = 'none';
          }, 300);
        } else {
          element.style.transform = 'translateX(0)';
        }
        
        moving = false;
      });
    });
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-tertiary);
      color: var(--text-primary);
      padding: 12px 24px;
      border-radius: 24px;
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      animation: slideUp 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AccessibilityNavigator();
});

const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(100px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(100px); opacity: 0; }
  }
  
  .ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);