// Cybaxis Corp — parallax + interaction logic
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---- Nav background on scroll ---- */
  const nav = document.getElementById('nav');
  const setNavState = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', setNavState, { passive: true });
  setNavState();

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Ridge node graph (hero signature element) ---- */
  const ridgeNodes = document.getElementById('ridgeNodes');
  if (ridgeNodes) {
    const NODE_COUNT = 26;
    const nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const x = Math.random() * 1600;
      const y = 260 + Math.random() * 120; // sit along the front ridge band
      nodes.push({ x, y });
    }
    let lineHtml = '';
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          lineHtml += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" stroke="#8EE3EF" stroke-width="1" opacity="0.25"/>`;
        }
      }
    }
    const circleHtml = nodes.map(n => `<circle cx="${n.x}" cy="${n.y}" r="${2 + Math.random() * 2.5}"/>`).join('');
    ridgeNodes.innerHTML = lineHtml + circleHtml;
  }

  /* ---- Scroll parallax: ridge layers + bg images + rise cards ---- */
  const ridgeLayers = document.querySelectorAll('.ridge-1, .ridge-2, .ridge-3, .ridge-nodes');
  const ridgeSpeeds = [0.04, 0.08, 0.12, 0.06];
  const bgLayers = document.querySelectorAll('.parallax-bg');
  const riseCards = document.querySelectorAll('.rise-card');

  let ticking = false;
  function updateParallax() {
    const sc = window.scrollY;

    if (!reduceMotion) {
      ridgeLayers.forEach((el, i) => {
        el.style.transform = `translateY(${sc * ridgeSpeeds[i % ridgeSpeeds.length]}px)`;
      });

      bgLayers.forEach(el => {
        const speed = parseFloat(el.dataset.speed || 0.2);
        const rect = el.parentElement.getBoundingClientRect();
        const offset = rect.top * speed;
        el.style.transform = `translateY(${offset}px)`;
      });

      riseCards.forEach(card => {
        const speed = parseFloat(card.dataset.speed || 0.05);
        const rect = card.parentElement.getBoundingClientRect();
        const offset = rect.top * speed * -1;
        card.style.transform = `translateY(${offset}px)`;
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
  updateParallax();

  /* ---- Stat counters ---- */
  const statNums = document.querySelectorAll('.stat-num');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10) || 0;
        const suffix = el.dataset.suffix || '';
        if (reduceMotion || target === 0) { el.textContent = `${target}${suffix}`; return; }
        let current = 0;
        const step = Math.max(1, Math.round(target / 40));
        const tick = () => {
          current += step;
          if (current >= target) { el.textContent = `${target}${suffix}`; return; }
          el.textContent = `${current}${suffix}`;
          requestAnimationFrame(tick);
        };
        tick();
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => statObserver.observe(el));

  /* ---- Reveal-on-scroll for cards ---- */
  const revealTargets = document.querySelectorAll('.card, .rise-card');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealTargets.forEach(el => {
    el.style.opacity = reduceMotion ? '1' : '0';
    el.style.transition = 'opacity .5s ease';
    revealObserver.observe(el);
  });

  /* ---- Contact form: submit via fetch, inline confirmation ---- */
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
