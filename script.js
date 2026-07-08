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
});
