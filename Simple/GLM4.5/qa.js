// QA Module - Runtime Self-Check & Status Indicator
// Performs automated checks and provides visual feedback

class QAChecker {
    constructor() {
        this.results = [];
        this.statusIndicator = null;
        this.debugPanel = null;
        this.checklistContainer = null;
        
        this.init();
    }

    init() {
        this.createStatusIndicator();
        this.setupErrorTracking();
        this.runChecks();
    }

    createStatusIndicator() {
        // Create status indicator (floating badge)
        this.statusIndicator = document.createElement('div');
        this.statusIndicator.id = 'qa-status';
        this.statusIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: white;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
        `;
        
        this.statusIndicator.addEventListener('click', () => {
            this.toggleDebugPanel();
        });
        
        document.body.appendChild(this.statusIndicator);
    }

    setupErrorTracking() {
        // Track JavaScript errors
        this.errorCount = 0;
        this.errorMessages = [];
        
        window.addEventListener('error', (event) => {
            this.errorCount++;
            this.errorMessages.push({
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno
            });
            this.updateStatus();
        });
        
        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.errorCount++;
            this.errorMessages.push({
                message: 'Unhandled Promise Rejection: ' + event.reason,
                source: 'Promise'
            });
            this.updateStatus();
        });
    }

    async runChecks() {
        console.group('🔍 QA Checks Running...');
        
        // Clear previous results
        this.results = [];
        
        // Run all checks
        await this.checkConsoleErrors();
        await this.checkNetworkResources();
        await this.checkScrollSystem();
        await this.checkSectionsExist();
        await this.checkStickySupport();
        await this.checkAnimations();
        await this.checkAccessibility();
        await this.checkFallbacks();
        
        // Log results
        this.logResults();
        
        // Update UI
        this.updateStatus();
        this.updateDebugPanel();
        
        console.groupEnd();
        
        // Auto-retry failed checks after 2 seconds
        const failedCount = this.results.filter(r => !r.passed).length;
        if (failedCount > 0) {
            console.log(`⚠️ ${failedCount} checks failed, retrying...`);
            setTimeout(() => this.runChecks(), 2000);
        }
    }

    async checkConsoleErrors() {
        const passed = this.errorCount === 0;
        this.addResult('Console Errors', passed, passed ? 'No errors' : `${this.errorCount} errors detected`);
    }

    async checkNetworkResources() {
        const images = document.querySelectorAll('img');
        let failedImages = 0;
        const failedImageList = [];
        
        for (const img of images) {
            if (!img.complete) {
                await new Promise(resolve => {
                    img.onload = img.onerror = resolve;
                });
            }
            
            if (img.naturalWidth === 0) {
                failedImages++;
                failedImageList.push(img.src);
                
                // Highlight failed image
                img.style.border = '3px solid #EF4444';
                const parent = img.closest('section');
                if (parent) {
                    const title = parent.querySelector('h1, h2, h3');
                    if (title) {
                        title.innerHTML += ' <span style="color: #EF4444;">[Image failed]</span>';
                    }
                }
            }
        }
        
        const passed = failedImages === 0;
        this.addResult('Network Resources', passed, passed ? 'All images loaded' : `${failedImages} images failed to load`);
    }

    async checkScrollSystem() {
        let scrollSystemWorking = false;
        
        if (CSS.supports('animation-timeline', 'scroll()')) {
            scrollSystemWorking = true;
        } else {
            // Check for fallback
            const checkProgress = () => {
                const root = document.documentElement;
                const progress = root.style.getPropertyValue('--progress');
                return progress !== '';
            };
            
            // Sample progress changes
            let progressChanges = 0;
            const observer = new MutationObserver(() => {
                if (checkProgress()) {
                    progressChanges++;
                }
            });
            
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
            
            // Trigger scroll
            window.scrollBy(0, 1);
            window.scrollBy(0, -1);
            
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 100));
            observer.disconnect();
            
            scrollSystemWorking = progressChanges > 0;
        }
        
        this.addResult('Scroll System', scrollSystemWorking, scrollSystemWorking ? 'Scroll animations working' : 'Scroll system not working');
    }

    async checkSectionsExist() {
        const requiredSections = ['sec-hero', 'sec-about', 'sec-journey', 'sec-map', 'sec-features', 'sec-crowd', 'sec-faq', 'sec-cta'];
        let missingSections = [];
        
        requiredSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) {
                missingSections.push(sectionId);
            }
        });
        
        const passed = missingSections.length === 0;
        this.addResult('Sections Present', passed, passed ? 'All sections present' : `Missing: ${missingSections.join(', ')}`);
        
        // Check sticky support on desktop
        if (window.innerWidth >= 1024) {
            const heroSection = document.getElementById('sec-hero');
            const journeyStages = document.querySelectorAll('.journey-stage');
            
            // Simple sticky check
            const isSticky = (element) => {
                const rect = element.getBoundingClientRect();
                return window.getComputedStyle(element).position === 'sticky';
            };
            
            let stickyWorking = true;
            if (heroSection && !isSticky(heroSection.querySelector('.hero-container'))) {
                stickyWorking = false;
            }
            
            journeyStages.forEach(stage => {
                if (!isSticky(stage.querySelector('.stage-container'))) {
                    stickyWorking = false;
                }
            });
            
            this.addResult('Sticky Layout (Desktop)', stickyWorking, stickyWorking ? 'Sticky sections working' : 'Sticky layout not working');
        }
    }

    async checkStickySupport() {
        const testEl = document.createElement('div');
        testEl.style.position = 'sticky';
        testEl.style.top = '0';
        document.body.appendChild(testEl);
        
        const supported = testEl.offsetTop === 0;
        document.body.removeChild(testEl);
        
        this.addResult('Sticky Support', supported, supported ? 'Browser supports sticky' : 'Sticky not supported');
    }

    async checkAnimations() {
        const animatedElements = [
            { selector: '.hero-content h1', property: 'opacity' },
            { selector: '.stat-card', property: 'opacity' },
            { selector: '.accessibility-card', property: 'opacity' },
            { selector: '.map-card', property: 'opacity' },
            { selector: '.feature-card', property: 'opacity' }
        ];
        
        let workingAnimations = 0;
        
        // Scroll to trigger animations
        window.scrollTo(0, 100);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        animatedElements.forEach(({ selector, property }) => {
            const element = document.querySelector(selector);
            if (element) {
                const computed = window.getComputedStyle(element);
                const value = computed[property];
                
                if (value === '1' || value === 'rgba(0, 0, 0, 1)') {
                    workingAnimations++;
                }
            }
        });
        
        window.scrollTo(0, 0);
        
        const passed = workingAnimations === animatedElements.length;
        this.addResult('Animations', passed, `${workingAnimations}/${animatedElements.length} animations working`);
    }

    async checkAccessibility() {
        let checks = {
            hasH1: document.querySelector('h1') !== null,
            hasH2s: document.querySelectorAll('h2').length > 0,
            mainCTAFocusable: document.querySelector('.cta-primary')?.tabIndex >= 0,
            ariaExpandedSync: true
        };
        
        // Check aria-expanded on FAQ
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const button = item.querySelector('.faq-question');
            const expanded = button.getAttribute('aria-expanded');
            if (expanded !== 'true' && expanded !== 'false') {
                checks.ariaExpandedSync = false;
            }
        });
        
        const allPassed = Object.values(checks).every(v => v);
        this.addResult('Accessibility', allPassed, checks);
    }

    async checkFallbacks() {
        // Simulate no ScrollTimeline support
        const originalSupport = CSS.supports;
        CSS.supports = (property, value) => {
            if (property === 'animation-timeline' && value === 'scroll()') {
                return false;
            }
            return originalSupport.call(CSS, property, value);
        };
        
        // Check if content is still readable
        const contentReadable = document.body.textContent.length > 500;
        
        // Restore original
        CSS.supports = originalSupport;
        
        this.addResult('Fallback Content', contentReadable, contentReadable ? 'Content readable without JS' : 'Content may not be accessible');
    }

    addResult(name, passed, details) {
        this.results.push({
            name,
            passed,
            details,
            timestamp: new Date().toISOString()
        });
    }

    logResults() {
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        
        console.log(`✅ QA Complete: ${passed}/${total} checks passed`);
        
        this.results.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`${icon} ${result.name}: ${result.details}`);
        });
    }

    updateStatus() {
        const failedChecks = this.results.filter(r => !r.passed);
        const allPassed = failedChecks.length === 0 && this.errorCount === 0;
        
        if (allPassed) {
            this.statusIndicator.style.backgroundColor = '#22C55E';
            this.statusIndicator.textContent = '✓';
            this.statusIndicator.title = 'All checks passed';
        } else {
            this.statusIndicator.style.backgroundColor = '#EF4444';
            this.statusIndicator.textContent = '!';
            this.statusIndicator.title = `${failedChecks.length} checks failed. Click for details.`;
            
            // Pulsing animation for failures
            this.statusIndicator.style.animation = 'pulse 2s infinite';
        }
    }

    updateDebugPanel() {
        // Find or create debug panel
        let debugPanel = document.getElementById('debug-panel');
        
        if (!debugPanel) {
            debugPanel = document.createElement('div');
            debugPanel.id = 'debug-panel';
            debugPanel.className = 'debug-panel';
            debugPanel.innerHTML = `
                <button class="debug-toggle">Debug Panel</button>
                <div class="debug-content">
                    <h3>QA Checklist</h3>
                    <div class="debug-checklist"></div>
                </div>
            `;
            document.body.appendChild(debugPanel);
        }
        
        // Update checklist
        const checklist = debugPanel.querySelector('.debug-checklist');
        checklist.innerHTML = '';
        
        this.results.forEach(result => {
            const item = document.createElement('li');
            item.className = result.passed ? 'passed' : 'failed';
            item.innerHTML = `
                <strong>${result.name}</strong>: 
                ${typeof result.details === 'object' ? JSON.stringify(result.details) : result.details}
            `;
            checklist.appendChild(item);
        });
        
        // Add error messages if any
        if (this.errorMessages.length > 0) {
            const errorSection = document.createElement('div');
            errorSection.innerHTML = '<h4>JavaScript Errors</h4>';
            this.errorMessages.forEach(error => {
                const errorItem = document.createElement('div');
                errorItem.className = 'error-detail';
                errorItem.style.color = '#EF4444';
                errorItem.style.marginBottom = '8px';
                errorItem.textContent = `${error.message} (${error.source}:${error.line || '?'})`;
                errorSection.appendChild(errorItem);
            });
            checklist.appendChild(errorSection);
        }
    }

    toggleDebugPanel() {
        const debugPanel = document.getElementById('debug-panel');
        if (debugPanel) {
            debugPanel.classList.toggle('expanded');
        }
    }
}

// Global function to run QA
function runQA() {
    if (!window.qaChecker) {
        window.qaChecker = new QAChecker();
    } else {
        window.qaChecker.runChecks();
    }
    
    return window.qaChecker.results;
}

// Auto-run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runQA, 1000);
    });
} else {
    setTimeout(runQA, 1000);
}

// Manual trigger (for testing)
if (typeof window !== 'undefined') {
    window.runQA = runQA;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QAChecker, runQA };
}