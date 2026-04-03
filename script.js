document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    const toggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const saved = localStorage.getItem('theme') || 'light';
    
    html.setAttribute('data-theme', saved);
    if (saved === 'dark') toggle.checked = true;

    toggle.addEventListener('change', () => {
        const next = toggle.checked ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // Custom cursor
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursorRing');
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; 
        my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';
    });

    function animateRing() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Cursor hover effects
    document.querySelectorAll('a, button, .skill-item, .theme-toggle').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('expanded');
            ring.classList.add('expanded');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('expanded');
            ring.classList.remove('expanded');
        });
    });

    // Scroll reveal
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
            }
        });
    }, { 
        threshold: 0.12, 
        rootMargin: '0px 0px -40px 0px' 
    });

    reveals.forEach(el => observer.observe(el));

    // Parallax hero number
    const heroNum = document.querySelector('.hero-num');
    if (heroNum) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            heroNum.style.transform = `translateY(calc(-50% + ${y * 0.3}px))`;
        }, { passive: true });
    }
});