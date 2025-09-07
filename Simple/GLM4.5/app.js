// Core Application - Accessibility Navigator
// Handles scroll-driven animations, interactions, and progressive enhancement

class AccessibilityNavigator {
    constructor() {
        this.init();
    }

    init() {
        // Feature detection
        this.supportsScrollTimeline = CSS.supports('animation-timeline', 'scroll()');
        this.supportsViewTransitions = 'startViewTransition' in document;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // State
        this.sections = [];
        this.scrollProgress = 0;
        this.currentSection = null;
        
        // Initialize components
        this.setupScrollProgress();
        this.setupIntersectionObserver();
        this.setupMagneticButtons();
        this.setupCounters();
        this.setupJourneyStages();
        this.setupFAQ();
        this.setupFeatureCards();
        this.setupDebugPanel();
        
        // Add event listeners
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Run initial checks
        this.checkStickySupport();
        
        // Setup image error handling
        this.setupImageFallbacks();
        
        // Initialize animations
        if (!this.prefersReducedMotion) {
            this.setupParallax();
        }
    }

    // Scroll Progress Bar
    setupScrollProgress() {
        this.progressBar = document.getElementById('scroll-progress');
    }

    updateScrollProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        
        this.scrollProgress = Math.min(scrolled / documentHeight, 1);
        this.progressBar.style.setProperty('--scroll-progress', this.scrollProgress);
    }

    // Intersection Observer for scroll-driven effects
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: [0, 0.1, 0.5, 0.9, 1]
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const section = entry.target;
                const progress = this.getSectionProgress(entry);
                
                // Update section progress
                section.style.setProperty('--progress', progress);
                
                // Handle section-specific animations
                this.handleSectionAnimation(section, entry, progress);
                
                // Track current section
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    this.currentSection = section.id;
                }
            });
        }, options);

        // Observe all sections
        document.querySelectorAll('section[id]').forEach(section => {
            this.sections.push(section);
            this.observer.observe(section);
        });
    }

    getSectionProgress(entry) {
        const rect = entry.boundingClientRect;
        const windowHeight = window.innerHeight;
        
        if (rect.top >= windowHeight) return 0;
        if (rect.bottom <= 0) return 1;
        
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        const totalHeight = rect.height;
        
        return Math.min(Math.max(visibleHeight / totalHeight, 0), 1);
    }

    handleSectionAnimation(section, entry, progress) {
        const id = section.id;
        
        switch (id) {
            case 'sec-hero':
                this.animateHero(progress);
                break;
            case 'sec-about':
                this.animateAbout(entry, progress);
                break;
            case 'sec-journey':
                this.animateJourney(section, progress);
                break;
            case 'sec-map':
                this.animateMapCards(entry, progress);
                break;
            case 'sec-features':
                this.animateFeatures(entry, progress);
                break;
            case 'sec-crowd':
                this.animateCommunity(entry, progress);
                break;
            case 'sec-cta':
                this.animateCTA(progress);
                break;
        }
    }

    // Hero Animations
    animateHero(progress) {
        const heroVisual = document.querySelector('.hero-visual');
        const heroContent = document.querySelector('.hero-content');
        
        if (heroVisual && heroContent) {
            // Parallax effect
            const parallaxY = progress * 10; // 10% parallax
            heroVisual.style.transform = `translateY(${-parallaxY}%)`;
            heroContent.style.transform = `translateY(${parallaxY * 0.5}%)`;
        }
    }

    // About Section
    animateAbout(entry, progress) {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            
            // Animate stat numbers
            this.animateCounters();
        }
    }

    // Journey Stages
    setupJourneyStages() {
        this.journeyStages = document.querySelectorAll('.journey-stage');
        this.currentStage = 0;
    }

    animateJourney(section, progress) {
        const stages = section.querySelectorAll('.journey-stage');
        const stageHeight = 1 / stages.length;
        
        stages.forEach((stage, index) => {
            const stageProgress = (progress - index * stageHeight) / stageHeight;
            
            if (stageProgress >= 0 && stageProgress <= 1) {
                const stageContent = stage.querySelector('.stage-content');
                if (stageContent) {
                    stageContent.classList.add('active');
                    
                    // Stage-specific animations
                    this.animateStageContent(stage, index, stageProgress);
                }
            }
        });
    }

    animateStageContent(stage, index, progress) {
        switch (index) {
            case 0: // Stage A
                const accessibilityCards = stage.querySelectorAll('.accessibility-card');
                accessibilityCards.forEach((card, i) => {
                    if (progress > 0.2 + i * 0.2) {
                        card.classList.add('active');
                    }
                });
                break;
                
            case 1: // Stage B
                const slopeValue = stage.querySelector('.slope-number .value');
                if (slopeValue && progress > 0.3) {
                    this.animateNumber(slopeValue, 0, 8.5, 1000);
                }
                break;
                
            case 2: // Stage C
                const checklistItems = stage.querySelectorAll('.checklist-item');
                checklistItems.forEach((item, i) => {
                    if (progress > 0.2 + i * 0.1) {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }
                });
                break;
        }
    }

    // Map Cards Animation
    animateMapCards(entry, progress) {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            
            const cards = entry.target.querySelectorAll('.map-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateX(0)';
                }, index * 100);
            });
        }
    }

    // Feature Cards 3D Tilt
    setupFeatureCards() {
        this.featureCards = document.querySelectorAll('.feature-card');
        
        this.featureCards.forEach(card => {
            // Skip on mobile
            if (window.innerWidth < 768) return;
            
            card.addEventListener('mousemove', this.handleFeatureCardHover.bind(this));
            card.addEventListener('mouseleave', this.handleFeatureCardLeave.bind(this));
        });
    }

    handleFeatureCardHover(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const rotateX = (e.clientY - centerY) / 20;
        const rotateY = (centerX - e.clientX) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        
        // Dynamic shadow
        const shadowX = (centerX - e.clientX) / 10;
        const shadowY = (e.clientY - centerY) / 10;
        card.style.boxShadow = `${shadowX}px ${shadowY}px 20px rgba(0, 0, 0, 0.1)`;
    }

    handleFeatureCardLeave(e) {
        const card = e.currentTarget;
        card.style.transform = '';
        card.style.boxShadow = '';
    }

    // Community Timeline
    animateCommunity(entry, progress) {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            
            const steps = entry.target.querySelectorAll('.process-step');
            steps.forEach((step, index) => {
                setTimeout(() => {
                    step.style.opacity = '1';
                    step.style.transform = 'translateX(0)';
                }, index * 200);
            });
        }
    }

    // CTA Section
    animateCTA(progress) {
        const ctaContent = document.querySelector('.cta-content');
        if (ctaContent) {
            const translateY = 12 * (1 - progress);
            ctaContent.style.transform = `translateY(${-translateY}px)`;
        }
    }

    // Magnetic Buttons
    setupMagneticButtons() {
        const magneticButtons = document.querySelectorAll('[data-magnetic]');
        
        magneticButtons.forEach(button => {
            button.addEventListener('mousemove', this.handleMagneticHover.bind(this));
            button.addEventListener('mouseleave', this.handleMagneticLeave.bind(this));
        });
    }

    handleMagneticHover(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * 0.3;
        const deltaY = (e.clientY - centerY) * 0.3;
        
        // Limit movement to 8px
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 8;
        const scale = distance > maxDistance ? maxDistance / distance : 1;
        
        button.style.transform = `translate(${deltaX * scale}px, ${deltaY * scale}px)`;
        
        // Dynamic shadow
        button.style.boxShadow = `${deltaX * scale * 0.5}px ${deltaY * scale * 0.5}px 10px rgba(14, 165, 233, 0.3)`;
    }

    handleMagneticLeave(e) {
        const button = e.currentTarget;
        button.style.transform = '';
        button.style.boxShadow = '';
    }

    // Counter Animation
    setupCounters() {
        this.counters = document.querySelectorAll('[data-count]');
        this.countersAnimated = new Set();
    }

    animateCounters() {
        this.counters.forEach(counter => {
            if (this.countersAnimated.has(counter)) return;
            
            const target = parseInt(counter.dataset.count);
            const duration = 2000;
            const start = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);
                
                counter.textContent = current.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    counter.textContent = target.toLocaleString();
                    this.countersAnimated.add(counter);
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    // Number Animation
    animateNumber(element, start, end, duration) {
        if (element.animated) return;
        element.animated = true;
        
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * eased;
            
            element.textContent = current.toFixed(1);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // FAQ Accordion
    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            question.addEventListener('click', () => {
                const isExpanded = question.getAttribute('aria-expanded') === 'true';
                
                // Close all others
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherQuestion = otherItem.querySelector('.faq-question');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        otherQuestion.setAttribute('aria-expanded', 'false');
                        otherAnswer.style.maxHeight = '0';
                    }
                });
                
                // Toggle current
                question.setAttribute('aria-expanded', !isExpanded);
                
                if (!isExpanded) {
                    // Measure content height
                    answer.style.maxHeight = 'none';
                    const height = answer.scrollHeight;
                    answer.style.maxHeight = '0';
                    
                    // Animate
                    requestAnimationFrame(() => {
                        answer.style.maxHeight = height + 'px';
                    });
                } else {
                    answer.style.maxHeight = '0';
                }
            });
        });
    }

    // Parallax Effect (fallback)
    setupParallax() {
        if (this.supportsScrollTimeline) return;
        
        const parallaxElements = document.querySelectorAll('.hero-visual, .about-visual img');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            
            parallaxElements.forEach(element => {
                const speed = element.classList.contains('hero-visual') ? 0.5 : 0.3;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        }, { passive: true });
    }

    // Check sticky support
    checkStickySupport() {
        const testElement = document.createElement('div');
        testElement.style.position = 'sticky';
        testElement.style.top = '0';
        document.body.appendChild(testElement);
        
        const isSupported = testElement.offsetTop === 0;
        document.body.removeChild(testElement);
        
        if (!isSupported) {
            document.body.classList.add('no-sticky');
        }
        
        return isSupported;
    }

    // Debug Panel
    setupDebugPanel() {
        const debugToggle = document.getElementById('debug-toggle');
        const debugPanel = document.getElementById('debug-panel');
        
        if (debugToggle && debugPanel) {
            debugToggle.addEventListener('click', () => {
                debugPanel.classList.toggle('expanded');
            });
        }
    }

    // Image Fallbacks
    setupImageFallbacks() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading state
            if (!img.complete) {
                img.classList.add('image-loading');
                
                // Create wrapper if needed
                const wrapper = document.createElement('div');
                wrapper.style.display = 'inline-block';
                wrapper.className = 'image-wrapper';
                img.parentNode.insertBefore(wrapper, img);
                wrapper.appendChild(img);
            }
            
            img.addEventListener('load', () => {
                img.classList.remove('image-loading');
            });
            
            img.addEventListener('error', () => {
                // Handle image error
                this.handleImageError(img);
            });
            
            // Check if already failed
            if (img.complete && img.naturalWidth === 0) {
                this.handleImageError(img);
            }
        });
    }

    handleImageError(img) {
        // Add error class
        img.classList.add('image-error');
        
        // Create fallback based on alt text
        const fallback = document.createElement('div');
        fallback.className = 'image-fallback';
        fallback.style.cssText = `
            width: ${img.width || 300}px;
            height: ${img.height || 200}px;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            font-size: 14px;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
        `;
        
        // Get appropriate icon based on alt text
        let icon = '🖼️';
        const altText = img.alt.toLowerCase();
        if (altText.includes('wheelchair') || altText.includes('ramp')) icon = '🦽';
        else if (altText.includes('elevator')) icon = '🛗';
        else if (altText.includes('restroom') || altText.includes('toilet')) icon = '🚻';
        else if (altText.includes('slope')) icon = '⛰️';
        else if (altText.includes('city') || altText.includes('street')) icon = '🏙️';
        
        fallback.innerHTML = `
            <div>
                <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
                <div>${img.alt || 'Image not available'}</div>
            </div>
        `;
        
        // Replace img with fallback
        img.parentNode.replaceChild(fallback, img);
    }

    // Event Handlers
    handleScroll() {
        this.updateScrollProgress();
    }

    handleResize() {
        // Re-check feature cards on mobile/desktop switch
        if (window.innerWidth < 768) {
            this.featureCards.forEach(card => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        }
    }

    // View Transitions (if supported)
    navigateWithTransition(url) {
        if (this.supportsViewTransitions) {
            document.startViewTransition(() => {
                window.location.href = url;
            });
        } else {
            window.location.href = url;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityNavigator = new AccessibilityNavigator();
    
    // Run QA after initialization
    if (typeof runQA === 'function') {
        setTimeout(runQA, 1000);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityNavigator;
}