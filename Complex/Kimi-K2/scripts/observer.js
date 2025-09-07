/scripts/observer.js
// Intersection Observer utilities for performance optimization

class ObserverManager {
    constructor() {
        this.observers = new Map();
        this.callbacks = new Map();
        this.init();
    }
    
    init() {
        // Create default observers
        this.createVideoObserver();
        this.createLazyLoadObserver();
        this.createScrollProgressObserver();
        this.createParallaxObserver();
    }
    
    // Video autoplay observer
    createVideoObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                
                if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
                    // Check if video should autoplay
                    if (!video.hasAttribute('data-manual-play')) {
                        this.playVideo(video);
                    }
                } else {
                    this.pauseVideo(video);
                }
            });
        }, {
            threshold: [0.6],
            rootMargin: '0px'
        });
        
        this.observers.set('video', observer);
    }
    
    playVideo(video) {
        if (video.paused && !video.hasAttribute('data-manual-pause')) {
            video.play().catch(error => {
                console.log('Video play failed:', error);
                // Fallback: show play button
                this.showPlayButton(video);
            });
        }
    }
    
    pauseVideo(video) {
        if (!video.paused) {
            video.pause();
        }
    }
    
    showPlayButton(video) {
        const playButton = video.parentElement.querySelector('.play-button');
        if (playButton) {
            playButton.style.display = 'block';
        }
    }
    
    // Lazy loading observer
    createLazyLoadObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    this.loadElement(element);
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        this.observers.set('lazy', observer);
    }
    
    loadElement(element) {
        // Handle images
        if (element.tagName === 'IMG' && element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
            element.classList.add('loaded');
        }
        
        // Handle videos
        if (element.tagName === 'VIDEO' && element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
            element.classList.add('loaded');
        }
        
        // Handle background images
        if (element.dataset.bg) {
            element.style.backgroundImage = `url(${element.dataset.bg})`;
            element.removeAttribute('data-bg');
            element.classList.add('loaded');
        }
    }
    
    // Scroll progress observer
    createScrollProgressObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const progress = entry.intersectionRatio;
                const target = entry.target;
                
                // Update progress bar
                this.updateProgressBar(target, progress);
                
                // Trigger progress callbacks
                this.triggerProgressCallbacks(target, progress);
            });
        }, {
            threshold: Array.from({ length: 101 }, (_, i) => i / 100)
        });
        
        this.observers.set('progress', observer);
    }
    
    updateProgressBar(element, progress) {
        const progressBar = element.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress * 100}%`;
        }
    }
    
    triggerProgressCallbacks(element, progress) {
        const callbacks = this.callbacks.get('progress') || [];
        callbacks.forEach(callback => {
            callback(element, progress);
        });
    }
    
    // Parallax observer
    createParallaxObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                const ratio = entry.intersectionRatio;
                const speed = parseFloat(element.dataset.parallaxSpeed) || 0.5;
                
                // Calculate parallax offset
                const offset = ratio * speed * 50; // Max 50px offset
                
                // Apply parallax transform
                element.style.transform = `translateY(${offset}px)`;
            });
        }, {
            threshold: Array.from({ length: 21 }, (_, i) => i / 20)
        });
        
        this.observers.set('parallax', observer);
    }
    
    // Skeleton loading observer
    createSkeletonObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    this.loadRealContent(element);
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.01
        });
        
        this.observers.set('skeleton', observer);
    }
    
    loadRealContent(element) {
        // Replace skeleton with real content
        const realContent = element.dataset.realContent;
        if (realContent) {
            element.innerHTML = realContent;
            element.removeAttribute('data-real-content');
            element.classList.remove('skeleton');
            element.classList.add('content-loaded');
        }
    }
    
    // Public API Methods
    observeVideo(element) {
        const observer = this.observers.get('video');
        if (observer) {
            observer.observe(element);
        }
    }
    
    unobserveVideo(element) {
        const observer = this.observers.get('video');
        if (observer) {
            observer.unobserve(element);
        }
    }
    
    observeLazy(element) {
        const observer = this.observers.get('lazy');
        if (observer) {
            observer.observe(element);
        }
    }
    
    observeProgress(element) {
        const observer = this.observers.get('progress');
        if (observer) {
            observer.observe(element);
        }
    }
    
    observeParallax(element) {
        const observer = this.observers.get('parallax');
        if (observer) {
            observer.observe(element);
        }
    }
    
    observeSkeleton(element) {
        const observer = this.observers.get('skeleton');
        if (observer) {
            observer.observe(element);
        }
    }
    
    // Progress callback registration
    onProgress(callback) {
        if (!this.callbacks.has('progress')) {
            this.callbacks.set('progress', []);
        }
        this.callbacks.get('progress').push(callback);
    }
    
    // Cleanup
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        this.callbacks.clear();
    }
}

// Utility functions for common observer patterns
function setupVideoAutoplay() {
    const videos = document.querySelectorAll('video[data-autoplay]');
    videos.forEach(video => {
        window.observerManager.observeVideo(video);
    });
}

function setupLazyLoading() {
    const lazyElements = document.querySelectorAll('[data-lazy]');
    lazyElements.forEach(element => {
        window.observerManager.observeLazy(element);
    });
}

function setupParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    parallaxElements.forEach(element => {
        window.observerManager.observeParallax(element);
    });
}

function setupScrollProgress() {
    const progressElements = document.querySelectorAll('[data-progress]');
    progressElements.forEach(element => {
        window.observerManager.observeProgress(element);
    });
}

function setupSkeletonLoading() {
    const skeletonElements = document.querySelectorAll('.skeleton[data-real-content]');
    skeletonElements.forEach(element => {
        window.observerManager.observeSkeleton(element);
    });
}

// Initialize observer manager
document.addEventListener('DOMContentLoaded', () => {
    window.observerManager = new ObserverManager();
    
    // Setup common observers
    setupVideoAutoplay();
    setupLazyLoading();
    setupParallaxEffects();
    setupScrollProgress();
    setupSkeletonLoading();
});