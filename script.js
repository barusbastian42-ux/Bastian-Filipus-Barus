/* ======================================================
   SCRIPT — PORTFOLIO BASTIAN BARUS
   ====================================================== */
(function () {
    'use strict';

    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /* ---------- 1. PRELOADER ---------- */
    const preloader = $('#preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader?.classList.add('hide');
            document.body.classList.remove('no-scroll');
            startHeroAnimations();
        }, 450);
    });
    document.body.classList.add('no-scroll');

    /* ---------- 2. CUSTOM CURSOR ---------- */
    const cursor = $('#cursor');
    const cursorDot = $('#cursorDot');
    let mx = 0, my = 0, cx = 0, cy = 0;

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        window.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
            cursorDot.style.transform = `translate(${mx - 2.5}px, ${my - 2.5}px)`;
            cursorDot.style.opacity = '1';
            cursor.classList.add('active');
        });

        const loop = () => {
            cx += (mx - cx) * 0.14;
            cy += (my - cy) * 0.14;
            cursor.style.transform = `translate(${cx - 17}px, ${cy - 17}px)`;
            requestAnimationFrame(loop);
        };
        loop();

        const hoverables = 'a, button, .project, .skill-card, .tech, .social, input, textarea';
        document.addEventListener('mouseover', e => {
            if (e.target.closest(hoverables)) document.body.classList.add('cursor-hover');
        });
        document.addEventListener('mouseout', e => {
            if (e.target.closest(hoverables)) document.body.classList.remove('cursor-hover');
        });
    }

    /* ---------- 3. NAVBAR: scroll state + progress bar ---------- */
    const navbar = $('#navbar');
    const progress = $('#scrollProgress');

    function onScroll() {
        const y = window.scrollY;
        navbar?.classList.toggle('scrolled', y > 40);

        const docH = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docH > 0 ? (y / docH) * 100 : 0;
        if (progress) progress.style.width = pct + '%';

        // Active link
        const sections = $$('section[id]');
        let current = '';
        sections.forEach(sec => {
            if (y >= sec.offsetTop - 140) current = sec.id;
        });
        $$('[data-nav]').forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- 4. SMOOTH SCROLL (dengan offset navbar) ---------- */
    $$('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const id = link.getAttribute('href');
            if (!id || id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;

            e.preventDefault();
            closeMenu();

            const top = target.getBoundingClientRect().top + window.scrollY - 68;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ---------- 5. MOBILE MENU ---------- */
    const menuToggle = $('#menuToggle');
    const nav = $('#nav');

    function closeMenu() {
        nav?.classList.remove('open');
        menuToggle?.classList.remove('open');
        menuToggle?.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
    }

    menuToggle?.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        menuToggle.classList.toggle('open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('no-scroll', open);
    });

    // Tutup menu saat klik di luar
    document.addEventListener('click', e => {
        if (nav?.classList.contains('open') && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMenu();
        }
    });

    // Tutup menu saat resize ke desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && nav?.classList.contains('open')) closeMenu();
    });

    /* ---------- 6. THEME TOGGLE ---------- */
    const themeToggle = $('#themeToggle');
    themeToggle?.addEventListener('click', () => {
        document.body.classList.toggle('light');
        const isLight = document.body.classList.contains('light');
        localStorage.setItem('bb-theme', isLight ? 'light' : 'dark');
    });
    if (localStorage.getItem('bb-theme') === 'light') {
        document.body.classList.add('light');
    }

    /* ---------- 7. REVEAL ON SCROLL ---------- */
    const revealEls = $$('.reveal');
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);

            // Animasi bar skill saat masuk viewport
            const bar = entry.target.querySelector?.('.skill-card__bar span');
            if (bar) setTimeout(() => { bar.style.width = bar.dataset.w || bar.style.getPropertyValue('--w'); }, 250);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    /* ---------- 8. SKILL BAR WIDTH ---------- */
    $$('.skill-card__bar span').forEach(span => {
        span.dataset.w = span.style.getPropertyValue('--w') || '80%';
    });

    /* ---------- 9. COUNTER ANIMATION ---------- */
    const counters = $$('[data-count]');
    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const duration = 1400;
            const start = performance.now();

            function tick(now) {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.floor(eased * target);
                if (p < 1) requestAnimationFrame(tick);
                else el.textContent = target;
            }
            requestAnimationFrame(tick);
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));

    /* ---------- 10. TYPING EFFECT ---------- */
    const typingEl = $('#typing');
    const phrases = ['Web Developer.', 'UI/UX Enthusiast.', 'Frontend Engineer.', 'Problem Solver.'];
    let phraseIdx = 0, charIdx = 0, deleting = false;

    function typeLoop() {
        const current = phrases[phraseIdx];
        if (!typingEl) return;

        typingEl.textContent = current.slice(0, charIdx);

        if (!deleting && charIdx < current.length) {
            charIdx++;
            setTimeout(typeLoop, 85);
        } else if (!deleting && charIdx === current.length) {
            deleting = true;
            setTimeout(typeLoop, 1700);
        } else if (deleting && charIdx > 0) {
            charIdx--;
            setTimeout(typeLoop, 45);
        } else {
            deleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            setTimeout(typeLoop, 320);
        }
    }
    typeLoop();

    /* ---------- 11. HERO INTRO ---------- */
    function startHeroAnimations() {
        $$('#home .reveal').forEach(el => el.classList.add('visible'));
    }

    /* ---------- 12. TABS (About) ---------- */
    $$('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const key = tab.dataset.tab;
            $$('.tab').forEach(t => t.classList.remove('is-active'));
            $$('.tab-pane').forEach(p => p.classList.remove('is-active'));
            tab.classList.add('is-active');
            $(`[data-pane="${key}"]`)?.classList.add('is-active');
        });
    });

    /* ---------- 13. PROJECT FILTER ---------- */
    $$('.filter').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.filter').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            const f = btn.dataset.filter;

            $$('.project').forEach(card => {
                const show = f === 'all' || card.dataset.cat === f;
                card.classList.toggle('hide', !show);
                if (show) {
                    card.style.animation = 'none';
                    void card.offsetWidth;
                    card.style.animation = 'fadeUp .45s cubic-bezier(.22,1,.36,1)';
                }
            });
        });
    });

    /* ---------- 14. FORM VALIDATION ---------- */
    const form = $('#contactForm');
    const formMsg = $('#formMsg');

    form?.addEventListener('submit', e => {
        e.preventDefault();

        const fields = [
            { el: $('#name'),    msg: 'Nama wajib diisi' },
            { el: $('#email'),   msg: 'Email wajib diisi' },
            { el: $('#subject'), msg: 'Subjek wajib diisi' },
            { el: $('#message'), msg: 'Pesan wajib diisi' }
        ];

        let valid = true;
        let firstBad = null;

        fields.forEach(f => {
            if (!f.el) return;
            const wrapper = f.el.closest('.field');
            const empty = !f.el.value.trim();
            const badEmail = f.el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.el.value);

            wrapper.classList.remove('error');
            if (empty || badEmail) {
                wrapper.classList.add('error');
                valid = false;
                firstBad = firstBad || f.el;
            }
        });

        if (!valid) {
            formMsg.textContent = 'Mohon lengkapi data dengan benar.';
            formMsg.className = 'form__msg err show';
            firstBad?.focus();
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
        btn.innerHTML = 'Mengirim...';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = original;
            btn.disabled = false;
            formMsg.textContent = 'Terima kasih! Pesan Anda berhasil dikirim.';
            formMsg.className = 'form__msg ok show';
            form.reset();
            setTimeout(() => formMsg.classList.remove('show'), 4500);
        }, 1200);
    });

    // Hapus error saat user mulai mengetik
    $$('.field input, .field textarea').forEach(inp => {
        inp.addEventListener('input', () => inp.closest('.field')?.classList.remove('error'));
    });

    /* ---------- 15. MAGNETIC BUTTON ---------- */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        $$('.magnetic').forEach(el => {
            el.addEventListener('mousemove', e => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                el.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0,0)';
            });
        });
    }

    /* ---------- 16. TILT 3D CARD ---------- */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        $$('.project').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform =
                    `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-10px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ---------- 17. BACK TO TOP ---------- */
    const toTop = $('#toTop');
    toTop?.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ---------- 18. FOOTER YEAR ---------- */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- 19. ACTIVE NAV HIGHLIGHT ON CLICK ---------- */
    $$('[data-nav]').forEach(link => {
        link.addEventListener('click', () => {
            $$('[data-nav]').forEach(l => l.classList.remove('is-active'));
            link.classList.add('is-active');
        });
    });

})();
