document.addEventListener('DOMContentLoaded', () => {
    // --- THEME SWITCHER LOGIC ---
    const themeToggle = document.getElementById('theme-toggle');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const savedTheme = localStorage.getItem('theme') || systemTheme;

    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // --- INTERSECTION OBSERVER FOR VIDEO AUTOPLAY ---
    const videos = document.querySelectorAll('video[data-observer-target]');
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.play().catch(e => console.log("Autoplay was prevented."));
            } else {
                entry.target.pause();
            }
        });
    }, { threshold: 0.6 }); // Play when 60% visible

    videos.forEach(video => videoObserver.observe(video));

    // --- WAAPI ANIMATIONS (LIKE/COLLECT) ---
    const likeButtons = document.querySelectorAll('.like-button');
    likeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Toggle active state
            button.classList.toggle('text-red-500');
            button.classList.toggle('text-secondary');

            // Particle animation
            if (button.classList.contains('text-red-500')) {
                for (let i = 0; i < 5; i++) {
                    createParticle(e.clientX, e.clientY);
                }
            }
            
            // Scale animation
            button.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.3)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease-in-out'
            });
        });
    });

    function createParticle(x, y) {
        const particle = document.createElement('div');
        document.body.appendChild(particle);
        particle.style.position = 'absolute';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = `${Math.random() * 5 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.borderRadius = '50%';
        particle.style.background = `hsl(${Math.random() * 50 + 0}, 100%, 50%)`; // Red-orange hues

        const animation = particle.animate([
            { transform: `translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) scale(1)`, opacity: 1 },
            { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * -100 - 50}px) scale(0)`, opacity: 0 }
        ], {
            duration: Math.random() * 500 + 500,
            easing: 'cubic-bezier(0.17, 0.84, 0.44, 1)'
        });

        animation.onfinish = () => particle.remove();
    }

    // --- RIPPLE EFFECT FOR CHIPS ---
    const rippleButtons = document.querySelectorAll('.chip');
    rippleButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const diameter = Math.max(this.clientWidth, this.clientHeight);
            
            ripple.style.width = ripple.style.height = `${diameter}px`;
            ripple.style.left = `${e.clientX - rect.left - diameter / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - diameter / 2}px`;
            ripple.className = 'ripple';

            // Prevent multiple ripples
            const existingRipple = this.querySelector('.ripple');
            if (existingRipple) {
                existingRipple.remove();
            }
            
            this.appendChild(ripple);
        });
    });

    // --- TAB BAR ACTIVE STATE ---
    const currentPath = window.location.pathname.split('/').pop();
    const tabLinks = document.querySelectorAll('.tab-bar a');
    tabLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
    
    // --- PULL TO REFRESH SIMULATION ---
    const mainContent = document.querySelector('.main-content');
    const puller = document.querySelector('.pull-to-refresh');
    if (mainContent && puller) {
        let startY = 0;
        let pullDistance = 0;

        mainContent.addEventListener('touchstart', (e) => {
            if (mainContent.scrollTop === 0) {
                startY = e.touches[0].pageY;
            }
        }, { passive: true });

        mainContent.addEventListener('touchmove', (e) => {
            if (mainContent.scrollTop === 0 && startY > 0) {
                const currentY = e.touches[0].pageY;
                pullDistance = Math.max(0, (currentY - startY) / 2); // Dampen the pull
                if (pullDistance > 0) {
                    e.preventDefault();
                }
                mainContent.style.transform = `translateY(${pullDistance}px)`;
                puller.style.opacity = Math.min(1, pullDistance / 60);
                puller.querySelector('i').style.transform = `rotate(${pullDistance * 3}deg)`;
            }
        }, { passive: false });

        mainContent.addEventListener('touchend', () => {
            if (pullDistance > 60) {
                // Trigger refresh
                puller.classList.add('refreshing');
                setTimeout(() => {
                    mainContent.style.transition = 'transform 0.3s';
                    mainContent.style.transform = 'translateY(0)';
                    puller.style.opacity = 0;
                    puller.classList.remove('refreshing');
                    // In a real app, you'd reload content here.
                    // For the prototype, we can just reload the page.
                    window.location.reload();
                }, 1500);
            } else {
                mainContent.style.transition = 'transform 0.3s';
                mainContent.style.transform = 'translateY(0)';
                puller.style.opacity = 0;
            }
            
            mainContent.addEventListener('transitionend', () => {
                mainContent.style.transition = '';
            }, { once: true });

            startY = 0;
            pullDistance = 0;
        });
    }
});