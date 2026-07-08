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

  // Persistent scroll-driven 3D card
  const card = document.querySelector('.scroll3d-card');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (card && !prefersReduced) {
    let ticking = false;

    const apply = () => {
      const baseTop = parseFloat(getComputedStyle(card).top) || 0;
      const margin = 24;
      const maxTranslate = Math.max(0, window.innerHeight - baseTop - card.offsetHeight - margin);
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      const translateY = scrollPercent * maxTranslate;
      const rotateY = scrollPercent * 360;
      card.style.transform = `perspective(700px) translateY(${translateY}px) rotateY(${rotateY}deg)`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(apply);
        ticking = true;
      }
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }
});
