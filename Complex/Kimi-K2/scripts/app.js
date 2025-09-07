/scripts/app.js
// Main Application JavaScript for Accessibility Community Platform

class AccessibilityApp {
    constructor() {
        this.settings = this.loadSettings();
        this.currentTheme = this.settings.theme || 'auto';
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }
    
    init() {
        this.setupTheme();
        this.setupAccessibility();
        this.setupAnimations();
        this.bindEvents();
        this.setupServiceWorker();
    }
    
    // Theme Management
    setupTheme() {
        const applyTheme = (theme) => {
            if (theme === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            } else {
                document.documentElement.setAttribute('data-theme', theme);
            }
        };
        
        applyTheme(this.currentTheme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.currentTheme === 'auto') {
                applyTheme('auto');
            }
        });
    }
    
    // Accessibility Features
    setupAccessibility() {
        // Font size controls
        this.setupFontSizeControls();
        
        // High contrast mode
        this.setupHighContrast();
        
        // Voice over support
        this.setupVoiceOver();
        
        // Keyboard navigation
        this.setupKeyboardNavigation();
        
        // Focus management
        this.setupFocusManagement();
    }
    
    setupFontSizeControls() {
        const fontSize = this.settings.fontSize || 16;
        document.documentElement.style.fontSize = `${fontSize}px`;
        
        // Create font size controls if they don't exist
        if (!document.querySelector('.font-size-controls')) {
            this.createFontSizeControls();
        }
    }
    
    createFontSizeControls() {
        const controls = document.createElement('div');
        controls.className = 'font-size-controls no-print';
        controls.innerHTML = `
            <button class="font-size-btn" data-size="small" aria-label="小字体">A</button>
            <button class="font-size-btn" data-size="normal" aria-label="正常字体">A</button>
            <button class="font-size-btn" data-size="large" aria-label="大字体">A</button>
            <button class="font-size-btn" data-size="xlarge" aria-label="特大字体">A</button>
        `;
        
        document.body.appendChild(controls);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .font-size-controls {
                position: fixed;
                top: 20px;
                right: 20px;
                display: flex;
                gap: 4px;
                background: var(--card);
                padding: 8px;
                border-radius: 8px;
                box-shadow: var(--shadow-md);
                z-index: 1000;
            }
            
            .font-size-btn {
                width: 32px;
                height: 32px;
                border: none;
                background: var(--bg);
                color: var(--fg);
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 600;
            }
            
            .font-size-btn:hover {
                background: var(--accent);
                color: white;
            }
            
            .font-size-btn[data-size="small"] { font-size: 12px; }
            .font-size-btn[data-size="normal"] { font-size: 14px; }
            .font-size-btn[data-size="large"] { font-size: 16px; }
            .font-size-btn[data-size="xlarge"] { font-size: 18px; }
        `;
        document.head.appendChild(style);
        
        // Handle font size changes
        controls.addEventListener('click', (e) => {
            if (e.target.classList.contains('font-size-btn')) {
                const size = e.target.dataset.size;
                this.setFontSize(size);
            }
        });
    }
    
    setFontSize(size) {
        const sizes = {
            small: 14,
            normal: 16,
            large: 18,
            xlarge: 20
        };
        
        const fontSize = sizes[size] || 16;
        document.documentElement.style.fontSize = `${fontSize}px`;
        
        // Save preference
        this.settings.fontSize = fontSize;
        this.saveSettings();
        
        // Update active button
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-size="${size}"]`).classList.add('active');
    }
    
    setupHighContrast() {
        if (this.settings.highContrast) {
            document.body.style.filter = 'contrast(1.2)';
        }
    }
    
    setupVoiceOver() {
        // Add ARIA labels and roles
        this.addARIALabels();
        
        // Setup voice over announcements
        if (this.settings.voiceOver) {
            this.setupVoiceOverAnnouncements();
        }
    }
    
    addARIALabels() {
        // Add labels to interactive elements
        const buttons = document.querySelectorAll('button');
        buttons.forEach((button, index) => {
            if (!button.getAttribute('aria-label')) {
                const text = button.textContent || button.innerHTML;
                button.setAttribute('aria-label', text);
            }
        });
        
        // Add roles to custom elements
        const customButtons = document.querySelectorAll('[role="button"]');
        customButtons.forEach(btn => {
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('aria-label', btn.textContent || '按钮');
        });
    }
    
    setupVoiceOverAnnouncements() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'voice-over-announcements';
        document.body.appendChild(liveRegion);
        
        // Announce page changes
        this.announcePageChanges();
    }
    
    announcePageChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const addedNode = mutation.addedNodes[0];
                    if (addedNode.nodeType === Node.ELEMENT_NODE) {
                        const text = addedNode.textContent || addedNode.innerText;
                        if (text && text.trim()) {
                            this.announce(text.trim());
                        }
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    announce(message) {
        const liveRegion = document.getElementById('voice-over-announcements');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
    
    setupKeyboardNavigation() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Skip to main content
            if (e.key === 'Tab' && e.shiftKey) {
                const skipLink = document.querySelector('.skip-link');
                if (skipLink) {
                    skipLink.focus();
                }
            }
            
            // Escape key to close modals
            if (e.key === 'Escape') {
                this.closeModals();
            }
            
            // Arrow key navigation for custom components
            this.handleArrowKeyNavigation(e);
        });
    }
    
    handleArrowKeyNavigation(e) {
        const target = e.target;
        
        // Handle tab navigation
        if (target.getAttribute('role') === 'tab') {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
                const currentIndex = tabs.indexOf(target);
                const nextIndex = e.key === 'ArrowRight' 
                    ? (currentIndex + 1) % tabs.length 
                    : (currentIndex - 1 + tabs.length) % tabs.length;
                tabs[nextIndex].focus();
                tabs[nextIndex].click();
            }
        }
        
        // Handle button group navigation
        if (target.parentElement?.getAttribute('role') === 'group') {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const buttons = Array.from(target.parentElement.querySelectorAll('button, [role="button"]'));
                const currentIndex = buttons.indexOf(target);
                const nextIndex = e.key === 'ArrowRight' 
                    ? (currentIndex + 1) % buttons.length 
                    : (currentIndex - 1 + buttons.length) % buttons.length;
                buttons[nextIndex].focus();
            }
        }
    }
    
    setupFocusManagement() {
        // Trap focus in modals
        this.setupFocusTrap();
        
        // Restore focus after modal close
        this.setupFocusRestore();
    }
    
    setupFocusTrap() {
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapFocus(e, modal);
                }
            });
        });
    }
    
    trapFocus(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    setupFocusRestore() {
        let lastFocusedElement = null;
        
        document.addEventListener('focusin', (e) => {
            if (!e.target.closest('[role="dialog"]')) {
                lastFocusedElement = e.target;
            }
        });
        
        // Restore focus when modals close
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
                    const modal = mutation.target;
                    if (modal.getAttribute('aria-hidden') === 'false' && lastFocusedElement) {
                        lastFocusedElement.focus();
                    }
                }
            });
        });
        
        document.querySelectorAll('[role="dialog"]').forEach(modal => {
            observer.observe(modal, { attributes: true });
        });
    }
    
    // Animation Management
    setupAnimations() {
        if (this.isReducedMotion) {
            this.disableAnimations();
        } else {
            this.setupScrollAnimations();
            this.setupIntersectionAnimations();
        }
    }
    
    disableAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        const scrollHandler = () => {
            animatedElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (isVisible && !element.classList.contains('animated')) {
                    element.classList.add('animated');
                    this.animateElement(element);
                }
            });
        };
        
        window.addEventListener('scroll', scrollHandler, { passive: true });
        scrollHandler(); // Initial check
    }
    
    setupIntersectionAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    entry.target.classList.add('animated');
                    this.animateElement(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        document.querySelectorAll('[data-animate]').forEach(element => {
            observer.observe(element);
        });
    }
    
    animateElement(element) {
        const animationType = element.dataset.animate;
        
        switch (animationType) {
            case 'fade-in':
                element.style.animation = 'fadeIn 0.6s ease forwards';
                break;
            case 'slide-up':
                element.style.animation = 'slideUp 0.6s ease forwards';
                break;
            case 'slide-left':
                element.style.animation = 'slideLeft 0.6s ease forwards';
                break;
            case 'scale-in':
                element.style.animation = 'scaleIn 0.6s ease forwards';
                break;
            default:
                element.style.animation = 'fadeIn 0.6s ease forwards';
        }
    }
    
    // Event Binding
    bindEvents() {
        // Handle clicks outside modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModals();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Handle online/offline
        window.addEventListener('online', () => {
            this.announce('网络已连接');
        });
        
        window.addEventListener('offline', () => {
            this.announce('网络已断开');
        });
    }
    
    // Utility Functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    handleResize() {
        // Handle responsive behavior
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('mobile', isMobile);
    }
    
    closeModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    // Settings Management
    loadSettings() {
        const saved = localStorage.getItem('accessibilitySettings');
        return saved ? JSON.parse(saved) : {};
    }
    
    saveSettings() {
        localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
    }
    
    // Service Worker Setup
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
    }
    
    // Public API Methods
    setTheme(theme) {
        this.currentTheme = theme;
        this.settings.theme = theme;
        this.saveSettings();
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }
    
    announce(message) {
        this.announce(message);
    }
    
    toggleHighContrast() {
        this.settings.highContrast = !this.settings.highContrast;
        this.saveSettings();
        this.setupHighContrast();
    }
    
    toggleReduceMotion() {
        this.settings.reduceMotion = !this.settings.reduceMotion;
        this.saveSettings();
        
        if (this.settings.reduceMotion) {
            this.disableAnimations();
        } else {
            location.reload(); // Reload to re-enable animations
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityApp = new AccessibilityApp();
});

// Add CSS animations
const animationCSS = document.createElement('style');
animationCSS.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideLeft {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    
    [data-animate] {
        opacity: 0;
    }
    
    [data-animate].animated {
        opacity: 1;
    }
`;
document.head.appendChild(animationCSS);