(() => {
  const links = [...document.querySelectorAll('.concept-nav a')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach(link => {
        const current = link.hash === '#' + entry.target.id;
        link.classList.toggle('active', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-20% 0px -55% 0px' });
  document.querySelectorAll('.concept').forEach(section => observer.observe(section));
})();
