document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menutoggle');
  const links = document.querySelector('.navlinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.style.display === 'flex';
      links.style.display = open ? 'none' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '76px';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = '#0F1A2E';
      links.style.padding = '24px 32px';
      links.style.gap = '20px';
      links.style.borderTop = '1px solid rgba(241,242,237,0.16)';
    });
  }

  // Mark active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navlinks a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Contact form: submit via fetch so the response shows inline instead of
  // redirecting off-site to Formspree's default confirmation page.
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
