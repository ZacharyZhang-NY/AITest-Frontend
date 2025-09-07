
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const supportsScrollTimeline = CSS.supports('animation-timeline', 'auto');
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 1024;

    // --- 1. SCROLL-DRIVEN ANIMATIONS & PROGRESS --- //

    function initScrollDrivenAnimations() {
        // Global page scroll progress bar
        const scrollProgress = document.getElementById('scroll-progress');
        window.addEventListener('scroll', () => {
            const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            if (scrollProgress) {
                scrollProgress.style.setProperty('--progress-page', progress);
            }
        }, { passive: true });

        // Fallback for browsers without @scroll-timeline
        if (!supportsScrollTimeline) {
            console.log('Using IntersectionObserver fallback for scroll animations.');
            const animatedSections = document.querySelectorAll('section[id]');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const id = entry.target.getAttribute('id');
                    if (!id) return;

                    let progress = 0;
                    if (entry.isIntersecting) {
                        const rect = entry.boundingClientRect;
                        const viewportHeight = window.innerHeight;
                        // Calculate progress from when the top of the element enters the bottom of the viewport
                        // to when the bottom of the element leaves the top of the viewport.
                        progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
                        progress = Math.max(0, Math.min(1, progress));
                    }
                    document.documentElement.style.setProperty(`--progress-${id.replace('sec-','')}`, progress);
                });
            }, {
                threshold: Array.from({ length: 101 }, (_, i) => i / 100) // Fine-grained threshold
            });

            animatedSections.forEach(section => observer.observe(section));
        }
    }

    // --- 2. INTERACTIVE COMPONENTS --- //

    // Magnetic Button Effect
    function initMagneticButton() {
        const button = document.querySelector('.magnetic-button');
        if (!button || isMobile) return;

        const maxOffset = 8; // Max pixels the button can move

        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const distance = Math.sqrt(x * x + y * y);
            const targetX = (x / rect.width) * maxOffset * 2;
            const targetY = (y / rect.height) * maxOffset * 2;

            button.style.transform = `translate(${targetX}px, ${targetY}px)`;
            button.style.boxShadow = `${-targetX / 2}px ${-targetY / 2}px 20px rgba(14, 165, 233, 0.5)`;
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
            button.style.boxShadow = 'var(--shadow-md)';
        });
    }

    // Number Counter Animation
    function initCounters() {
        const counters = document.querySelectorAll('.counter[data-target]');
        if (isReducedMotion) {
            counters.forEach(counter => counter.textContent = counter.dataset.target);
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.dataset.target;
                    animateCounter(counter, target);
                    obs.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    function animateCounter(element, target) {
        const duration = 1500;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            
            const currentValue = Math.floor(easedProgress * target);
            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    // 3D Tilt Effect on Feature Cards
    function init3DTilt() {
        const cards = document.querySelectorAll('.feature-card');
        if (isMobile || isReducedMotion) return;

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const { width, height } = rect;

                const rotateX = ((y / height) - 0.5) * -12; // Max 6deg
                const rotateY = ((x / width) - 0.5) * 12;  // Max 6deg

                card.style.willChange = 'transform';
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
                card.style.boxShadow = '0 20px 30px -10px rgba(0, 0, 0, 0.2)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                card.style.boxShadow = 'var(--shadow-md)';
                card.style.willChange = 'auto';
            });
        });
    }

    // FAQ Accordion
    function initAccordion() {
        const accordion = document.querySelector('.faq-accordion');
        if (!accordion) return;

        accordion.addEventListener('click', (e) => {
            const question = e.target.closest('.faq-question');
            if (!question) return;

            const item = question.parentElement;
            const answer = question.nextElementSibling;
            const isExpanded = question.getAttribute('aria-expanded') === 'true';

            question.setAttribute('aria-expanded', !isExpanded);

            if (isReducedMotion) {
                answer.style.maxHeight = !isExpanded ? answer.scrollHeight + 'px' : '0px';
                answer.style.padding = !isExpanded ? '0 0 var(--spacing-unit) * 2 0' : '0';
            } else {
                 // WAAPI for smooth animation
                if (!isExpanded) {
                    answer.style.display = 'block'; // Make it visible before animation
                    const openAnimation = answer.animate([
                        { maxHeight: '0px', opacity: 0, padding: '0' },
                        { maxHeight: answer.scrollHeight + 'px', opacity: 1, padding: '0 0 calc(var(--spacing-unit) * 2) 0' }
                    ], {
                        duration: 400,
                        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        fill: 'forwards'
                    });
                    openAnimation.onfinish = () => answer.style.height = 'auto';
                } else {
                    answer.animate([
                        { maxHeight: answer.scrollHeight + 'px', opacity: 1, padding: '0 0 calc(var(--spacing-unit) * 2) 0' },
                        { maxHeight: '0px', opacity: 0, padding: '0' }
                    ], {
                        duration: 400,
                        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        fill: 'forwards'
                    }).onfinish = () => answer.style.display = 'none';
                }
            }
        });
    }
    
    // Crowd-sourcing timeline animation
    function initCrowdTimeline() {
        if (isReducedMotion) return;
        const timeline = document.querySelector('.crowd-timeline');
        if (!timeline) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progress = Math.min(entry.intersectionRatio * 2, 1); // Accelerate progress
                    const steps = timeline.querySelectorAll('.timeline-step');
                    const progressPercentage = progress * 100;

                    if (progressPercentage > 10) {
                        steps[0].querySelector('.step-content').style.opacity = '1';
                        steps[0].querySelector('.step-content').style.transform = 'translateY(0)';
                        steps[0].querySelector('.tip').style.opacity = '1';
                        steps[0].querySelector('.tip').style.transform = 'scale(1)';
                    }
                    if (progressPercentage > 45) {
                        steps[1].querySelector('.step-content').style.opacity = '1';
                        steps[1].querySelector('.step-content').style.transform = 'translateY(0)';
                    }
                    if (progressPercentage > 80) {
                        steps[2].querySelector('.step-content').style.opacity = '1';
                        steps[2].querySelector('.step-content').style.transform = 'translateY(0)';
                    }
                }
            });
        }, { threshold: Array.from({ length: 21 }, (_, i) => i * 0.05) });

        observer.observe(timeline);
    }


    // --- INITIALIZATION --- //
    function init() {
        initScrollDrivenAnimations();
        initMagneticButton();
        initCounters();
        init3DTilt();
        initAccordion();
        initCrowdTimeline();

        // Run QA checks after a short delay to allow the page to settle
        setTimeout(() => {
            if (typeof runQA === 'function') {
                runQA();
            }
        }, 500);
    }

    init();
});
