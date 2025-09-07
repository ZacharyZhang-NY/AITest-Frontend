(function() {
    'use strict';

    const state = {
        scrollProgress: 0,
        isScrollTimelineSupported: false,
        sections: {},
        observers: [],
        rafId: null,
        magneticButtons: [],
        counters: [],
        isReducedMotion: false
    };

    function checkSupport() {
        state.isScrollTimelineSupported = CSS.supports && CSS.supports('animation-timeline: scroll()');
        state.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!state.isScrollTimelineSupported && !state.isReducedMotion) {
            initFallbackAnimations();
        }
    }

    function initScrollProgress() {
        const progressBar = document.getElementById('scroll-progress');
        if (!progressBar) return;

        function updateProgress() {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.pageYOffset;
            const progress = Math.min(scrolled / scrollHeight, 1);
            
            state.scrollProgress = progress;
            progressBar.style.transform = `scaleX(${progress})`;
            
            document.documentElement.style.setProperty('--progress', progress);
        }

        window.addEventListener('scroll', throttle(updateProgress, 16));
        updateProgress();
    }

    function initFallbackAnimations() {
        const sections = document.querySelectorAll('section[id^="sec-"]');
        
        sections.forEach(section => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const rect = entry.boundingClientRect;
                        const viewportHeight = window.innerHeight;
                        const sectionProgress = 1 - (rect.bottom / (rect.height + viewportHeight));
                        const clampedProgress = Math.max(0, Math.min(1, sectionProgress));
                        
                        entry.target.style.setProperty('--progress', clampedProgress);
                        
                        if (!state.rafId) {
                            state.rafId = requestAnimationFrame(() => {
                                updateSectionAnimations(entry.target, clampedProgress);
                                state.rafId = null;
                            });
                        }
                    }
                });
            }, {
                threshold: Array.from({length: 101}, (_, i) => i / 100),
                rootMargin: '0px'
            });
            
            observer.observe(section);
            state.observers.push(observer);
        });
    }

    function updateSectionAnimations(section, progress) {
        const sectionId = section.id;
        
        switch(sectionId) {
            case 'sec-hero':
                animateHeroParallax(section, progress);
                break;
            case 'sec-about':
                animateAboutParallax(section, progress);
                break;
            case 'sec-journey':
                animateJourneyScenes(section, progress);
                break;
            case 'sec-map':
                animateMapGradient(section, progress);
                break;
        }
    }

    function animateHeroParallax(section, progress) {
        const image = section.querySelector('.hero-image');
        const content = section.querySelector('.hero-content');
        
        if (image && !state.isReducedMotion) {
            image.style.transform = `translateY(${progress * -10}%)`;
        }
        
        if (content && !state.isReducedMotion) {
            content.style.transform = `translateY(${progress * 5}%)`;
        }
    }

    function animateAboutParallax(section, progress) {
        const image = section.querySelector('.about-image');
        const cards = section.querySelectorAll('.data-card');
        
        if (image && !state.isReducedMotion) {
            image.style.transform = `translateY(${progress * -8}%)`;
        }
        
        cards.forEach((card, index) => {
            if (!state.isReducedMotion) {
                card.style.transform = `translateY(${progress * 4}%)`;
            }
        });
    }

    function animateJourneyScenes(section, progress) {
        const theaters = document.querySelectorAll('.journey-theater');
        
        theaters.forEach(theater => {
            const scene = theater.querySelector('.journey-scene');
            if (scene) {
                const sceneRect = scene.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const sceneProgress = 1 - ((sceneRect.bottom - viewportHeight) / sceneRect.height);
                const clampedProgress = Math.max(0, Math.min(1, sceneProgress));
                
                scene.style.setProperty('--scene-progress', clampedProgress);
                
                const background = scene.querySelector('.scene-background');
                if (background && !state.isReducedMotion) {
                    background.style.transform = `scale(${1 + clampedProgress * 0.05})`;
                }
            }
        });
    }

    function animateMapGradient(section, progress) {
        const angle = 30 + (progress * 45);
        section.style.setProperty('--gradient-angle', `${angle}deg`);
    }

    function initMagneticButtons() {
        const magneticBtns = document.querySelectorAll('.magnetic-btn');
        
        magneticBtns.forEach(btn => {
            let bounds = btn.getBoundingClientRect();
            
            btn.addEventListener('mouseenter', function() {
                bounds = btn.getBoundingClientRect();
            });
            
            btn.addEventListener('mousemove', function(e) {
                if (state.isReducedMotion) return;
                
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                const centerX = bounds.left + bounds.width / 2;
                const centerY = bounds.top + bounds.height / 2;
                
                const deltaX = Math.max(-8, Math.min(8, (mouseX - centerX) * 0.3));
                const deltaY = Math.max(-8, Math.min(8, (mouseY - centerY) * 0.3));
                
                btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                btn.style.boxShadow = `${-deltaX * 0.5}px ${-deltaY * 0.5}px 20px rgba(0,0,0,0.2)`;
            });
            
            btn.addEventListener('mouseleave', function() {
                btn.style.transform = '';
                btn.style.boxShadow = '';
            });
        });
    }

    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        const observedCounters = new Set();
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !observedCounters.has(entry.target)) {
                    observedCounters.add(entry.target);
                    animateCounter(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();
        
        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);
            const current = Math.floor(start + (target - start) * easedProgress);
            
            if (element.classList.contains('data-value')) {
                element.textContent = current.toLocaleString() + '+';
            } else {
                element.textContent = current;
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        if ('animate' in element) {
            element.animate([
                { opacity: 0.5 },
                { opacity: 1 }
            ], {
                duration: duration,
                easing: 'ease-out'
            });
        }
        
        requestAnimationFrame(updateCounter);
    }

    function init3DTilt() {
        if (state.isReducedMotion || window.innerWidth < 1024) return;
        
        const tiles = document.querySelectorAll('.feature-tile');
        
        tiles.forEach(tile => {
            tile.addEventListener('mousemove', function(e) {
                const rect = tile.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                
                const rotateX = ((mouseY - centerY) / (rect.height / 2)) * -6;
                const rotateY = ((mouseX - centerX) / (rect.width / 2)) * 6;
                
                tile.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
                tile.style.boxShadow = `${rotateY * 2}px ${rotateX * 2}px 30px rgba(0,0,0,0.15)`;
            });
            
            tile.addEventListener('mouseleave', function() {
                tile.style.transform = '';
                tile.style.boxShadow = '';
            });
        });
    }

    function initAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const summary = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (summary && answer) {
                summary.addEventListener('click', function(e) {
                    const isOpen = item.hasAttribute('open');
                    
                    if (!isOpen && answer.animate) {
                        answer.animate([
                            { opacity: 0, maxHeight: '0px' },
                            { opacity: 1, maxHeight: '500px' }
                        ], {
                            duration: 300,
                            easing: 'ease-out',
                            fill: 'forwards'
                        });
                    }
                    
                    summary.setAttribute('aria-expanded', !isOpen);
                });
                
                summary.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        summary.click();
                    }
                });
            }
        });
    }

    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').slice(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    if ('scrollBehavior' in document.documentElement.style) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        const targetOffset = target.offsetTop - 60;
                        window.scrollTo({
                            top: targetOffset,
                            behavior: 'smooth'
                        });
                    }
                    
                    if (document.startViewTransition) {
                        document.startViewTransition(() => {
                            target.scrollIntoView({ behavior: 'instant', block: 'start' });
                        });
                    }
                }
            });
        });
    }

    function initCTAButtons() {
        const ctaButtons = document.querySelectorAll('[data-action]');
        
        ctaButtons.forEach(button => {
            button.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                
                switch(action) {
                    case 'plan-route':
                        console.log('Starting route planning...');
                        break;
                    case 'learn-more':
                        document.getElementById('sec-about')?.scrollIntoView({ behavior: 'smooth' });
                        break;
                }
            });
        });
    }

    function initMapCards() {
        const mapCards = document.querySelectorAll('.map-card');
        
        mapCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                if (state.isReducedMotion) return;
                
                card.animate([
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-4px)' },
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-4px)' },
                    { transform: 'translateY(0)' }
                ], {
                    duration: 800,
                    easing: 'ease-in-out'
                });
            });
        });
    }

    function throttle(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = new Date().getTime();
            if (now - lastCall < delay) return;
            lastCall = now;
            return func(...args);
        };
    }

    function handleResize() {
        if (window.innerWidth < 640) {
            document.querySelectorAll('.sticky-content').forEach(el => {
                el.style.position = 'relative';
            });
        } else if (window.innerWidth >= 1024) {
            document.querySelectorAll('.sticky-content').forEach(el => {
                el.style.position = '';
            });
        }
    }

    function initWillChange() {
        const animatedElements = document.querySelectorAll('[data-animate="true"]');
        
        const willChangeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.willChange = 'transform, opacity';
                    
                    setTimeout(() => {
                        entry.target.style.willChange = 'auto';
                    }, 3000);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        animatedElements.forEach(el => {
            willChangeObserver.observe(el);
        });
    }

    function initLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                if (!img.complete) {
                    img.addEventListener('load', function() {
                        img.classList.add('loaded');
                    });
                }
            });
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
            document.body.appendChild(script);
        }
    }

    function init() {
        checkSupport();
        initScrollProgress();
        initMagneticButtons();
        initCounters();
        init3DTilt();
        initAccordion();
        initSmoothScroll();
        initCTAButtons();
        initMapCards();
        initWillChange();
        initLazyLoading();
        
        window.addEventListener('resize', throttle(handleResize, 250));
        handleResize();
        
        document.documentElement.classList.add('js-enabled');
        
        console.log('Accessibility Navigator initialized', {
            scrollTimelineSupported: state.isScrollTimelineSupported,
            reducedMotion: state.isReducedMotion
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.AccessibilityNavigator = {
        getState: () => state,
        reinit: init
    };
})();