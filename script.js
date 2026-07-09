document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- Fixed logo: swap to the white mark over the two dark scenes ---------- */
  const fixedLogo = document.querySelector('.fixed-logo');
  const darkSections = ['problem', 'close']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (fixedLogo && darkSections.length) {
    const logoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          fixedLogo.classList.toggle('on-dark', entry.isIntersecting);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    darkSections.forEach(s => logoObserver.observe(s));
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
      { threshold: 0.2 }
    );
    revealTargets.forEach((el, i) => {
      if (el.classList.contains('pill') || el.classList.contains('industry-row')) {
        el.style.transitionDelay = `${(i % 8) * 60}ms`;
      }
      revealObserver.observe(el);
    });
  }

  /* ---------- Count-up stats on scroll-into-view ---------- */
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
          const duration = 900;
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

  /* ---------- Scene 02: pinned scrub-text reveal ---------- */
  const scrubSection = document.querySelector('.scene-problem');
  const scrubSpans = scrubSection ? Array.from(scrubSection.querySelectorAll('.scrub-text span')) : [];

  const updateScrub = (scrollY) => {
    if (!scrubSection || !scrubSpans.length) return;
    const top = scrubSection.offsetTop;
    const scrollDistance = scrubSection.offsetHeight - window.innerHeight;
    const progress = scrollDistance > 0 ? clamp((scrollY - top) / scrollDistance, 0, 1) : 0;
    scrubSpans.forEach((span, i) => {
      const threshold = i / scrubSpans.length;
      span.classList.toggle('lit', progress >= threshold);
    });
  };

  /* ---------- Scene 03: pinned service cross-fade ---------- */
  const deliverSection = document.querySelector('.scene-deliver');
  const deliverPanels = deliverSection ? Array.from(deliverSection.querySelectorAll('.deliver-panel')) : [];
  const deliverBars = deliverSection ? Array.from(deliverSection.querySelectorAll('.deliver-progress .bar')) : [];

  const updateDeliver = (scrollY) => {
    if (!deliverSection || !deliverPanels.length) return;
    const top = deliverSection.offsetTop;
    const scrollDistance = deliverSection.offsetHeight - window.innerHeight;
    const progress = scrollDistance > 0 ? clamp((scrollY - top) / scrollDistance, 0, 1) : 0;
    const idx = Math.min(deliverPanels.length - 1, Math.floor(progress * deliverPanels.length));
    deliverPanels.forEach((p, i) => p.classList.toggle('active', i === idx));
    deliverBars.forEach((b, i) => b.classList.toggle('active', i <= idx));
  };

  /* ---------- Unified scroll-driven animation loop ---------- */
  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY;
    updateScrub(scrollY);
    updateDeliver(scrollY);
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
