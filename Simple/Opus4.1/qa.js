function runQA() {
    'use strict';

    const qaState = {
        results: {
            passed: [],
            failed: [],
            warnings: []
        },
        totalTests: 0,
        passedTests: 0,
        startTime: performance.now()
    };

    const qaIndicator = document.getElementById('qa-indicator');
    const debugPanel = document.getElementById('debug-panel');
    const manualChecklist = document.getElementById('manual-checklist');

    function updateIndicator(status, message) {
        if (!qaIndicator) return;
        
        qaIndicator.className = 'qa-status-indicator ' + status;
        const icon = qaIndicator.querySelector('.qa-icon');
        const text = qaIndicator.querySelector('.qa-text');
        
        if (status === 'success') {
            icon.textContent = '✅';
            text.textContent = 'All tests passed';
        } else if (status === 'error') {
            icon.textContent = '❌';
            text.textContent = message || 'Tests failed';
        } else {
            icon.textContent = '⚡';
            text.textContent = 'Testing...';
        }
    }

    function addResult(test, passed, message) {
        qaState.totalTests++;
        if (passed) {
            qaState.passedTests++;
            qaState.results.passed.push({ test, message });
        } else {
            qaState.results.failed.push({ test, message });
        }
    }

    function highlightError(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('error-highlight');
        }
    }

    async function testConsoleErrors() {
        let errorCount = 0;
        const originalError = window.onerror;
        const originalRejection = window.onunhandledrejection;
        
        window.onerror = function() {
            errorCount++;
            return true;
        };
        
        window.onunhandledrejection = function() {
            errorCount++;
            return true;
        };
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        window.onerror = originalError;
        window.onunhandledrejection = originalRejection;
        
        addResult('Console Errors', errorCount === 0, 
            errorCount === 0 ? 'No console errors detected' : `${errorCount} errors found`);
        
        return errorCount === 0;
    }

    async function testNetworkImages() {
        const images = document.querySelectorAll('img');
        let failedImages = [];
        
        for (const img of images) {
            await new Promise(resolve => {
                if (img.complete) {
                    if (img.naturalWidth === 0) {
                        failedImages.push(img.src);
                        highlightError(`img[src="${img.src}"]`);
                    }
                    resolve();
                } else {
                    img.addEventListener('load', resolve);
                    img.addEventListener('error', () => {
                        failedImages.push(img.src);
                        highlightError(`img[src="${img.src}"]`);
                        resolve();
                    });
                    setTimeout(resolve, 3000);
                }
            });
        }
        
        addResult('Image Loading', failedImages.length === 0,
            failedImages.length === 0 ? 'All images loaded successfully' : 
            `${failedImages.length} images failed to load`);
        
        return failedImages.length === 0;
    }

    function testScrollSystem() {
        const hasScrollTimeline = CSS.supports && CSS.supports('animation-timeline: scroll()');
        const hasProgressVariable = getComputedStyle(document.documentElement)
            .getPropertyValue('--progress') !== '';
        
        if (hasScrollTimeline) {
            addResult('Scroll Timeline', true, 'CSS Scroll Timeline API supported');
        } else if (hasProgressVariable) {
            const initialProgress = parseFloat(
                getComputedStyle(document.documentElement).getPropertyValue('--progress') || '0'
            );
            
            window.scrollBy(0, 100);
            
            setTimeout(() => {
                const newProgress = parseFloat(
                    getComputedStyle(document.documentElement).getPropertyValue('--progress') || '0'
                );
                const fallbackWorks = newProgress !== initialProgress;
                
                addResult('Scroll System', fallbackWorks,
                    fallbackWorks ? 'Fallback scroll system working' : 'Scroll system not responding');
                
                window.scrollTo(0, 0);
            }, 100);
            
            return true;
        } else {
            addResult('Scroll System', false, 'No scroll animation system detected');
            return false;
        }
        
        return true;
    }

    function testSectionsExist() {
        const requiredSections = [
            '#sec-hero', '#sec-about', '#sec-journey', 
            '#sec-map', '#sec-features', '#sec-crowd', 
            '#sec-faq', '#sec-cta'
        ];
        
        const missingSections = [];
        
        requiredSections.forEach(selector => {
            const section = document.querySelector(selector);
            if (!section) {
                missingSections.push(selector);
                addResult(`Section ${selector}`, false, 'Section not found');
            }
        });
        
        if (missingSections.length === 0) {
            addResult('Required Sections', true, 'All required sections present');
            return true;
        } else {
            addResult('Required Sections', false, 
                `Missing sections: ${missingSections.join(', ')}`);
            return false;
        }
    }

    function testStickyElements() {
        if (window.innerWidth < 1024) {
            addResult('Sticky Elements', true, 'Sticky disabled on small screens');
            return true;
        }
        
        const stickyElements = document.querySelectorAll('.sticky-content');
        let allSticky = true;
        
        stickyElements.forEach(el => {
            const computed = getComputedStyle(el);
            if (computed.position !== 'sticky' && computed.position !== 'fixed') {
                allSticky = false;
            }
        });
        
        addResult('Sticky Elements', allSticky,
            allSticky ? 'Sticky positioning working' : 'Sticky elements not functioning');
        
        return allSticky;
    }

    function testAnimations() {
        const animatedElements = [
            { selector: '.hero-title', property: 'opacity', expected: '1' },
            { selector: '.data-card', property: 'opacity', expected: '1' },
            { selector: '.map-card', property: 'opacity', expected: '1' }
        ];
        
        let animationsWorking = true;
        const failedAnimations = [];
        
        animatedElements.forEach(({ selector, property, expected }) => {
            const element = document.querySelector(selector);
            if (element) {
                const rect = element.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (isVisible) {
                    const computed = getComputedStyle(element);
                    const value = computed[property];
                    
                    if (value !== expected && property === 'opacity' && parseFloat(value) < 0.5) {
                        animationsWorking = false;
                        failedAnimations.push(selector);
                    }
                }
            }
        });
        
        addResult('Animations', animationsWorking,
            animationsWorking ? 'Key animations functioning' : 
            `Failed animations: ${failedAnimations.join(', ')}`);
        
        return animationsWorking;
    }

    function testAccessibility() {
        const h1 = document.querySelector('h1');
        const h2s = document.querySelectorAll('h2');
        const mainCTA = document.querySelector('.btn-primary');
        const faqItems = document.querySelectorAll('.faq-question');
        
        let accessibilityPassed = true;
        const issues = [];
        
        if (!h1) {
            accessibilityPassed = false;
            issues.push('Missing H1');
        }
        
        if (h2s.length < 7) {
            accessibilityPassed = false;
            issues.push('Missing H2 headings');
        }
        
        if (mainCTA) {
            mainCTA.focus();
            if (document.activeElement !== mainCTA) {
                accessibilityPassed = false;
                issues.push('Main CTA not focusable');
            }
            mainCTA.blur();
        }
        
        let ariaWorking = false;
        faqItems.forEach(item => {
            if (item.getAttribute('aria-expanded') !== null) {
                ariaWorking = true;
            }
        });
        
        if (!ariaWorking && faqItems.length > 0) {
            issues.push('ARIA attributes not set on FAQ');
        }
        
        addResult('Accessibility', issues.length === 0,
            issues.length === 0 ? 'Accessibility checks passed' : 
            `Issues: ${issues.join(', ')}`);
        
        return issues.length === 0;
    }

    function testReducedMotion() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const testElement = document.createElement('div');
        testElement.style.animation = 'test 1s';
        document.body.appendChild(testElement);
        
        const originalMatches = mediaQuery.matches;
        
        if (originalMatches) {
            const computed = getComputedStyle(testElement);
            const animationDuration = computed.animationDuration;
            const isReduced = animationDuration === '0.01ms' || animationDuration === '0s';
            
            addResult('Reduced Motion', isReduced,
                isReduced ? 'Reduced motion respected' : 'Reduced motion not working');
        } else {
            addResult('Reduced Motion', true, 'Reduced motion not preferred');
        }
        
        document.body.removeChild(testElement);
        return true;
    }

    function testDataValues() {
        const dataPoints = [
            { selector: '[data-count="18000"]', text: '18,000+' },
            { selector: '[data-count="3200"]', text: '3,200+' },
            { selector: '.badge-number', text: '18,000+' }
        ];
        
        let dataCorrect = true;
        const incorrectData = [];
        
        dataPoints.forEach(({ selector, text }) => {
            const element = document.querySelector(selector);
            if (element) {
                setTimeout(() => {
                    const content = element.textContent.trim();
                    if (!content.includes(text.replace(',', ''))) {
                        dataCorrect = false;
                        incorrectData.push(selector);
                    }
                }, 2500);
            }
        });
        
        setTimeout(() => {
            addResult('Data Values', dataCorrect,
                dataCorrect ? 'Data values consistent' : 
                `Incorrect data: ${incorrectData.join(', ')}`);
        }, 2600);
        
        return dataCorrect;
    }

    function createManualChecklist() {
        const manualTests = [
            { id: 'desktop-scroll', text: 'Desktop Chrome: Smooth scroll Hero→CTA, no flicker/jump' },
            { id: 'reduced-motion', text: 'prefers-reduced-motion: Animations properly degraded' },
            { id: 'mobile-test', text: 'Mobile 375-430px: No overflow, accordion works, CTA clickable' },
            { id: 'slow-network', text: 'Slow/offline: Lazy loading works, text not hidden' },
            { id: 'lighthouse', text: 'Lighthouse: Performance ≥90, Accessibility ≥90, Best Practices ≥90' },
            { id: 'data-consistency', text: 'Data values consistent (18,000+ / 3,200+ / daily updates)' },
            { id: 'navigation', text: 'All anchor links and buttons navigate correctly' }
        ];
        
        if (!manualChecklist) return;
        
        manualTests.forEach(test => {
            const li = document.createElement('li');
            li.innerHTML = `
                <label>
                    <input type="checkbox" id="${test.id}" />
                    <span>${test.text}</span>
                </label>
            `;
            manualChecklist.appendChild(li);
        });
    }

    async function runAllTests() {
        updateIndicator('testing', 'Running tests...');
        
        await testConsoleErrors();
        await testNetworkImages();
        testScrollSystem();
        testSectionsExist();
        testStickyElements();
        testAnimations();
        testAccessibility();
        testReducedMotion();
        testDataValues();
        
        createManualChecklist();
        
        setTimeout(() => {
            const allPassed = qaState.results.failed.length === 0;
            const status = allPassed ? 'success' : 'error';
            const message = allPassed ? 
                'All tests passed' : 
                `${qaState.results.failed.length} tests failed`;
            
            updateIndicator(status, message);
            
            console.log('QA Results:', {
                passed: qaState.passedTests,
                failed: qaState.results.failed.length,
                total: qaState.totalTests,
                duration: performance.now() - qaState.startTime + 'ms',
                details: qaState.results
            });
            
            if (qaIndicator) {
                qaIndicator.addEventListener('click', function() {
                    if (debugPanel) {
                        debugPanel.classList.toggle('hidden');
                    }
                });
            }
        }, 3000);
    }

    runAllTests();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runQA };
}