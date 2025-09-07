class ScrollObserver {
  constructor() {
    this.observers = new Map();
    this.scrollProgress = 0;
    this.init();
  }

  init() {
    this.setupScrollProgress();
    this.setupLazyLoading();
    this.setupAnimatedElements();
    this.setupInfiniteScroll();
  }

  setupScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      this.scrollProgress = (winScroll / height) * 100;
      progressBar.style.width = `${this.scrollProgress}%`;
    });
  }

  setupLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
          
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          });
        }
      });
    }, {
      rootMargin: '50px'
    });

    lazyImages.forEach(img => imageObserver.observe(img));
    this.observers.set('images', imageObserver);
  }

  setupAnimatedElements() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animation = element.dataset.animate;
          element.classList.add(animation);
          animationObserver.unobserve(element);
        }
      });
    }, {
      threshold: 0.1
    });

    animatedElements.forEach(el => animationObserver.observe(el));
    this.observers.set('animations', animationObserver);
  }

  setupInfiniteScroll() {
    const loader = document.querySelector('.infinite-scroll-loader');
    if (!loader) return;

    const loadMoreObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadMoreContent();
        }
      });
    }, {
      rootMargin: '100px'
    });

    loadMoreObserver.observe(loader);
    this.observers.set('infinite', loadMoreObserver);
  }

  loadMoreContent() {
    const container = document.querySelector('.content-container');
    if (!container) return;

    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton';
    skeleton.style.height = '200px';
    skeleton.style.margin = '16px';
    container.appendChild(skeleton);

    setTimeout(() => {
      skeleton.remove();
      
      const newCard = document.createElement('div');
      newCard.className = 'card fade-in';
      newCard.innerHTML = `
        <div class="card-header">
          <img class="avatar" src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop" alt="User">
          <div class="card-meta">
            <div class="username">New User</div>
            <div class="timestamp">Just now</div>
          </div>
        </div>
        <div class="card-content">
          <p>New content loaded via infinite scroll</p>
        </div>
      `;
      container.appendChild(newCard);
    }, 1000);
  }

  observe(element, callback, options = {}) {
    const observer = new IntersectionObserver(callback, options);
    observer.observe(element);
    return observer;
  }

  disconnect(name) {
    const observer = this.observers.get(name);
    if (observer) {
      observer.disconnect();
      this.observers.delete(name);
    }
  }

  disconnectAll() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

class VisibilityTracker {
  constructor() {
    this.visibleElements = new Set();
    this.callbacks = new Map();
    this.init();
  }

  init() {
    this.setupVisibilityTracking();
  }

  setupVisibilityTracking() {
    const trackableElements = document.querySelectorAll('[data-track-visibility]');
    
    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        const id = element.dataset.trackVisibility;
        
        if (entry.isIntersecting) {
          this.visibleElements.add(id);
          this.onElementVisible(element);
        } else {
          this.visibleElements.delete(id);
          this.onElementHidden(element);
        }
      });
    }, {
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    trackableElements.forEach(el => visibilityObserver.observe(el));
  }

  onElementVisible(element) {
    const callback = this.callbacks.get('visible');
    if (callback) callback(element);
    
    element.dispatchEvent(new CustomEvent('elementVisible', {
      detail: { element }
    }));
  }

  onElementHidden(element) {
    const callback = this.callbacks.get('hidden');
    if (callback) callback(element);
    
    element.dispatchEvent(new CustomEvent('elementHidden', {
      detail: { element }
    }));
  }

  on(event, callback) {
    this.callbacks.set(event, callback);
  }

  getVisibleElements() {
    return Array.from(this.visibleElements);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.scrollObserver = new ScrollObserver();
  window.visibilityTracker = new VisibilityTracker();
});

const observerStyles = document.createElement('style');
observerStyles.textContent = `
  .fade-in {
    animation: fadeIn 0.5s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    background: var(--accent);
    z-index: 10000;
    transition: width 0.1s;
  }
  
  img[data-src] {
    filter: blur(5px);
    transition: filter 0.3s;
  }
  
  img.loaded {
    filter: blur(0);
  }
`;
document.head.appendChild(observerStyles);