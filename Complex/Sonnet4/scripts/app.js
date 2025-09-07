// Accessibility Navigator - Main App JavaScript
// Core interactions, auto-play, ripple effects, theme switching

class AccessibilityNavigator {
  constructor() {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.currentTheme = this.getTheme();
    this.observers = new Map();
    
    this.init();
  }
  
  init() {
    this.setupTheme();
    this.setupVideoAutoPlay();
    this.setupRippleEffects();
    this.setupPullToRefresh();
    this.setupSkeletonLoading();
    this.setupTabBar();
    this.setupSegmentedControl();
    this.setupAccessibilityFeatures();
    this.setupTouchInteractions();
  }
  
  // Theme Management
  getTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  setupTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    const themeSwitch = document.querySelector('[data-theme-switch]');
    if (themeSwitch) {
      themeSwitch.addEventListener('change', (e) => {
        this.currentTheme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
      });
    }
  }
  
  // Video Auto-play with Intersection Observer
  setupVideoAutoPlay() {
    const videos = document.querySelectorAll('video[data-autoplay]');
    
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            if (!this.isReducedMotion) {
              video.play().catch(e => console.log('Video play failed:', e));
            }
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.6 });
      
      videos.forEach(video => {
        video.muted = true; // Ensure muted for autoplay policy
        videoObserver.observe(video);
      });
      
      this.observers.set('video', videoObserver);
    }
  }
  
  // Ripple Effect for Interactive Elements
  setupRippleEffects() {
    const rippleElements = document.querySelectorAll('.ripple');
    
    rippleElements.forEach(element => {
      element.addEventListener('click', (e) => {
        if (this.isReducedMotion) return;
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple-effect 0.6s ease-out;
          pointer-events: none;
          z-index: 10;
        `;
        
        element.style.position = element.style.position || 'relative';
        element.appendChild(ripple);
        
        ripple.addEventListener('animationend', () => {
          ripple.remove();
        });
      });
    });
    
    // Add ripple animation keyframes
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple-effect {
          to {
            transform: scale(1);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Pull to Refresh
  setupPullToRefresh() {
    const refreshContainer = document.querySelector('[data-pull-refresh]');
    if (!refreshContainer) return;
    
    let startY = 0;
    let currentY = 0;
    let isRefreshing = false;
    const threshold = 80;
    
    const refreshIndicator = document.createElement('div');
    refreshIndicator.className = 'refresh-indicator';
    refreshIndicator.innerHTML = '<div class="refresh-spinner"></div>';
    refreshContainer.prepend(refreshIndicator);
    
    refreshContainer.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });
    
    refreshContainer.addEventListener('touchmove', (e) => {
      currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;
      
      if (pullDistance > 0 && refreshContainer.scrollTop === 0) {
        e.preventDefault();
        const opacity = Math.min(pullDistance / threshold, 1);
        const rotation = pullDistance * 2;
        
        refreshIndicator.style.opacity = opacity;
        refreshIndicator.style.transform = `translateY(${Math.min(pullDistance, threshold)}px) rotate(${rotation}deg)`;
      }
    });
    
    refreshContainer.addEventListener('touchend', () => {
      const pullDistance = currentY - startY;
      
      if (pullDistance > threshold && !isRefreshing) {
        isRefreshing = true;
        refreshIndicator.style.opacity = '1';
        refreshIndicator.style.transform = 'translateY(60px)';
        
        // Simulate refresh
        setTimeout(() => {
          refreshIndicator.style.opacity = '0';
          refreshIndicator.style.transform = 'translateY(0)';
          isRefreshing = false;
        }, 1500);
      } else {
        refreshIndicator.style.opacity = '0';
        refreshIndicator.style.transform = 'translateY(0)';
      }
    });
  }
  
  // Skeleton Loading
  setupSkeletonLoading() {
    const skeletons = document.querySelectorAll('.skeleton');
    
    // Simulate loading completion
    setTimeout(() => {
      skeletons.forEach(skeleton => {
        skeleton.classList.add('loaded');
        skeleton.style.animation = 'none';
      });
    }, 2000);
  }
  
  // Tab Bar Active States
  setupTabBar() {
    const tabItems = document.querySelectorAll('.tab-item');
    const currentPath = window.location.pathname;
    
    tabItems.forEach(tab => {
      const href = tab.getAttribute('href');
      if (href && currentPath.includes(href.replace('.html', ''))) {
        tab.classList.add('active');
      }
      
      tab.addEventListener('click', (e) => {
        if (tab.getAttribute('href') === '#') {
          e.preventDefault();
        }
        
        tabItems.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  }
  
  // Segmented Control (for Home page tabs)
  setupSegmentedControl() {
    const segmentedControls = document.querySelectorAll('.segmented-control');
    
    segmentedControls.forEach(control => {
      const segments = control.querySelectorAll('.segment');
      const indicator = control.querySelector('.segment-indicator');
      
      if (indicator && segments.length > 0) {
        // Set initial position
        const activeSegment = control.querySelector('.segment.active') || segments[0];
        this.updateSegmentIndicator(indicator, activeSegment);
        
        segments.forEach(segment => {
          segment.addEventListener('click', () => {
            segments.forEach(s => s.classList.remove('active'));
            segment.classList.add('active');
            this.updateSegmentIndicator(indicator, segment);
          });
        });
      }
    });
  }
  
  updateSegmentIndicator(indicator, activeSegment) {
    const rect = activeSegment.getBoundingClientRect();
    const containerRect = activeSegment.parentElement.getBoundingClientRect();
    const left = rect.left - containerRect.left;
    const width = rect.width;
    
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${width}px`;
  }
  
  // Accessibility Features
  setupAccessibilityFeatures() {
    // High contrast toggle
    const contrastToggle = document.querySelector('[data-high-contrast]');
    if (contrastToggle) {
      contrastToggle.addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-high-contrast', e.target.checked);
        localStorage.setItem('high-contrast', e.target.checked);
      });
    }
    
    // Large text toggle
    const largeTextToggle = document.querySelector('[data-large-text]');
    if (largeTextToggle) {
      largeTextToggle.addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-large-text', e.target.checked);
        localStorage.setItem('large-text', e.target.checked);
      });
    }
    
    // Load saved preferences
    const savedContrast = localStorage.getItem('high-contrast') === 'true';
    const savedLargeText = localStorage.getItem('large-text') === 'true';
    
    document.documentElement.setAttribute('data-high-contrast', savedContrast);
    document.documentElement.setAttribute('data-large-text', savedLargeText);
  }
  
  // Touch Interactions
  setupTouchInteractions() {
    // Long press for context menus
    const longPressElements = document.querySelectorAll('[data-long-press]');
    
    longPressElements.forEach(element => {
      let pressTimer;
      
      element.addEventListener('touchstart', () => {
        pressTimer = setTimeout(() => {
          this.showContextMenu(element);
        }, 500);
      });
      
      element.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
      });
      
      element.addEventListener('touchmove', () => {
        clearTimeout(pressTimer);
      });
    });
    
    // Swipe gestures for lists
    this.setupSwipeGestures();
  }
  
  setupSwipeGestures() {
    const swipeElements = document.querySelectorAll('[data-swipe]');
    
    swipeElements.forEach(element => {
      let startX = 0;
      let currentX = 0;
      let isSwinging = false;
      
      element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isSwinging = true;
      }, { passive: true });
      
      element.addEventListener('touchmove', (e) => {
        if (!isSwinging) return;
        
        currentX = e.touches[0].clientX;
        const diff = startX - currentX;
        
        if (Math.abs(diff) > 10) {
          element.style.transform = `translateX(${-diff}px)`;
        }
      }, { passive: true });
      
      element.addEventListener('touchend', () => {
        const diff = startX - currentX;
        
        if (Math.abs(diff) > 100) {
          // Show action buttons
          element.classList.add('swiped');
        } else {
          element.style.transform = 'translateX(0)';
        }
        
        isSwining = false;
      });
    });
  }
  
  showContextMenu(element) {
    // Create and show context menu
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
      <button class="context-menu-item">复制</button>
      <button class="context-menu-item">举报</button>
      <button class="context-menu-item">删除</button>
    `;
    
    document.body.appendChild(menu);
    
    // Position menu
    const rect = element.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 8}px`;
    menu.style.left = `${rect.left}px`;
    
    // Remove menu on click outside
    const removeMenu = () => {
      menu.remove();
      document.removeEventListener('click', removeMenu);
    };
    
    setTimeout(() => {
      document.addEventListener('click', removeMenu);
    }, 100);
  }
  
  // Like Animation
  animateLike(button) {
    if (this.isReducedMotion) return;
    
    const heart = button.querySelector('i');
    heart.style.animation = 'heartBeat 0.6s ease-in-out';
    
    // Create particles
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      particle.className = 'like-particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: #ff6b6b;
        border-radius: 50%;
        pointer-events: none;
        z-index: 100;
      `;
      
      button.appendChild(particle);
      
      const angle = (i * 60) * Math.PI / 180;
      const distance = 20 + Math.random() * 10;
      
      particle.animate([
        { 
          transform: 'translate(0, 0) scale(1)',
          opacity: 1
        },
        { 
          transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
          opacity: 0
        }
      ], {
        duration: 800,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => particle.remove();
    }
    
    heart.addEventListener('animationend', () => {
      heart.style.animation = '';
    }, { once: true });
  }
  
  // Collect Animation  
  animateCollect(button) {
    if (this.isReducedMotion) return;
    
    const bookmark = button.querySelector('i');
    bookmark.style.animation = 'collectBounce 0.4s ease-in-out';
    
    bookmark.addEventListener('animationend', () => {
      bookmark.style.animation = '';
    }, { once: true });
  }
  
  // Utility Methods
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Animation Keyframes
const animationStyles = `
  @keyframes heartBeat {
    0% { transform: scale(1); }
    14% { transform: scale(1.3); }
    28% { transform: scale(1); }
    42% { transform: scale(1.3); }
    70% { transform: scale(1); }
  }
  
  @keyframes collectBounce {
    0% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.2) rotate(-5deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
  
  .refresh-indicator {
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 100;
  }
  
  .refresh-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border-color);
    border-top: 2px solid var(--accent-blue);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .context-menu {
    position: fixed;
    background: var(--card-bg);
    border-radius: 12px;
    box-shadow: 0 10px 30px var(--shadow-color);
    border: 1px solid var(--border-color);
    backdrop-filter: blur(20px);
    z-index: 1000;
    min-width: 120px;
    overflow: hidden;
  }
  
  .context-menu-item {
    display: block;
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: var(--font-size-md);
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .context-menu-item:hover {
    background: var(--bg-tertiary);
  }
  
  .like-particle {
    animation: particleFloat 0.8s ease-out forwards;
  }
`;

// Add styles to head
if (!document.getElementById('app-animations')) {
  const style = document.createElement('style');
  style.id = 'app-animations';
  style.textContent = animationStyles;
  document.head.appendChild(style);
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityApp = new AccessibilityNavigator();
  });
} else {
  window.accessibilityApp = new AccessibilityNavigator();
}

// Export for use in other scripts
window.AccessibilityNavigator = AccessibilityNavigator;