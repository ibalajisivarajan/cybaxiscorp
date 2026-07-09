document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const isMobile = () => window.innerWidth < 768;

  /* ---------- Sticky nav: solid on scroll + mobile toggle ---------- */
  const nav = document.querySelector('.site-nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Generic reveal-on-scroll (once) ---------- */
  const revealTargets = document.querySelectorAll('.reveal, .pill, .industry-row');
  if (revealTargets.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach((el, i) => {
      if (el.classList.contains('pill') || el.classList.contains('industry-row')) {
        el.style.transitionDelay = `${(i % 8) * 50}ms`;
      }
      revealObserver.observe(el);
    });
  }

  /* ---------- Count-up stat on scroll-into-view ---------- */
  const statNums = document.querySelectorAll('[data-countup]');
  if (statNums.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.countup, 10);
          const suffix = el.dataset.suffix || '';
          countObserver.unobserve(el);
          if (prefersReduced || !Number.isFinite(target)) {
            el.textContent = `${target}${suffix}`;
            return;
          }
          const duration = 800;
          const start = performance.now();
          const tick = (now) => {
            const p = clamp((now - start) / duration, 0, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = `${Math.round(target * eased)}${suffix}`;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach(el => countObserver.observe(el));
  }

  /* ---------- Talent network: drifting nodes + lines in hero ----------
     ~20-25 nodes, randomized position + per-node depth factor
     (0.02-0.14). Nodes within a distance threshold get connected by a
     line. Depth parallax applies translateY(scrollY * depth) on scroll,
     transform-only for GPU compositing. Rebuilt on resize (debounced). */
  const svgNS = 'http://www.w3.org/2000/svg';
  const networkLayer = document.querySelector('.network-layer');
  const networkSvg = document.querySelector('.network-svg');
  let networkEls = [];

  const buildNetwork = () => {
    if (!networkLayer || !networkSvg) return;
    const rect = networkLayer.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w === 0 || h === 0) return;

    networkSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    networkSvg.innerHTML = '';

    const count = isMobile() ? 14 : 24;
    const nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      depth: 0.02 + Math.random() * 0.12,
      r: 1.6 + Math.random() * 2.2,
    }));

    const threshold = Math.min(w, h) * 0.24;
    const lineGroup = document.createElementNS(svgNS, 'g');
    nodes.forEach((a, i) => {
      nodes.slice(i + 1).forEach((b) => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < threshold) {
          const line = document.createElementNS(svgNS, 'line');
          line.setAttribute('x1', a.x);
          line.setAttribute('y1', a.y);
          line.setAttribute('x2', b.x);
          line.setAttribute('y2', b.y);
          line.setAttribute('class', 'net-line');
          line.dataset.depth = ((a.depth + b.depth) / 2).toFixed(3);
          lineGroup.appendChild(line);
        }
      });
    });
    networkSvg.appendChild(lineGroup);

    const nodeGroup = document.createElementNS(svgNS, 'g');
    nodes.forEach((n) => {
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', n.x);
      c.setAttribute('cy', n.y);
      c.setAttribute('r', n.r);
      c.setAttribute('class', 'net-node');
      c.dataset.depth = n.depth.toFixed(3);
      nodeGroup.appendChild(c);
    });
    networkSvg.appendChild(nodeGroup);

    networkEls = Array.from(networkSvg.querySelectorAll('[data-depth]'));
  };

  buildNetwork();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildNetwork, 200);
  });

  /* ---------- Layered card rise: service/process cards ---------- */
  const riseCards = document.querySelectorAll('.rise-card, .process-step');

  /* ---------- Scroll-driven updates (single rAF loop) ---------- */
  let ticking = false;
  const update = () => {
    const scrollY = window.scrollY;
    const heavyParallax = !prefersReduced && !isMobile();

    if (heavyParallax) {
      networkEls.forEach((el) => {
        const depth = parseFloat(el.dataset.depth);
        el.style.transform = `translateY(${scrollY * depth}px)`;
      });

      const vh = window.innerHeight;
      riseCards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = center - vh / 2;
        const speed = 0.03 + (i % 4) * 0.015;
        const translate = clamp(dist * -speed, -36, 36);
        card.style.transform = `translateY(${translate}px)`;
      });
    }

    if (nav) nav.classList.toggle('scrolled', scrollY > 20);

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- Contact form: submit via fetch, inline confirmation ---------- */
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    const msg = contactForm.querySelector('[data-form-msg]');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const submitLabel = submitBtn ? submitBtn.textContent : '';

    const showMessage = (text, kind) => {
      if (!msg) return;
      msg.textContent = text;
      msg.className = `form-msg visible ${kind}`;
    };

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (msg) msg.className = 'form-msg';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          contactForm.reset();
          showMessage("Thanks — your message is in. We'll respond within one business day.", 'success');
        } else {
          const data = await response.json().catch(() => null);
          const detail = data && Array.isArray(data.errors) && data.errors.length
            ? data.errors.map(er => er.message).join(' ')
            : 'Something went wrong sending your message. Please try again or email us directly.';
          showMessage(detail, 'error');
        }
      } catch (err) {
        showMessage('Something went wrong sending your message. Please try again or email us directly.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel;
        }
      }
    });
  }
});
