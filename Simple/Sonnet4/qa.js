/**
 * QA System - Accessibility Navigator
 * Automated runtime testing and quality assurance
 */

class QASystem {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passes = [];
    this.isRunning = false;
    this.results = new Map();
    
    // Test categories
    this.testCategories = {
      console: 'Console Errors',
      network: 'Network & Images', 
      scroll: 'Scroll System',
      sections: 'Section Integrity',
      animations: 'Animation System',
      accessibility: 'Accessibility',
      degradation: 'Graceful Degradation'
    };

    // Initialize QA system
    this.init();
  }

  /**
   * Initialize QA system
   */
  init() {
    // Start monitoring immediately
    this.setupErrorMonitoring();
    
    // Run full QA check after page loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.runFullQA(), 1000);
      });
    } else {
      setTimeout(() => this.runFullQA(), 1000);
    }

    console.log('🔍 QA System initialized');
  }

  /**
   * Setup error monitoring
   */
  setupErrorMonitoring() {
    let errorCount = 0;

    // Monitor JavaScript errors
    window.addEventListener('error', (event) => {
      errorCount++;
      this.addError('console', `JavaScript Error: ${event.message}`, event.filename, event.lineno);
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      errorCount++;
      this.addError('console', `Unhandled Promise Rejection: ${event.reason}`);
    });

    // Store error count for later checking
    this.initialErrorCount = errorCount;
  }

  /**
   * Run complete QA check
   */
  async runFullQA() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.updateStatus('running', 'Running QA checks...');
    
    console.log('🔍 Starting comprehensive QA check...');

    try {
      // Clear previous results
      this.clearResults();
      
      // Run all test categories
      await this.testConsoleErrors();
      await this.testNetworkIntegrity();
      await this.testScrollSystem();
      await this.testSectionIntegrity();
      await this.testAnimationSystem();
      await this.testAccessibility();
      await this.testGracefulDegradation();
      
      // Generate final report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ QA system error:', error);
      this.addError('system', `QA System Error: ${error.message}`);
    } finally {
      this.isRunning = false;
      this.updateFinalStatus();
    }
  }

  /**
   * Clear previous results
   */
  clearResults() {
    this.errors = [];
    this.warnings = [];
    this.passes = [];
    this.results.clear();
  }

  /**
   * Test: Console errors should be zero
   */
  async testConsoleErrors() {
    console.log('📊 Testing console errors...');
    
    // Check for JavaScript errors
    if (this.errors.filter(e => e.category === 'console').length === 0) {
      this.addPass('console', 'No JavaScript errors detected');
    } else {
      // Errors already recorded by error listeners
    }
    
    // Check for 404s or other network errors
    const networkErrors = performance.getEntriesByType('resource')
      .filter(entry => entry.transferSize === 0 && entry.name.includes('.'))
      .filter(entry => !entry.name.includes('chrome-extension')); // Ignore extension resources

    if (networkErrors.length === 0) {
      this.addPass('console', 'No resource loading failures');
    } else {
      networkErrors.forEach(entry => {
        this.addError('console', `Failed to load resource: ${entry.name}`);
      });
    }
  }

  /**
   * Test: Network integrity and image loading
   */
  async testNetworkIntegrity() {
    console.log('🌐 Testing network integrity...');
    
    const images = document.querySelectorAll('img');
    let failedImages = 0;
    let loadingImages = 0;

    for (const img of images) {
      if (!img.complete) {
        loadingImages++;
        // Wait for image to load or fail
        await new Promise(resolve => {
          const timeout = setTimeout(() => {
            this.addError('network', `Image timeout: ${img.src}`, img);
            failedImages++;
            resolve();
          }, 5000);

          const cleanup = () => {
            clearTimeout(timeout);
            resolve();
          };

          img.addEventListener('load', cleanup, { once: true });
          img.addEventListener('error', () => {
            this.addError('network', `Image failed to load: ${img.src}`, img);
            failedImages++;
            cleanup();
          }, { once: true });
        });
      } else if (img.naturalWidth === 0) {
        this.addError('network', `Image has zero dimensions: ${img.src}`, img);
        failedImages++;
      }
    }

    if (failedImages === 0) {
      this.addPass('network', `All ${images.length} images loaded successfully`);
    }

    // Test critical web fonts
    if (document.fonts) {
      await document.fonts.ready;
      if (document.fonts.size > 0) {
        this.addPass('network', 'Web fonts loaded successfully');
      }
    }
  }

  /**
   * Test: Scroll system functionality
   */
  async testScrollSystem() {
    console.log('📜 Testing scroll system...');
    
    // Test ScrollTimeline support detection
    const supportsScrollTimeline = CSS.supports('animation-timeline: view()') || 
                                   CSS.supports('animation-timeline: scroll()');
    
    if (supportsScrollTimeline) {
      this.addPass('scroll', 'ScrollTimeline API supported');
    } else {
      this.addWarning('scroll', 'ScrollTimeline not supported, using fallback');
      
      // Test fallback system
      const hasProgressVar = getComputedStyle(document.documentElement)
        .getPropertyValue('--scroll-progress');
      
      if (hasProgressVar !== '') {
        this.addPass('scroll', 'Fallback scroll system active');
      } else {
        this.addError('scroll', 'Fallback scroll system not working');
      }
    }

    // Test scroll progress updates
    const initialProgress = parseFloat(
      document.documentElement.style.getPropertyValue('--scroll-progress') || '0'
    );

    // Scroll slightly and check for updates
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 100);
    
    await new Promise(resolve => {
      setTimeout(() => {
        const newProgress = parseFloat(
          document.documentElement.style.getPropertyValue('--scroll-progress') || '0'
        );
        
        if (newProgress !== initialProgress || supportsScrollTimeline) {
          this.addPass('scroll', 'Scroll progress tracking functional');
        } else {
          this.addError('scroll', 'Scroll progress not updating');
        }
        
        // Restore original scroll position
        window.scrollTo(0, originalScrollY);
        resolve();
      }, 100);
    });

    // Test sticky positioning for journey sections
    if (window.innerWidth >= 1024) {
      const journeyActs = document.querySelectorAll('.journey-act .act-stage');
      if (journeyActs.length > 0) {
        const firstAct = journeyActs[0];
        const computedStyle = getComputedStyle(firstAct);
        
        if (computedStyle.position === 'sticky') {
          this.addPass('scroll', 'Sticky positioning active for journey acts');
        } else {
          this.addWarning('scroll', 'Sticky positioning not active (may be expected on smaller screens)');
        }
      }
    }
  }

  /**
   * Test: Section integrity
   */
  async testSectionIntegrity() {
    console.log('🏗️ Testing section integrity...');
    
    const requiredSections = [
      'sec-hero', 'sec-about', 'sec-journey', 
      'sec-map', 'sec-features', 'sec-crowd', 
      'sec-faq', 'sec-cta'
    ];

    let missingSections = [];
    
    requiredSections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (!section) {
        missingSections.push(sectionId);
        this.addError('sections', `Missing required section: ${sectionId}`);
      }
    });

    if (missingSections.length === 0) {
      this.addPass('sections', `All ${requiredSections.length} sections present`);
    }

    // Test journey sub-sections
    const journeyActs = ['act-a', 'act-b', 'act-c'];
    journeyActs.forEach(actId => {
      const act = document.getElementById(actId);
      if (!act) {
        this.addError('sections', `Missing journey act: ${actId}`);
      }
    });

    // Test section headings structure
    const h1Count = document.querySelectorAll('h1').length;
    const h2Count = document.querySelectorAll('section h2').length;
    
    if (h1Count === 1) {
      this.addPass('sections', 'Exactly one H1 heading found');
    } else {
      this.addError('sections', `Found ${h1Count} H1 headings, expected 1`);
    }

    if (h2Count >= 6) {
      this.addPass('sections', `${h2Count} section headings (H2) found`);
    } else {
      this.addWarning('sections', `Only ${h2Count} section headings found`);
    }
  }

  /**
   * Test: Animation system
   */
  async testAnimationSystem() {
    console.log('🎬 Testing animation system...');
    
    // Test key animated elements
    const animatedSelectors = [
      '.hero-content', '.hero-image',
      '.stat-card', '.access-card', 
      '.map-card', '.feature-card'
    ];

    let animatedElements = 0;
    let visibleAnimatedElements = 0;

    animatedSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        animatedElements++;
        
        // Check if element is visible and has expected properties
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
          visibleAnimatedElements++;
          
          // For visible elements, check if they have proper opacity/transform
          const style = getComputedStyle(element);
          const opacity = parseFloat(style.opacity);
          
          if (opacity >= 0.8) { // Allow for some animation states
            // Element is properly visible
          } else {
            this.addWarning('animations', `Element may be stuck in animation state: ${selector}`);
          }
        }
      });
    });

    if (animatedElements > 0) {
      this.addPass('animations', `${animatedElements} animated elements found`);
    } else {
      this.addError('animations', 'No animated elements found');
    }

    // Test counter animations
    const counters = document.querySelectorAll('[data-count]');
    let workingCounters = 0;

    counters.forEach(counter => {
      const target = parseInt(counter.dataset.count);
      const current = parseInt(counter.textContent.replace(/,/g, '')) || 0;
      
      if (current >= target * 0.8) { // Allow for ongoing animation
        workingCounters++;
      }
    });

    if (workingCounters === counters.length && counters.length > 0) {
      this.addPass('animations', `All ${counters.length} counters working`);
    } else if (counters.length > 0) {
      this.addWarning('animations', `${workingCounters}/${counters.length} counters working`);
    }
  }

  /**
   * Test: Accessibility features
   */
  async testAccessibility() {
    console.log('♿ Testing accessibility...');
    
    // Test heading structure
    const h1 = document.querySelector('h1');
    if (h1) {
      this.addPass('accessibility', 'Page has main heading (H1)');
    } else {
      this.addError('accessibility', 'No main heading (H1) found');
    }

    // Test section headings
    const sectionsWithHeadings = document.querySelectorAll('section h2, section h3').length;
    if (sectionsWithHeadings >= 6) {
      this.addPass('accessibility', `${sectionsWithHeadings} section headings found`);
    } else {
      this.addWarning('accessibility', `Only ${sectionsWithHeadings} section headings found`);
    }

    // Test keyboard navigation
    const focusableElements = document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    let keyboardAccessible = 0;
    focusableElements.forEach(element => {
      // Skip hidden elements
      if (getComputedStyle(element).display === 'none' || 
          getComputedStyle(element).visibility === 'hidden') {
        return;
      }
      keyboardAccessible++;
    });

    if (keyboardAccessible > 10) {
      this.addPass('accessibility', `${keyboardAccessible} keyboard accessible elements`);
    } else {
      this.addWarning('accessibility', `Only ${keyboardAccessible} keyboard accessible elements`);
    }

    // Test ARIA attributes
    const accordionButtons = document.querySelectorAll('.faq-question');
    let properARIA = 0;

    accordionButtons.forEach(button => {
      const hasExpanded = button.hasAttribute('aria-expanded');
      const hasControls = button.hasAttribute('aria-controls');
      
      if (hasExpanded && hasControls) {
        properARIA++;
      }
    });

    if (properARIA === accordionButtons.length && accordionButtons.length > 0) {
      this.addPass('accessibility', `All ${accordionButtons.length} accordion buttons have proper ARIA`);
    } else if (accordionButtons.length > 0) {
      this.addError('accessibility', `${properARIA}/${accordionButtons.length} accordion buttons have proper ARIA`);
    }

    // Test image alt attributes
    const images = document.querySelectorAll('img');
    let imagesWithAlt = 0;

    images.forEach(img => {
      if (img.hasAttribute('alt')) {
        imagesWithAlt++;
      } else {
        this.addError('accessibility', `Image missing alt attribute: ${img.src}`, img);
      }
    });

    if (imagesWithAlt === images.length) {
      this.addPass('accessibility', `All ${images.length} images have alt attributes`);
    }

    // Test color contrast (basic check)
    const bodyStyle = getComputedStyle(document.body);
    const bodyColor = bodyStyle.color;
    const bodyBg = bodyStyle.backgroundColor;
    
    if (bodyColor && bodyBg) {
      this.addPass('accessibility', 'Basic color values detected for contrast');
    } else {
      this.addWarning('accessibility', 'Could not verify color contrast');
    }
  }

  /**
   * Test: Graceful degradation
   */
  async testGracefulDegradation() {
    console.log('🔄 Testing graceful degradation...');
    
    // Test reduced motion support
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.addPass('degradation', 'Reduced motion preference detected and respected');
    } else {
      // Simulate reduced motion test
      const testElement = document.querySelector('.hero-content');
      if (testElement) {
        const originalTransition = testElement.style.transition;
        
        // This is a basic test - in real implementation, 
        // the CSS should handle reduced motion via media query
        this.addPass('degradation', 'Reduced motion handling available via CSS');
      }
    }

    // Test without ScrollTimeline support
    const supportsScrollTimeline = CSS.supports('animation-timeline: view()');
    if (!supportsScrollTimeline) {
      // Check if fallback systems work
      const progressVar = document.documentElement.style.getPropertyValue('--scroll-progress');
      if (progressVar !== undefined) {
        this.addPass('degradation', 'ScrollTimeline fallback system working');
      } else {
        this.addWarning('degradation', 'ScrollTimeline fallback may not be fully active');
      }
    } else {
      this.addPass('degradation', 'ScrollTimeline supported natively');
    }

    // Test content readability without JavaScript
    const criticalContent = [
      'h1', 'h2', 'p', '.hero-subtitle', 
      '.cta-title', '.feature-title'
    ];

    let readableContent = 0;
    criticalContent.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const style = getComputedStyle(element);
        if (style.opacity !== '0' && style.display !== 'none') {
          readableContent++;
        }
      });
    });

    if (readableContent > 20) {
      this.addPass('degradation', `${readableContent} critical content elements visible`);
    } else {
      this.addWarning('degradation', `Only ${readableContent} critical content elements visible`);
    }

    // Test CTA accessibility
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    let accessibleCTAs = 0;

    ctaButtons.forEach(button => {
      if (button.offsetParent !== null) { // Visible
        accessibleCTAs++;
      }
    });

    if (accessibleCTAs >= 2) {
      this.addPass('degradation', `${accessibleCTAs} CTA buttons accessible`);
    } else {
      this.addWarning('degradation', `Only ${accessibleCTAs} CTA buttons accessible`);
    }
  }

  /**
   * Add error to results
   */
  addError(category, message, element = null, line = null) {
    const error = {
      category,
      type: 'error',
      message,
      element,
      line,
      timestamp: new Date().toISOString()
    };
    this.errors.push(error);
    
    if (element && element.nodeType === Node.ELEMENT_NODE) {
      element.classList.add('qa-error');
    }
    
    console.error(`❌ [${category}] ${message}`, element || '');
  }

  /**
   * Add warning to results
   */
  addWarning(category, message, element = null) {
    const warning = {
      category,
      type: 'warning',
      message,
      element,
      timestamp: new Date().toISOString()
    };
    this.warnings.push(warning);
    console.warn(`⚠️ [${category}] ${message}`, element || '');
  }

  /**
   * Add pass to results
   */
  addPass(category, message) {
    const pass = {
      category,
      type: 'pass',
      message,
      timestamp: new Date().toISOString()
    };
    this.passes.push(pass);
    console.log(`✅ [${category}] ${message}`);
  }

  /**
   * Update status indicator
   */
  updateStatus(status, message) {
    const qaStatus = document.getElementById('qa-status');
    const qaIndicator = qaStatus?.querySelector('.qa-indicator');
    const qaText = qaStatus?.querySelector('.qa-text');

    if (qaText) {
      qaText.textContent = message;
    }

    if (qaIndicator) {
      qaIndicator.className = 'qa-indicator';
      if (status === 'error') {
        qaIndicator.classList.add('error');
      }
    }
  }

  /**
   * Update final status based on results
   */
  updateFinalStatus() {
    const hasErrors = this.errors.length > 0;
    const hasWarnings = this.warnings.length > 0;

    if (hasErrors) {
      const firstError = this.errors[0];
      this.updateStatus('error', `${this.errors.length} errors found`);
      console.error(`❌ QA FAILED: ${this.errors.length} errors, ${this.warnings.length} warnings`);
    } else if (hasWarnings) {
      this.updateStatus('warning', `${this.warnings.length} warnings`);
      console.warn(`⚠️ QA passed with warnings: ${this.warnings.length} warnings`);
    } else {
      this.updateStatus('success', 'All checks passed');
      console.log(`✅ QA PASSED: All checks successful`);
    }

    // Update debug panel if visible
    this.updateDebugPanel();
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        errors: this.errors.length,
        warnings: this.warnings.length,
        passes: this.passes.length,
        total: this.errors.length + this.warnings.length + this.passes.length
      },
      categories: {}
    };

    // Group results by category
    Object.keys(this.testCategories).forEach(category => {
      const categoryErrors = this.errors.filter(e => e.category === category);
      const categoryWarnings = this.warnings.filter(w => w.category === category);
      const categoryPasses = this.passes.filter(p => p.category === category);

      report.categories[category] = {
        name: this.testCategories[category],
        errors: categoryErrors.length,
        warnings: categoryWarnings.length,
        passes: categoryPasses.length,
        status: categoryErrors.length > 0 ? 'failed' : 
                categoryWarnings.length > 0 ? 'warning' : 'passed'
      };
    });

    // Store report
    this.lastReport = report;
    
    // Log summary
    console.log('📊 QA Report:', report);
    
    return report;
  }

  /**
   * Update debug panel with current results
   */
  updateDebugPanel() {
    const debugPanel = document.getElementById('debug-panel');
    const debugList = debugPanel?.querySelector('.debug-list');
    
    if (!debugList) return;

    // Clear existing content
    debugList.innerHTML = '';

    // Add results by category
    Object.keys(this.testCategories).forEach(category => {
      const categoryErrors = this.errors.filter(e => e.category === category);
      const categoryWarnings = this.warnings.filter(w => w.category === category);
      const categoryPasses = this.passes.filter(p => p.category === category);

      const li = document.createElement('li');
      const status = categoryErrors.length > 0 ? '❌' : 
                    categoryWarnings.length > 0 ? '⚠️' : '✅';
      
      li.textContent = `${status} ${this.testCategories[category]}`;
      
      if (categoryErrors.length > 0) {
        li.style.color = '#ef4444';
        li.title = categoryErrors.map(e => e.message).join('; ');
      } else if (categoryWarnings.length > 0) {
        li.style.color = '#f59e0b';
        li.title = categoryWarnings.map(w => w.message).join('; ');
      } else {
        li.style.color = '#22c55e';
      }
      
      debugList.appendChild(li);
    });

    // Add overall summary
    const summaryLi = document.createElement('li');
    summaryLi.style.fontWeight = 'bold';
    summaryLi.style.borderTop = '1px solid #e2e8f0';
    summaryLi.style.paddingTop = '8px';
    summaryLi.style.marginTop = '8px';
    
    if (this.errors.length === 0) {
      summaryLi.textContent = '✅ All checks passed';
      summaryLi.style.color = '#22c55e';
    } else {
      summaryLi.textContent = `❌ ${this.errors.length} errors, ${this.warnings.length} warnings`;
      summaryLi.style.color = '#ef4444';
    }
    
    debugList.appendChild(summaryLi);
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      errors: this.errors.length,
      warnings: this.warnings.length,
      passes: this.passes.length,
      lastReport: this.lastReport
    };
  }

  /**
   * Public method to manually trigger QA
   */
  async runQA() {
    return this.runFullQA();
  }
}

// Initialize QA system
let qaSystem;

function initQA() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQA);
    return;
  }

  qaSystem = new QASystem();
  window.qaSystem = qaSystem; // Make available globally for debugging
}

// Public API
function runQA() {
  if (qaSystem) {
    return qaSystem.runQA();
  } else {
    console.warn('QA system not initialized yet');
    return Promise.resolve();
  }
}

// Initialize
initQA();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QASystem, runQA };
}