class AccessibilityNavigator {
  constructor() {
    this.scrollProgress = 0;
    this.sections = [];
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.supportsScrollTimeline = CSS.supports('animation-timeline', 'auto');
    
    this.init();
  }

  init() {
    this.setupScrollProgress();
    this.setupSectionObservers();
    this.setupParallaxEffects();
    this.setupInteractiveElements();
    this.setupCounters();
    this.setupAccordion();
    this.setupMagneticButtons();
    this.setup3DTilt();
    this.setupViewTransitions();
    
    // Expose for QA testing
    window.accessibilityNavigator = this;
  }

  setupScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      this.scrollProgress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      
      progressBar.style.transform = `scaleX(${this.scrollProgress})`;
      document.documentElement.style.setProperty('--scroll-progress', this.scrollProgress);
    };

    // Throttle for performance
    let ticking = false;
    const throttledUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledUpdate, { passive: true });
    updateProgress(); // Initial call
  }

  setupSectionObservers() {
    if (this.supportsScrollTimeline || this.isReducedMotion) {
      return; // CSS handles this natively or user prefers reduced motion
    }

    const sections = document.querySelectorAll('section[id^="sec-"]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const section = entry.target;
        const progress = this.calculateSectionProgress(entry);
        
        // Update CSS custom property for CSS animations
        section.style.setProperty('--section-progress', progress);
        
        // Trigger animations based on progress
        this.animateSection(section, progress);
      });
    }, {
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      rootMargin: '-20% 0px -20% 0px'
    });

    sections.forEach(section => {
      this.sections.push(section);
      observer.observe(section);
    });
  }

  calculateSectionProgress(entry) {
    const rect = entry.boundingClientRect;
    const windowHeight = window.innerHeight;
    
    if (entry.isIntersecting) {
      const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
      const sectionHeight = rect.height;
      return Math.max(0, Math.min(1, visibleHeight / sectionHeight));
    }
    
    return 0;
  }

  animateSection(section, progress) {
    // Apply animations based on section type
    if (section.id === 'sec-hero') {
      this.animateHero(progress);
    } else if (section.id === 'sec-about') {
      this.animateAbout(progress);
    } else if (section.id === 'sec-journey') {
      this.animateJourney(progress);
    } else if (section.id === 'sec-map') {
      this.animateMap(progress);
    } else if (section.id === 'sec-features') {
      this.animateFeatures(progress);
    } else if (section.id === 'sec-community') {
      this.animateCommunity(progress);
    }
  }

  animateHero(progress) {
    const heroText = document.querySelector('.hero-text');
    const heroImage = document.querySelector('.hero-image');
    
    if (heroText) {
      heroText.style.transform = `translateY(${progress * 5}%)`;
    }
    
    if (heroImage) {
      heroImage.style.transform = `translateY(${progress * -10}%)`;
    }
  }

  animateAbout(progress) {
    const statCards = document.querySelectorAll('.stat-card');
    const aboutImage = document.querySelector('.about-image');
    
    statCards.forEach((card, index) => {
      const delay = index * 0.1;
      const cardProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
      
      card.style.opacity = cardProgress;
      card.style.transform = `scale(${0.96 + (cardProgress * 0.04)})`;
    });
    
    if (aboutImage) {
      aboutImage.style.opacity = progress;
      aboutImage.style.transform = `translateY(${(1 - progress) * 30}px)`;
    }
  }

  animateJourney(progress) {
    const journeyActs = document.querySelectorAll('.journey-act');
    
    journeyActs.forEach((act, index) => {
      const actProgress = Math.max(0, Math.min(1, progress * 3 - index));
      
      if (actProgress > 0) {
        // Animate check cards
        const checkCards = act.querySelectorAll('.check-card');
        checkCards.forEach((card, cardIndex) => {
          const cardDelay = cardIndex * 0.2;
          const cardProgress = Math.max(0, Math.min(1, (actProgress - cardDelay) / (1 - cardDelay)));
          
          card.style.opacity = cardProgress;
          card.style.transform = `translateY(${(1 - cardProgress) * 24}px)`;
        });
        
        // Animate facility items
        const facilityItems = act.querySelectorAll('.facility-item');
        facilityItems.forEach((item, itemIndex) => {
          const itemDelay = itemIndex * 0.1;
          const itemProgress = Math.max(0, Math.min(1, (actProgress - itemDelay) / (1 - itemDelay)));
          
          item.style.opacity = itemProgress;
          item.style.transform = `scale(${0.8 + (itemProgress * 0.2)})`;
        });
        
        // Animate slope counter
        const slopeNumber = act.querySelector('.slope-number');
        if (slopeNumber && !slopeNumber.dataset.animated) {
          this.animateCounter(slopeNumber);
          slopeNumber.dataset.animated = 'true';
        }
      }
    });
  }

  animateMap(progress) {
    const mapCards = document.querySelectorAll('.map-card');
    
    mapCards.forEach((card, index) => {
      const delay = index * 0.1;
      const cardProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
      
      card.style.opacity = cardProgress;
      card.style.transform = `translateX(${(1 - cardProgress) * 40}px)`;
    });
  }

  animateFeatures(progress) {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach((card, index) => {
      const delay = index * 0.08;
      const cardProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
      
      card.style.opacity = cardProgress;
      card.style.transform = `translateY(${(1 - cardProgress) * 20}px)`;
    });
  }

  animateCommunity(progress) {
    const steps = document.querySelectorAll('.step');
    const progressBar = document.querySelector('.progress-bar');
    
    steps.forEach((step, index) => {
      const delay = index * 0.2;
      const stepProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
      
      step.style.opacity = stepProgress;
      step.style.transform = `translateX(${(1 - stepProgress) * 20}px)`;
    });
    
    if (progressBar) {
      progressBar.style.height = `${progress * 100}%`;
    }
  }

  setupParallaxEffects() {
    if (this.isReducedMotion) return;
    
    // Background parallax for hero
    const hero = document.querySelector('.hero');
    if (hero) {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        hero.style.transform = `translateY(${rate}px)`;
      }, { passive: true });
    }
  }

  setupInteractiveElements() {
    // CTA buttons
    const planRouteBtn = document.getElementById('plan-route');
    const howItWorksBtn = document.getElementById('how-it-works');
    
    if (planRouteBtn) {
      planRouteBtn.addEventListener('click', () => {
        this.handlePlanRoute();
      });
    }
    
    if (howItWorksBtn) {
      howItWorksBtn.addEventListener('click', () => {
        this.scrollToSection('sec-journey');
      });
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          this.scrollToSection(href.substring(1));
        }
      });
    });
  }

  setupCounters() {
    const counters = document.querySelectorAll('.slope-number[data-target]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          this.animateCounter(entry.target);
          entry.target.dataset.animated = 'true';
        }
      });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
  }

  animateCounter(element) {
    const target = parseFloat(element.dataset.target);
    const duration = 2000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = target * easeOutCubic;
      
      element.textContent = current.toFixed(1);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  setupAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const summary = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        
        const isOpen = item.hasAttribute('open');
        
        if (isOpen) {
          this.closeAccordion(item, answer);
        } else {
          this.openAccordion(item, answer);
        }
      });
    });
  }

  openAccordion(item, answer) {
    item.setAttribute('open', '');
    summary.setAttribute('aria-expanded', 'true');
    
    if (this.isReducedMotion) return;
    
    // Animate opening
    const startHeight = 0;
    const endHeight = answer.scrollHeight;
    
    answer.style.height = `${startHeight}px`;
    answer.style.opacity = '0';
    answer.style.overflow = 'hidden';
    
    const animation = answer.animate([
      { height: `${startHeight}px`, opacity: 0 },
      { height: `${endHeight}px`, opacity: 1 }
    ], {
      duration: 300,
      easing: 'ease-out'
    });
    
    animation.onfinish = () => {
      answer.style.height = 'auto';
      answer.style.opacity = '1';
      answer.style.overflow = 'visible';
    };
  }

  closeAccordion(item, answer) {
    item.removeAttribute('open');
    summary.setAttribute('aria-expanded', 'false');
    
    if (this.isReducedMotion) return;
    
    // Animate closing
    const startHeight = answer.scrollHeight;
    const endHeight = 0;
    
    answer.style.height = `${startHeight}px`;
    answer.style.opacity = '1';
    answer.style.overflow = 'hidden';
    
    const animation = answer.animate([
      { height: `${startHeight}px`, opacity: 1 },
      { height: `${endHeight}px`, opacity: 0 }
    ], {
      duration: 300,
      easing: 'ease-out'
    });
    
    animation.onfinish = () => {
      answer.style.height = '0';
      answer.style.opacity = '0';
      answer.style.overflow = 'hidden';
    };
  }

  setupMagneticButtons() {
    if (this.isReducedMotion) return;
    
    const magneticButtons = document.querySelectorAll('.btn-primary');
    
    magneticButtons.forEach(button => {
      button.addEventListener('mouseenter', (e) => {
        this.activateMagneticEffect(button, e);
      });
      
      button.addEventListener('mouseleave', () => {
        this.deactivateMagneticEffect(button);
      });
      
      button.addEventListener('mousemove', (e) => {
        this.updateMagneticEffect(button, e);
      });
    });
  }

  activateMagneticEffect(button, event) {
    button.dataset.magnetic = 'true';
    this.updateMagneticEffect(button, event);
  }

  deactivateMagneticEffect(button) {
    button.dataset.magnetic = 'false';
    button.style.transform = '';
    button.style.boxShadow = '';
  }

  updateMagneticEffect(button, event) {
    if (button.dataset.magnetic !== 'true') return;
    
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    
    // Limit to 8px maximum offset
    const maxOffset = 8;
    const offsetX = Math.max(-maxOffset, Math.min(maxOffset, deltaX * 0.2));
    const offsetY = Math.max(-maxOffset, Math.min(maxOffset, deltaY * 0.2));
    
    button.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    button.style.boxShadow = `0 ${4 + Math.abs(offsetY) * 0.5}px ${8 + Math.abs(offsetY)}px rgba(0, 0, 0, 0.15)`;
  }

  setup3DTilt() {
    if (this.isReducedMotion || window.innerWidth < 768) return;
    
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.dataset.tilt = 'true';
      });
      
      card.addEventListener('mouseleave', () => {
        card.dataset.tilt = 'false';
        card.style.transform = '';
      });
      
      card.addEventListener('mousemove', (e) => {
        if (card.dataset.tilt !== 'true') return;
        
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);
        
        // Limit to 6 degrees maximum rotation
        const maxRotation = 6;
        const rotateX = -deltaY * maxRotation;
        const rotateY = deltaX * maxRotation;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });
    });
  }

  setupViewTransitions() {
    if (!document.startViewTransition) return;
    
    // Handle navigation with view transitions
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        
        document.startViewTransition(() => {
          this.scrollToSection(targetId);
        });
      });
    });
  }

  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const headerOffset = 80;
    const elementPosition = section.offsetTop;
    const offsetPosition = elementPosition - headerOffset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: this.isReducedMotion ? 'instant' : 'smooth'
    });
  }

  handlePlanRoute() {
    // Simulate route planning
    const button = document.getElementById('plan-route');
    const originalText = button.textContent;
    
    button.textContent = 'Planning route...';
    button.disabled = true;
    
    setTimeout(() => {
      button.textContent = 'Route planned! 🎯';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    }, 1500);
  }

  // Public API for QA testing
  getState() {
    return {
      scrollProgress: this.scrollProgress,
      supportsScrollTimeline: this.supportsScrollTimeline,
      isReducedMotion: this.isReducedMotion,
      sections: this.sections.map(section => ({
        id: section.id,
        progress: section.style.getPropertyValue('--section-progress') || 0
      }))
    };
  }

  simulateScrollProgress(progress) {
    this.scrollProgress = Math.max(0, Math.min(1, progress));
    document.getElementById('scroll-progress').style.transform = `scaleX(${this.scrollProgress})`;
    document.documentElement.style.setProperty('--scroll-progress', this.scrollProgress);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityNavigator();
  });
} else {
  new AccessibilityNavigator();
}

// Export for QA testing
window.AccessibilityNavigator = AccessibilityNavigator;