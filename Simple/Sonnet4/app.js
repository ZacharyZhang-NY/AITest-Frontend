/**
 * Accessibility Navigator - Core JavaScript
 * Handles scrolling animations, interactions, and progressive enhancement
 */

class AccessibilityNavigator {
  constructor() {
    this.scrollProgress = 0;
    this.sectionProgress = new Map();
    this.supportsScrollTimeline = false;
    this.prefersReducedMotion = false;
    this.observers = new Map();
    this.animationFrameId = null;
    
    // Initialize the application
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Check capabilities and preferences
      await this.checkCapabilities();
      
      // Setup core systems
      this.setupScrollProgress();
      this.setupIntersectionObservers();
      this.setupScrollAnimations();
      
      // Setup interactive elements
      this.setupMagneticButtons();
      this.setupAccordions();
      this.setup3DTilt();
      this.setupCounters();
      
      // Setup navigation
      this.setupSmoothScrolling();
      this.setupViewTransitions();
      
      // Mark initialization complete
      document.body.classList.add('js-loaded');
      console.log('✅ Accessibility Navigator initialized');
      
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Check browser capabilities and user preferences
   */
  async checkCapabilities() {
    // Check for CSS Scroll-Linked Animations support
    this.supportsScrollTimeline = CSS.supports('animation-timeline: view()') || 
                                  CSS.supports('animation-timeline: scroll()');
    
    // Check motion preferences
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Listen for changes in motion preferences
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      this.handleMotionPreferenceChange();
    });

    console.log('📊 Capabilities checked:', {
      scrollTimeline: this.supportsScrollTimeline,
      reducedMotion: this.prefersReducedMotion
    });
  }

  /**
   * Setup scroll progress tracking
   */
  setupScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollProgress = Math.min(scrollTop / documentHeight, 1);
      
      // Update CSS custom property
      document.documentElement.style.setProperty('--scroll-progress', this.scrollProgress);
      
      // Update progress bar if not using CSS scroll-timeline
      if (!this.supportsScrollTimeline) {
        progressBar.style.transform = `scaleX(${this.scrollProgress})`;
      }
    };

    // Use requestAnimationFrame for smooth updates
    const handleScroll = () => {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.animationFrameId = requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress(); // Initial update
  }

  /**
   * Setup intersection observers for animation triggers
   */
  setupIntersectionObservers() {
    // Generic observer for fade-in animations
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          if (!this.supportsScrollTimeline) {
            this.triggerFallbackAnimation(entry.target);
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px'
    });

    // Observer for section progress tracking
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.id;
        if (entry.isIntersecting) {
          this.updateSectionProgress(sectionId, entry.intersectionRatio);
        }
      });
    }, {
      threshold: Array.from({length: 21}, (_, i) => i / 20) // 0, 0.05, 0.1, ..., 1
    });

    // Observe elements for animations
    const animatedElements = [
      '.hero-content', '.hero-image',
      '.stat-card', '.access-card', '.map-card', '.feature-card',
      '.step-item', '.checklist-item', '.cta-content',
      '.info-bar', '.route-suggestion'
    ];

    animatedElements.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        fadeObserver.observe(element);
      });
    });

    // Observe sections for progress tracking
    document.querySelectorAll('section[id]').forEach(section => {
      sectionObserver.observe(section);
    });

    this.observers.set('fade', fadeObserver);
    this.observers.set('section', sectionObserver);
  }

  /**
   * Update section-specific progress
   */
  updateSectionProgress(sectionId, ratio) {
    this.sectionProgress.set(sectionId, ratio);
    document.documentElement.style.setProperty(`--${sectionId}-progress`, ratio);
    
    // Special handling for timeline progress in community section
    if (sectionId === 'sec-crowd') {
      document.documentElement.style.setProperty('--section-progress', ratio);
    }
  }

  /**
   * Setup scroll-based animations with fallbacks
   */
  setupScrollAnimations() {
    if (this.supportsScrollTimeline) {
      // CSS Scroll-Linked Animations are supported
      console.log('✅ Using CSS Scroll-Linked Animations');
      return;
    }

    // Fallback: Use IntersectionObserver + WAAPI/CSS transitions
    console.log('⚠️ Falling back to IntersectionObserver animations');
    this.setupFallbackAnimations();
  }

  /**
   * Setup fallback animations for browsers without ScrollTimeline support
   */
  setupFallbackAnimations() {
    // Hero parallax effect
    this.setupParallaxEffect('.hero', [
      { selector: '.hero-image', speed: -0.1 },
      { selector: '.hero-content', speed: 0.05 }
    ]);

    // About section parallax
    this.setupParallaxEffect('.about', [
      { selector: '.about-image', speed: -0.08 },
      { selector: '.about-stats', speed: 0.04 }
    ]);

    // CTA section contrast enhancement
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const img = entry.target.querySelector('.cta-bg img');
        if (img) {
          if (entry.isIntersecting) {
            img.classList.add('enhanced');
          }
        }
      });
    }, { threshold: 0.3 });

    const ctaSection = document.querySelector('.cta');
    if (ctaSection) {
      ctaObserver.observe(ctaSection);
    }
  }

  /**
   * Setup parallax effect for specified elements
   */
  setupParallaxEffect(containerSelector, elements) {
    const container = document.querySelector(containerSelector);
    if (!container || this.prefersReducedMotion) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.startParallax(container, elements);
        } else {
          this.stopParallax(container);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(container);
  }

  /**
   * Start parallax animation
   */
  startParallax(container, elements) {
    if (this.prefersReducedMotion) return;

    const animate = () => {
      const rect = container.getBoundingClientRect();
      const scrollPercent = Math.max(0, Math.min(1, 
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
      ));

      elements.forEach(({ selector, speed }) => {
        const element = container.querySelector(selector);
        if (element) {
          const translateY = scrollPercent * speed * 100;
          element.style.transform = `translateY(${translateY}px)`;
        }
      });

      if (container.dataset.parallaxActive === 'true') {
        requestAnimationFrame(animate);
      }
    };

    container.dataset.parallaxActive = 'true';
    animate();
  }

  /**
   * Stop parallax animation
   */
  stopParallax(container) {
    container.dataset.parallaxActive = 'false';
  }

  /**
   * Trigger fallback animation for elements without ScrollTimeline support
   */
  triggerFallbackAnimation(element) {
    if (this.prefersReducedMotion) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      return;
    }

    // Determine animation type based on element classes
    if (element.classList.contains('hero-content')) {
      this.animateElement(element, { y: 20, opacity: 0 }, { y: 0, opacity: 1 });
    } else if (element.classList.contains('hero-image')) {
      this.animateElement(element, { filter: 'blur(8px)', opacity: 0 }, { filter: 'blur(0)', opacity: 1 });
    } else if (element.classList.contains('stat-card')) {
      const delay = Array.from(element.parentElement.children).indexOf(element) * 100;
      setTimeout(() => {
        this.animateElement(element, { scale: 0.96, opacity: 0 }, { scale: 1, opacity: 1 });
      }, delay);
    } else if (element.classList.contains('map-card')) {
      const delay = Array.from(element.parentElement.children).indexOf(element) * 150;
      setTimeout(() => {
        this.animateElement(element, { x: 40, opacity: 0 }, { x: 0, opacity: 1 });
      }, delay);
    } else {
      // Generic fade-in-up animation
      this.animateElement(element, { y: 20, opacity: 0 }, { y: 0, opacity: 1 });
    }
  }

  /**
   * Animate element using Web Animations API
   */
  animateElement(element, from, to) {
    if (!element || this.prefersReducedMotion) {
      // Apply final state immediately if reduced motion is preferred
      Object.keys(to).forEach(prop => {
        if (prop === 'opacity') {
          element.style.opacity = to[prop];
        } else if (prop === 'x' || prop === 'y') {
          const transform = element.style.transform || '';
          const newTransform = transform.replace(/translate[XY]\([^)]*\)/g, '').trim();
          const translateValue = prop === 'x' ? `translateX(${to[prop]}px)` : `translateY(${to[prop]}px)`;
          element.style.transform = `${newTransform} ${translateValue}`.trim();
        } else if (prop === 'scale') {
          const transform = element.style.transform || '';
          const newTransform = transform.replace(/scale\([^)]*\)/g, '').trim();
          element.style.transform = `${newTransform} scale(${to[prop]})`.trim();
        } else if (prop === 'filter') {
          element.style.filter = to[prop];
        }
      });
      return;
    }

    // Create keyframes
    const keyframes = [from, to];
    
    // Animation options
    const options = {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    };

    // Use Web Animations API
    if (element.animate) {
      element.animate(keyframes, options);
    } else {
      // Fallback to CSS transitions
      Object.keys(to).forEach(prop => {
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
          if (prop === 'opacity') {
            element.style.opacity = to[prop];
          } else if (prop === 'x' || prop === 'y') {
            const translateValue = prop === 'x' ? `translateX(${to[prop]}px)` : `translateY(${to[prop]}px)`;
            element.style.transform = translateValue;
          }
        }, 50);
      });
    }
  }

  /**
   * Setup magnetic button effects
   */
  setupMagneticButtons() {
    const magneticButtons = document.querySelectorAll('.magnetic-btn');
    
    magneticButtons.forEach(button => {
      if (this.prefersReducedMotion) return;

      let isHovering = false;

      const handleMouseMove = (e) => {
        if (!isHovering) return;

        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * 0.15;
        const deltaY = (e.clientY - centerY) * 0.15;
        
        // Limit movement to 8px
        const limitedX = Math.max(-8, Math.min(8, deltaX));
        const limitedY = Math.max(-8, Math.min(8, deltaY));
        
        button.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
        button.style.boxShadow = `${limitedX}px ${limitedY + 4}px 20px rgba(0,0,0,0.15)`;
      };

      const handleMouseEnter = () => {
        isHovering = true;
        button.style.willChange = 'transform, box-shadow';
      };

      const handleMouseLeave = () => {
        isHovering = false;
        button.style.transform = 'translate(0px, 0px)';
        button.style.boxShadow = '';
        button.style.willChange = 'auto';
      };

      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);
      button.addEventListener('mousemove', handleMouseMove);

      // Touch device handling
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        button.style.transform = 'scale(0.98)';
      });

      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        button.style.transform = '';
        // Trigger click after animation
        setTimeout(() => {
          button.click();
        }, 150);
      });
    });
  }

  /**
   * Setup accordion functionality
   */
  setupAccordions() {
    const accordionButtons = document.querySelectorAll('.faq-question');
    
    accordionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleAccordion(button);
      });

      // Keyboard support
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleAccordion(button);
        }
      });
    });
  }

  /**
   * Toggle accordion open/close
   */
  toggleAccordion(button) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const answerId = button.getAttribute('aria-controls');
    const answer = document.getElementById(answerId);

    if (!answer) return;

    // Close all other accordions first
    document.querySelectorAll('.faq-question').forEach(otherButton => {
      if (otherButton !== button && otherButton.getAttribute('aria-expanded') === 'true') {
        const otherAnswerId = otherButton.getAttribute('aria-controls');
        const otherAnswer = document.getElementById(otherAnswerId);
        if (otherAnswer) {
          this.closeAccordion(otherButton, otherAnswer);
        }
      }
    });

    // Toggle current accordion
    if (isExpanded) {
      this.closeAccordion(button, answer);
    } else {
      this.openAccordion(button, answer);
    }
  }

  /**
   * Open accordion with animation
   */
  openAccordion(button, answer) {
    button.setAttribute('aria-expanded', 'true');
    
    // Measure the natural height
    answer.style.display = 'block';
    answer.style.maxHeight = 'none';
    const naturalHeight = answer.scrollHeight;
    answer.style.maxHeight = '0';
    
    // Force reflow
    answer.offsetHeight;
    
    // Animate to natural height
    answer.classList.add('expanded');
    answer.style.maxHeight = `${naturalHeight}px`;
    
    // Clean up after animation
    setTimeout(() => {
      answer.style.maxHeight = 'none';
    }, 300);
  }

  /**
   * Close accordion with animation
   */
  closeAccordion(button, answer) {
    button.setAttribute('aria-expanded', 'false');
    
    // Set explicit height before animating
    answer.style.maxHeight = `${answer.scrollHeight}px`;
    
    // Force reflow
    answer.offsetHeight;
    
    // Animate to 0
    answer.classList.remove('expanded');
    answer.style.maxHeight = '0';
    
    // Hide after animation
    setTimeout(() => {
      answer.style.display = '';
    }, 300);
  }

  /**
   * Setup 3D tilt effects for feature cards
   */
  setup3DTilt() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
      if (this.prefersReducedMotion) return;

      const handleMouseMove = (e) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const rotateX = (e.clientY - centerY) / rect.height * -6; // Max 6 degrees
        const rotateY = (e.clientX - centerX) / rect.width * 6;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        card.style.boxShadow = `${rotateY}px ${-rotateX + 10}px 30px rgba(0,0,0,0.1)`;
      };

      const handleMouseEnter = () => {
        card.style.willChange = 'transform, box-shadow';
        card.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
      };

      const handleMouseLeave = () => {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.willChange = 'auto';
        card.style.transition = 'all 0.3s ease-out';
      };

      // Only add effects for non-touch devices
      if (!('ontouchstart' in window)) {
        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);
        card.addEventListener('mousemove', handleMouseMove);
      }
    });
  }

  /**
   * Setup animated counters
   */
  setupCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const animateCounter = (counter) => {
      if (this.prefersReducedMotion) {
        counter.textContent = counter.dataset.count;
        return;
      }

      const target = parseInt(counter.dataset.count);
      const duration = 2000; // 2 seconds
      const start = performance.now();
      
      const update = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutCubic)
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        const current = Math.floor(easeOutCubic * target);
        counter.textContent = current.toLocaleString();
        
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };
      
      requestAnimationFrame(update);
    };

    // Observer to trigger counter animation
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  }

  /**
   * Setup smooth scrolling for navigation links
   */
  setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          this.scrollToElement(targetElement);
        }
      });
    });
  }

  /**
   * Smooth scroll to element with offset for sticky header
   */
  scrollToElement(element) {
    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
    const targetPosition = element.offsetTop - headerHeight - 20;
    
    if (this.prefersReducedMotion) {
      window.scrollTo(0, targetPosition);
      return;
    }

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  /**
   * Setup View Transitions API if available
   */
  setupViewTransitions() {
    if (!('startViewTransition' in document)) {
      console.log('⚠️ View Transitions API not supported');
      return;
    }

    console.log('✅ View Transitions API available');
    
    // Add view transition names to key elements
    const transitionElements = [
      { selector: '.hero-title', name: 'hero-title' },
      { selector: '.section-title', name: 'section-title' },
      { selector: '.nav-brand', name: 'nav-brand' }
    ];

    transitionElements.forEach(({ selector, name }) => {
      const element = document.querySelector(selector);
      if (element) {
        element.style.viewTransitionName = name;
      }
    });
  }

  /**
   * Handle motion preference changes
   */
  handleMotionPreferenceChange() {
    console.log('Motion preference changed:', this.prefersReducedMotion);
    
    if (this.prefersReducedMotion) {
      // Disable animations and remove will-change properties
      document.querySelectorAll('[style*="will-change"]').forEach(el => {
        el.style.willChange = 'auto';
      });
      
      // Stop parallax animations
      document.querySelectorAll('[data-parallax-active="true"]').forEach(el => {
        this.stopParallax(el);
      });
    }
    
    document.body.classList.toggle('reduced-motion', this.prefersReducedMotion);
  }

  /**
   * Handle initialization errors gracefully
   */
  handleInitializationError(error) {
    console.error('Initialization error:', error);
    
    // Ensure basic functionality works even if enhanced features fail
    document.body.classList.add('js-error');
    
    // Show all content immediately
    document.querySelectorAll('[style*="opacity"]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    // Basic accordion functionality as fallback
    document.querySelectorAll('.faq-question').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const answerId = button.getAttribute('aria-controls');
        const answer = document.getElementById(answerId);
        if (answer) {
          const isOpen = answer.style.display === 'block';
          answer.style.display = isOpen ? 'none' : 'block';
          button.setAttribute('aria-expanded', !isOpen);
        }
      });
    });
  }

  /**
   * Public API for external access
   */
  getScrollProgress() {
    return this.scrollProgress;
  }

  getSectionProgress(sectionId) {
    return this.sectionProgress.get(sectionId) || 0;
  }

  /**
   * Cleanup method
   */
  destroy() {
    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Remove event listeners
    window.removeEventListener('scroll', this.handleScroll);
    
    console.log('🧹 Accessibility Navigator cleaned up');
  }
}

/**
 * Initialize the application when DOM is ready
 */
function initializeApp() {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
    return;
  }

  // Initialize the main application
  window.accessibilityNavigator = new AccessibilityNavigator();

  // Setup button actions
  setupButtonActions();

  // Setup debug panel toggle
  setupDebugPanel();
}

/**
 * Setup button click actions
 */
function setupButtonActions() {
  document.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    
    switch (action) {
      case 'plan-route':
        console.log('🗺️ Plan route action triggered');
        // Here you would typically open a route planning interface
        showNotification('Route planning feature coming soon!');
        break;
        
      case 'start-planning':
        console.log('🚀 Start planning action triggered');
        showNotification('Planning interface launching...');
        break;
        
      case 'share-report':
        console.log('📊 Share report action triggered');
        showNotification('Report sharing feature coming soon!');
        break;
    }
  });
}

/**
 * Setup debug panel functionality
 */
function setupDebugPanel() {
  const qaFloat = document.getElementById('qa-status');
  const debugPanel = document.getElementById('debug-panel');
  
  if (qaFloat && debugPanel) {
    qaFloat.addEventListener('click', () => {
      const isVisible = debugPanel.style.display === 'block';
      debugPanel.style.display = isVisible ? 'none' : 'block';
    });
  }
}

/**
 * Show temporary notification
 */
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 24px;
    background: var(--color-primary);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 1001;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
  `;

  // Add keyframe for animation
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Utility function to check if element is in viewport
 */
function isInViewport(element, threshold = 0.1) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  
  return (
    rect.top < windowHeight * (1 - threshold) &&
    rect.bottom > windowHeight * threshold
  );
}

/**
 * Utility function to throttle function calls
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

/**
 * Export for potential module usage
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityNavigator;
}

// Initialize the application
initializeApp();