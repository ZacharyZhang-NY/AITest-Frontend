// Web Animations API utilities for micro-animations

class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    // Like animation with particles
    animateLike(element) {
        if (this.isReducedMotion) return;
        
        // Scale animation
        const scaleAnimation = element.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.3)' },
            { transform: 'scale(1)' }
        ], {
            duration: 300,
            easing: 'ease-out'
        });
        
        // Create particles
        this.createParticles(element, '#ef4444');
        
        // Save animation reference
        this.animations.set(`like-${Date.now()}`, scaleAnimation);
    }
    
    // Collect animation with bounce
    animateCollect(element) {
        if (this.isReducedMotion) return;
        
        // Bounce animation
        const bounceAnimation = element.animate([
            { transform: 'scale(1) rotate(0deg)' },
            { transform: 'scale(1.2) rotate(10deg)' },
            { transform: 'scale(0.9) rotate(-10deg)' },
            { transform: 'scale(1.1) rotate(5deg)' },
            { transform: 'scale(1) rotate(0deg)' }
        ], {
            duration: 500,
            easing: 'ease-out'
        });
        
        // Sparkle effect
        this.createSparkles(element);
        
        this.animations.set(`collect-${Date.now()}`, bounceAnimation);
    }
    
    // Ripple effect for buttons
    animateRipple(element, event) {
        if (this.isReducedMotion) return;
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            transform: scale(0);
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        const rippleAnimation = ripple.animate([
            { transform: 'scale(0)', opacity: 1 },
            { transform: 'scale(4)', opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        });
        
        rippleAnimation.addEventListener('finish', () => {
            ripple.remove();
        });
    }
    
    // Skeleton loading animation
    animateSkeleton(element) {
        if (this.isReducedMotion) return;
        
        const gradient = `linear-gradient(90deg, 
            var(--border) 25%, 
            transparent 50%, 
            var(--border) 75%
        )`;
        
        const skeletonAnimation = element.animate([
            { backgroundPosition: '200% 0' },
            { backgroundPosition: '-200% 0' }
        ], {
            duration: 1500,
            iterations: Infinity,
            easing: 'linear'
        });
        
        element.style.background = gradient;
        element.style.backgroundSize = '200% 100%';
        
        this.animations.set(`skeleton-${element.id || Date.now()}`, skeletonAnimation);
    }
    
    // Progress bar animation
    animateProgress(element, toValue, duration = 1000) {
        if (this.isReducedMotion) {
            element.style.width = `${toValue}%`;
            return;
        }
        
        const fromValue = parseFloat(element.style.width) || 0;
        
        const progressAnimation = element.animate([
            { width: `${fromValue}%` },
            { width: `${toValue}%` }
        ], {
            duration: duration,
            easing: 'ease-out',
            fill: 'forwards'
        });
        
        this.animations.set(`progress-${element.id || Date.now()}`, progressAnimation);
    }
    
    // Number count animation
    animateNumber(element, fromValue, toValue, duration = 1500) {
        if (this.isReducedMotion) {
            element.textContent = toValue;
            return;
        }
        
        const range = toValue - fromValue;
        const startTime = performance.now();
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.round(fromValue + range * easeOutQuart);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        requestAnimationFrame(updateNumber);
    }
    
    // Parallax animation
    animateParallax(element, scrollY, speed = 0.5) {
        if (this.isReducedMotion) return;
        
        const offset = scrollY * speed;
        element.style.transform = `translateY(${offset}px)`;
    }
    
    // Stagger animation for lists
    animateStagger(elements, delay = 100) {
        if (this.isReducedMotion) {
            elements.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }
        
        elements.forEach((element, index) => {
            const animation = element.animate([
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], {
                duration: 600,
                delay: index * delay,
                easing: 'ease-out',
                fill: 'forwards'
            });
            
            this.animations.set(`stagger-${index}`, animation);
        });
    }
    
    // Particle creation
    createParticles(element, color = '#3b82f6') {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${centerX}px;
                top: ${centerY}px;
            `;
            
            document.body.appendChild(particle);
            
            const angle = (i / 6) * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            const duration = 800 + Math.random() * 400;
            
            const particleAnimation = particle.animate([
                { 
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                { 
                    transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: duration,
                easing: 'ease-out'
            });
            
            particleAnimation.addEventListener('finish', () => {
                particle.remove();
            });
        }
    }
    
    // Sparkle effect
    createSparkles(element) {
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < 4; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: fixed;
                width: 6px;
                height: 6px;
                background: #fbbf24;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${rect.left + rect.width / 2 + (Math.random() - 0.5) * 20}px;
                top: ${rect.top + rect.height / 2 + (Math.random() - 0.5) * 20}px;
            `;
            
            document.body.appendChild(sparkle);
            
            const sparkleAnimation = sparkle.animate([
                { 
                    transform: 'scale(0) rotate(0deg)',
                    opacity: 0
                },
                { 
                    transform: 'scale(1) rotate(180deg)',
                    opacity: 1
                },
                { 
                    transform: 'scale(0) rotate(360deg)',
                    opacity: 0
                }
            ], {
                duration: 600,
                delay: i * 100,
                easing: 'ease-out'
            });
            
            sparkleAnimation.addEventListener('finish', () => {
                sparkle.remove();
            });
        }
    }
    
    // Button press animation
    animateButtonPress(element) {
        if (this.isReducedMotion) return;
        
        const pressAnimation = element.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(0.95)' },
            { transform: 'scale(1)' }
        ], {
            duration: 150,
            easing: 'ease-out'
        });
        
        this.animations.set(`button-${Date.now()}`, pressAnimation);
    }
    
    // Card hover animation
    animateCardHover(element, isHovering) {
        if (this.isReducedMotion) return;
        
        const animation = element.animate([
            { transform: 'translateY(0)', boxShadow: 'var(--shadow-sm)' },
            { transform: 'translateY(-4px)', boxShadow: 'var(--shadow-lg)' }
        ], {
            duration: 300,
            easing: 'ease-out',
            fill: 'forwards'
        });
        
        if (!isHovering) {
            animation.reverse();
        }
        
        this.animations.set(`card-${element.id || Date.now()}`, animation);
    }
    
    // Cleanup animations
    cleanup() {
        this.animations.forEach(animation => {
            animation.cancel();
        });
        this.animations.clear();
    }
    
    // Public API Methods
    like(element) {
        this.animateLike(element);
    }
    
    collect(element) {
        this.animateCollect(element);
    }
    
    ripple(element, event) {
        this.animateRipple(element, event);
    }
    
    skeleton(element) {
        this.animateSkeleton(element);
    }
    
    progress(element, toValue, duration) {
        this.animateProgress(element, toValue, duration);
    }
    
    number(element, fromValue, toValue, duration) {
        this.animateNumber(element, fromValue, toValue, duration);
    }
    
    parallax(element, scrollY, speed) {
        this.animateParallax(element, scrollY, speed);
    }
    
    stagger(elements, delay) {
        this.animateStagger(elements, delay);
    }
    
    buttonPress(element) {
        this.animateButtonPress(element);
    }
    
    cardHover(element, isHovering) {
        this.animateCardHover(element, isHovering);
    }
}

// Initialize animation manager
document.addEventListener('DOMContentLoaded', () => {
    window.animationManager = new AnimationManager();
    
    // Setup global animation handlers
    setupAnimationHandlers();
});

function setupAnimationHandlers() {
    // Like buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.like-btn, [data-action="like"]')) {
            const button = e.target.closest('.like-btn, [data-action="like"]');
            window.animationManager.like(button);
        }
    });
    
    // Collect buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.collect-btn, [data-action="collect"]')) {
            const button = e.target.closest('.collect-btn, [data-action="collect"]');
            window.animationManager.collect(button);
        }
    });
    
    // Ripple effect on buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.ripple-btn, [data-ripple="true"]')) {
            const button = e.target.closest('.ripple-btn, [data-ripple="true"]');
            window.animationManager.ripple(button, e);
        }
    });
    
    // Button press effect
    document.addEventListener('mousedown', (e) => {
        if (e.target.closest('button, [role="button"]')) {
            const button = e.target.closest('button, [role="button"]');
            window.animationManager.buttonPress(button);
        }
    });
    
    // Card hover effects
    document.addEventListener('mouseenter', (e) => {
        if (e.target.closest('.hover-card, [data-hover="true"]')) {
            const card = e.target.closest('.hover-card, [data-hover="true"]');
            window.animationManager.cardHover(card, true);
        }
    });
    
    document.addEventListener('mouseleave', (e) => {
        if (e.target.closest('.hover-card, [data-hover="true"]')) {
            const card = e.target.closest('.hover-card, [data-hover="true"]');
            window.animationManager.cardHover(card, false);
        }
    });
}