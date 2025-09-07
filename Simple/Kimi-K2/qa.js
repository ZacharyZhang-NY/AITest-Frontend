class QAEngine {
  constructor() {
    this.results = [];
    this.errors = [];
    this.warnings = [];
    this.status = 'running';
    this.startTime = performance.now();
    
    this.init();
  }

  init() {
    this.setupErrorHandling();
    this.setupStatusUI();
    this.runChecks();
  }

  setupErrorHandling() {
    // Capture JavaScript errors
    window.addEventListener('error', (event) => {
      this.errors.push({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.errors.push({
        type: 'promise',
        message: event.reason?.message || event.reason,
        reason: event.reason
      });
    });

    // Network error monitoring
    this.monitorNetworkErrors();
  }

  monitorNetworkErrors() {
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      return originalFetch.apply(this, args)
        .catch(error => {
          this.errors.push({
            type: 'network',
            message: error.message,
            url: args[0]
          });
          throw error;
        });
    };

    // Monitor image loading
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.complete) {
        this.checkImageLoad(img);
      } else {
        img.addEventListener('load', () => this.checkImageLoad(img));
        img.addEventListener('error', () => this.handleImageError(img));
      }
    });
  }

  checkImageLoad(img) {
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      this.handleImageError(img);
    }
  }

  handleImageError(img) {
    this.errors.push({
      type: 'image',
      message: `Failed to load image: ${img.src}`,
      src: img.src,
      alt: img.alt
    });
    
    // Visual indicator for failed images
    img.style.outline = '2px solid #EF4444';
    img.style.outlineOffset = '2px';
    img.title = 'Image failed to load';
  }

  setupStatusUI() {
    const statusElement = document.getElementById('qa-status');
    const panelElement = document.getElementById('qa-panel');
    const resultsElement = document.getElementById('qa-results');
    const closeButton = document.getElementById('qa-close');

    if (statusElement) {
      statusElement.addEventListener('click', () => {
        this.togglePanel();
      });
    }

    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.hidePanel();
      });
    }
  }

  togglePanel() {
    const panel = document.getElementById('qa-panel');
    if (panel) {
      panel.classList.toggle('hidden');
      if (!panel.classList.contains('hidden')) {
        this.displayResults();
      }
    }
  }

  hidePanel() {
    const panel = document.getElementById('qa-panel');
    if (panel) {
      panel.classList.add('hidden');
    }
  }

  async runChecks() {
    this.log('Starting QA checks...');

    // Run all checks
    await this.checkSemanticStructure();
    await this.checkAccessibility();
    await this.checkScrollSystem();
    await this.checkResponsiveDesign();
    await this.checkPerformance();
    await this.checkAnimationSystem();
    await this.checkContentIntegrity();
    await this.checkInteractiveElements();
    await this.checkNetworkResources();
    
    // Final evaluation
    this.evaluateResults();
    this.updateStatusUI();
    this.displayResults();
    
    this.log(`QA checks completed in ${(performance.now() - this.startTime).toFixed(2)}ms`);
  }

  async checkSemanticStructure() {
    this.log('Checking semantic structure...');
    
    // Check for single H1
    const h1Elements = document.querySelectorAll('h1');
    if (h1Elements.length !== 1) {
      this.errors.push({
        type: 'semantic',
        message: `Expected exactly 1 \u003ch1\u003e element, found ${h1Elements.length}`
      });
    }

    // Check for H2 in each section
    const sections = document.querySelectorAll('section[id^="sec-"]');
    sections.forEach((section, index) => {
      const h2 = section.querySelector('h2');
      if (!h2) {
        this.errors.push({
          type: 'semantic',
          message: `Section "${section.id}" missing \u003ch2\u003e element`
        });
      }
    });

    // Check section order
    const expectedSections = [
      'sec-hero', 'sec-about', 'sec-journey', 'sec-map', 
      'sec-features', 'sec-community', 'sec-faq', 'sec-cta'
    ];
    
    const actualSections = Array.from(sections).map(s => s.id);
    expectedSections.forEach((expected, index) => {
      if (actualSections[index] !== expected) {
        this.warnings.push({
          type: 'semantic',
          message: `Section order mismatch: expected "${expected}" at position ${index}, found "${actualSections[index]}"`
        });
      }
    });

    this.results.push({
      check: 'Semantic Structure',
      status: this.errors.filter(e => e.type === 'semantic').length === 0 ? 'pass' : 'fail',
      details: `Found ${h1Elements.length} H1, ${sections.length} sections with H2`
    });
  }

  async checkAccessibility() {
    this.log('Checking accessibility...');
    
    // Check color contrast
    const elements = document.querySelectorAll('body *');
    let contrastIssues = 0;
    
    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      const bgColor = this.getRgbValues(style.backgroundColor);
      const textColor = this.getRgbValues(style.color);
      
      if (bgColor && textColor) {
        const contrastRatio = this.calculateContrastRatio(bgColor, textColor);
        if (contrastRatio < 4.5) {
          contrastIssues++;
          element.style.outline = '1px solid #F59E0B';
          element.style.outlineOffset = '1px';
        }
      }
    });

    // Check focus management
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    let focusIssues = 0;
    
    focusableElements.forEach(element => {
      if (!element.matches(':focus-visible')) {
        const style = window.getComputedStyle(element);
        if (style.outline === 'none' || style.outline === '0px') {
          focusIssues++;
        }
      }
    });

    // Check ARIA attributes
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const summary = item.querySelector('.faq-question');
      if (!summary.hasAttribute('aria-expanded')) {
        this.warnings.push({
          type: 'accessibility',
          message: 'FAQ item missing aria-expanded attribute'
        });
      }
    });

    this.results.push({
      check: 'Accessibility',
      status: contrastIssues === 0 && focusIssues < 5 ? 'pass' : 'fail',
      details: `${contrastIssues} contrast issues, ${focusIssues} focus issues`
    });
  }

  async checkScrollSystem() {
    this.log('Checking scroll system...');
    
    // Check scroll progress element
    const scrollProgress = document.getElementById('scroll-progress');
    if (!scrollProgress) {
      this.errors.push({
        type: 'scroll',
        message: 'Scroll progress element not found'
      });
    }

    // Check section progress tracking
    const sections = document.querySelectorAll('section[id^="sec-"]');
    let progressTracking = 0;
    
    sections.forEach(section => {
      const progress = section.style.getPropertyValue('--section-progress');
      if (progress) {
        progressTracking++;
      }
    });

    // Check sticky positioning support
    const stickyElements = document.querySelectorAll('.journey-act, .hero');
    let stickySupport = true;
    
    if (window.innerWidth >= 1024) {
      stickyElements.forEach(element => {
        const style = window.getComputedStyle(element);
        if (style.position !== 'sticky' && style.position !== '-webkit-sticky') {
          stickySupport = false;
        }
      });
    }

    this.results.push({
      check: 'Scroll System',
      status: scrollProgress && progressTracking > 0 ? 'pass' : 'fail',
      details: `Scroll progress: ${scrollProgress ? 'OK' : 'Missing'}, Sections tracked: ${progressTracking}/${sections.length}, Sticky: ${stickySupport}`
    });
  }

  async checkResponsiveDesign() {
    this.log('Checking responsive design...');
    
    const viewportWidth = window.innerWidth;
    let responsiveIssues = 0;
    
    // Check for responsive images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('loading') || img.getAttribute('loading') !== 'lazy') {
        responsiveIssues++;
        this.warnings.push({
          type: 'responsive',
          message: `Image missing lazy loading: ${img.src}`
        });
      }
      
      if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
        responsiveIssues++;
        this.warnings.push({
          type: 'responsive',
          message: `Image missing dimensions: ${img.src}`
        });
      }
    });

    // Check for viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      this.errors.push({
        type: 'responsive',
        message: 'Viewport meta tag not found'
      });
    }

    this.results.push({
      check: 'Responsive Design',
      status: responsiveIssues < 10 ? 'pass' : 'fail',
      details: `${responsiveIssues} responsive issues, Viewport: ${viewportMeta ? 'OK' : 'Missing'}`
    });
  }

  async checkPerformance() {
    this.log('Checking performance...');
    
    // Check for long tasks
    let longTasks = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 200) {
          longTasks++;
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['longtask'] });
      
      // Wait a bit to collect some data
      await new Promise(resolve => setTimeout(resolve, 1000));
      observer.disconnect();
    } catch (e) {
      this.log('Long tasks API not supported');
    }

    // Check image optimization
    const images = document.querySelectorAll('img');
    let largeImages = 0;
    
    images.forEach(img => {
      if (img.naturalWidth > 1200 || img.naturalHeight > 800) {
        largeImages++;
      }
    });

    this.results.push({
      check: 'Performance',
      status: longTasks === 0 && largeImages < 5 ? 'pass' : 'fail',
      details: `${longTasks} long tasks (>200ms), ${largeImages} large images`
    });
  }

  async checkAnimationSystem() {
    this.log('Checking animation system...');
    
    // Check for reduced motion respect
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check for CSS scroll timeline support
    const supportsScrollTimeline = CSS.supports('animation-timeline', 'auto');
    
    // Check for fallback animations
    const hasFallbackAnimations = document.documentElement.style.getPropertyValue('--section-progress') !== '';
    
    // Check animation performance
    const animatedElements = document.querySelectorAll('[style*="transform"], [style*="opacity"]');
    let animationIssues = 0;
    
    animatedElements.forEach(element => {
      const style = window.getComputedStyle(element);
      if (style.willChange === 'auto') {
        animationIssues++;
      }
    });

    this.results.push({
      check: 'Animation System',
      status: supportsScrollTimeline || hasFallbackAnimations ? 'pass' : 'fail',
      details: `Reduced motion: ${isReducedMotion}, Scroll timeline: ${supportsScrollTimeline}, Fallback: ${hasFallbackAnimations}`
    });
  }

  async checkContentIntegrity() {
    this.log('Checking content integrity...');
    
    // Check for placeholder content
    const bodyText = document.body.innerText;
    const placeholderPatterns = [
      /lorem\s+ipsum/i,
      /placeholder/i,
      /example\.com/i,
      /example@email\.com/i
    ];
    
    let placeholderIssues = 0;
    placeholderPatterns.forEach(pattern => {
      if (pattern.test(bodyText)) {
        placeholderIssues++;
      }
    });

    // Check for consistent numbers
    const numbers = bodyText.match(/\d+,?\d+/g) || [];
    const expectedNumbers = ['18,000', '3,200'];
    let numberIssues = 0;
    
    expectedNumbers.forEach(expected => {
      if (!numbers.includes(expected)) {
        numberIssues++;
      }
    });

    // Check image alt texts
    const images = document.querySelectorAll('img');
    let missingAlt = 0;
    
    images.forEach(img => {
      if (!img.hasAttribute('alt') || img.getAttribute('alt').trim() === '') {
        missingAlt++;
      }
    });

    this.results.push({
      check: 'Content Integrity',
      status: placeholderIssues === 0 && numberIssues === 0 && missingAlt === 0 ? 'pass' : 'fail',
      details: `${placeholderIssues} placeholders, ${numberIssues} number issues, ${missingAlt} missing alt texts`
    });
  }

  async checkInteractiveElements() {
    this.log('Checking interactive elements...');
    
    // Check CTA buttons
    const ctaButtons = document.querySelectorAll('.btn-primary');
    let buttonIssues = 0;
    
    ctaButtons.forEach(button => {
      if (!button.hasAttribute('aria-label') && button.textContent.trim() === '') {
        buttonIssues++;
      }
    });

    // Check focus management
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
    let focusableIssues = 0;
    
    focusableElements.forEach(element => {
      if (element.tabIndex < 0) {
        focusableIssues++;
      }
    });

    // Check keyboard navigation
    const mainNav = document.querySelector('.nav-links');
    let navIssues = 0;
    
    if (mainNav) {
      const navLinks = mainNav.querySelectorAll('a');
      navLinks.forEach(link => {
        if (!link.href || link.href === '#') {
          navIssues++;
        }
      });
    }

    this.results.push({
      check: 'Interactive Elements',
      status: buttonIssues === 0 && focusableIssues < 5 ? 'pass' : 'fail',
      details: `${buttonIssues} button issues, ${focusableIssues} focus issues, ${navIssues} nav issues`
    });
  }

  async checkNetworkResources() {
    this.log('Checking network resources...');
    
    // Check for failed resources
    const failedResources = this.errors.filter(e => 
      e.type === 'image' || e.type === 'network'
    ).length;

    // Check for external dependencies
    const externalLinks = document.querySelectorAll('link[href^="http"], script[src^="http"]');
    let externalIssues = 0;
    
    externalLinks.forEach(link => {
      const url = link.href || link.src;
      if (url.includes('placeholder') || url.includes('example')) {
        externalIssues++;
      }
    });

    this.results.push({
      check: 'Network Resources',
      status: failedResources === 0 ? 'pass' : 'fail',
      details: `${failedResources} failed resources, ${externalIssues} external issues`
    });
  }

  evaluateResults() {
    const totalChecks = this.results.length;
    const passedChecks = this.results.filter(r => r.status === 'pass').length;
    const criticalErrors = this.errors.length;
    
    this.status = criticalErrors === 0 && passedChecks >= totalChecks * 0.8 ? 'passed' : 'failed';
    
    this.log(`QA Evaluation: ${passedChecks}/${totalChecks} checks passed, ${criticalErrors} critical errors`);
  }

  updateStatusUI() {
    const statusElement = document.getElementById('qa-status');
    if (!statusElement) return;

    statusElement.textContent = this.status === 'passed' ? '✓' : '✗';
    statusElement.className = `qa-status ${this.status === 'passed' ? '' : 'error'}`;
    statusElement.title = `QA Status: ${this.status.toUpperCase()}`;
  }

  displayResults() {
    const resultsElement = document.getElementById('qa-results');
    if (!resultsElement) return;

    let html = '';
    
    // Overall status
    html += `<div class="qa-overall ${this.status}">
      <h4>Overall Status: ${this.status.toUpperCase()}</h4>
      <p>Completed in ${(performance.now() - this.startTime).toFixed(2)}ms</p>
    </div>
    `;

    // Check results
    html += '<h4>Check Results:</h4>';
    this.results.forEach(result => {
      html += `<div class="qa-result ${result.status}">
        <strong>${result.check}:</strong> ${result.status.toUpperCase()}<br>
        <small>${result.details}</small>
      </div>
      `;
    });

    // Errors
    if (this.errors.length > 0) {
      html += '<h4>Errors:</h4>';
      this.errors.forEach(error => {
        html += `<div class="qa-result fail">
          <strong>${error.type}:</strong> ${error.message}<br>
          <small>${JSON.stringify(error).slice(0, 100)}...</small>
        </div>
        `;
      });
    }

    // Warnings
    if (this.warnings.length > 0) {
      html += '<h4>Warnings:</h4>';
      this.warnings.forEach(warning => {
        html += `<div class="qa-result">
          <strong>${warning.type}:</strong> ${warning.message}<br>
        </div>
        `;
      });
    }

    resultsElement.innerHTML = html;
  }

  // Utility methods
  getRgbValues(colorString) {
    const match = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }
    return null;
  }

  calculateContrastRatio(bg, fg) {
    const bgLuminance = this.getRelativeLuminance(bg);
    const fgLuminance = this.getRelativeLuminance(fg);
    const lighter = Math.max(bgLuminance, fgLuminance);
    const darker = Math.min(bgLuminance, fgLuminance);
    return (lighter + 0.05) / (darker + 0.05);
  }

  getRelativeLuminance(rgb) {
    const { r, g, b } = rgb;
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  log(message) {
    console.log(`[QA] ${message}`);
  }

  // Public API
  getResults() {
    return {
      status: this.status,
      results: this.results,
      errors: this.errors,
      warnings: this.warnings,
      duration: performance.now() - this.startTime
    };
  }

  rerun() {
    this.results = [];
    this.errors = [];
    this.warnings = [];
    this.startTime = performance.now();
    this.status = 'running';
    
    this.runChecks();
  }
}

// Global function for manual triggering
function runQA() {
  if (window.qaEngine) {
    window.qaEngine.rerun();
  } else {
    window.qaEngine = new QAEngine();
  }
}

// Initialize QA system
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.qaEngine = new QAEngine();
  });
} else {
  window.qaEngine = new QAEngine();
}

// Export for testing
window.QAEngine = QAEngine;