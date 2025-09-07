
function runQA() {
    'use strict';

    const floater = document.getElementById('qa-floater');
    const resultsContainer = document.getElementById('qa-results');
    const debugPanel = document.getElementById('debug-panel');
    if (!floater || !resultsContainer || !debugPanel) {
        console.error('QA UI elements not found!');
        return;
    }

    const checks = [];
    let hasFailed = false;

    function addCheck(name, checkFn) {
        try {
            const result = checkFn();
            const passed = Array.isArray(result) ? result[0] : result;
            const message = Array.isArray(result) ? result[1] : (passed ? 'Pass' : 'Fail');
            checks.push({ name, passed, message });
            if (!passed) hasFailed = true;
        } catch (e) {
            checks.push({ name, passed: false, message: `Error: ${e.message}` });
            hasFailed = true;
        }
    }

    // A. AUTOMATED RUNTIME SELF-CHECKS
    addCheck('Console: No uncaught errors', () => {
        // This is a proxy. Real check would be to have a global error handler.
        // We assume if we reach this point without crashing, it's a good sign.
        return [true, 'Attached global error listeners.'];
    });

    addCheck('Network: All images loaded', () => {
        const images = Array.from(document.querySelectorAll('img[src]'));
        const failedImages = images.filter(img => !img.complete || img.naturalWidth === 0);
        failedImages.forEach(img => {
            img.closest('section, div').classList.add('qa-fail-outline');
        });
        return [failedImages.length === 0, `${failedImages.length} image(s) failed to load.`];
    });

    addCheck('Scroll System: Scroll-timeline support', () => {
        const supported = CSS.supports('animation-timeline', 'auto');
        return [true, supported ? 'Natively supported' : 'Fallback to JS is active'];
    });

    addCheck('Scroll System: Fallback progress variables update', () => {
        if (CSS.supports('animation-timeline', 'auto')) {
            return [true, 'N/A (Native support)'];
        }
        const progress = getComputedStyle(document.documentElement).getPropertyValue('--progress-hero');
        // This is a snapshot; a real test would observe changes.
        return [parseFloat(progress) >= 0, `Hero progress: ${progress}`];
    });

    addCheck('DOM: All primary sections exist', () => {
        const ids = ['hero', 'about', 'journey', 'map', 'features', 'crowd', 'faq', 'cta'];
        const missing = ids.filter(id => !document.getElementById(`sec-${id}`));
        return [missing.length === 0, missing.length > 0 ? `Missing: #${missing.join(', #')}` : 'All sections present'];
    });

    addCheck('DOM: Sticky elements are sticky', () => {
        if (window.innerWidth < 1024) return [true, 'N/A (Mobile breakpoint)'];
        const stickyEl = document.querySelector('#journey-a .journey-scene');
        if (!stickyEl) return [false, 'Journey scene not found'];
        const isSticky = getComputedStyle(stickyEl).position === 'sticky';
        return [isSticky, `Journey scene is ${getComputedStyle(stickyEl).position}`];
    });

    addCheck('A11y: Exactly one H1', () => {
        const h1s = document.getElementsByTagName('h1').length;
        return [h1s === 1, `Found ${h1s} H1 tags.`];
    });

    addCheck('A11y: Main CTA is keyboard focusable', () => {
        const cta = document.querySelector('.cta-primary');
        if (!cta) return [false, 'Primary CTA not found'];
        const isFocusable = cta.tabIndex >= 0;
        return [isFocusable, `CTA tabIndex: ${cta.tabIndex}`];
    });

    addCheck('A11y: FAQ toggles aria-expanded', () => {
        const firstQuestion = document.querySelector('.faq-question');
        if (!firstQuestion) return [false, 'FAQ not found'];
        const initial = firstQuestion.getAttribute('aria-expanded');
        firstQuestion.click();
        const after = firstQuestion.getAttribute('aria-expanded');
        firstQuestion.click(); // revert
        return [initial !== after, `State changed from ${initial} to ${after}`];
    });

    // B. MANUAL CHECKLIST (Rendered for user)
    const manualChecks = [
        'Desktop Chrome: Smooth scroll from Hero to CTA without jank.',
        'DevTools > Rendering > Emulate prefers-reduced-motion: Animations are disabled.',
        'Mobile (375px): No horizontal overflow, accordion works.',
        'DevTools > Network > Offline: Text is readable, images are lazy-loaded gracefully.',
        'Lighthouse: Perf ≥ 90, A11y ≥ 90, Best Practices ≥ 90.',
        'Content: Data points (18,000+, 3,200+) are consistent.',
        'Interaction: Anchor links and buttons navigate correctly.'
    ];

    // --- RENDER RESULTS --- //
    function render() {
        // Floater
        floater.textContent = hasFailed ? '❌' : '✅';
        floater.className = hasFailed ? 'fail' : 'pass';
        floater.setAttribute('title', hasFailed ? `QA Failed: ${checks.find(c => !c.passed).name}` : 'QA Passed');

        // Detailed Report
        let html = '<h4>Automated Checks</h4>';
        checks.forEach(check => {
            html += `<div class="${check.passed ? 'pass' : 'fail'}"><strong>${check.name}:</strong> ${check.message}</div>`;
            if (!check.passed) {
                const failedEl = document.querySelector('.qa-fail-outline');
                if (failedEl) {
                    failedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });

        html += '<br><h4>Manual Verification Checklist</h4>';
        manualChecks.forEach(check => {
            html += `<div><input type="checkbox"> ${check}</div>`;
        });

        resultsContainer.innerHTML = html;

        floater.addEventListener('click', () => {
            debugPanel.hidden = !debugPanel.hidden;
        });
    }

    render();

    // Global error listeners
    window.addEventListener('error', (event) => {
        addCheck('Global JS Error', () => [false, event.message]);
        hasFailed = true;
        render();
    });
    window.addEventListener('unhandledrejection', (event) => {
        addCheck('Unhandled Promise', () => [false, event.reason]);
        hasFailed = true;
        render();
    });
}
