(() => {
  const nav = document.querySelector('.nav');
  const menu = document.getElementById('menu');
  const menuButton = document.getElementById('menu-button');
  const motionButton = document.getElementById('motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let focusBeforeMenu;

  function setMenu(open) {
    if (!menu || !menuButton) return;
    if (open) focusBeforeMenu = document.activeElement;
    menu.classList.toggle('visible', open);
    menu.inert = !open;
    document.body.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open) menu.querySelector('a')?.focus();
    else focusBeforeMenu?.focus();
  }

  menuButton?.addEventListener('click', () => setMenu(!menu.classList.contains('visible')));
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (!menu?.classList.contains('visible')) return;
    if (event.key === 'Escape') setMenu(false);
    if (event.key === 'Tab') {
      const focusable = [menuButton, ...menu.querySelectorAll('a')];
      const index = focusable.indexOf(document.activeElement);
      event.preventDefault();
      focusable[(index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus();
    }
  });
  matchMedia('(min-width:651px)').addEventListener('change', event => event.matches && setMenu(false));
  function updateNav() { nav?.classList.toggle('scrolled', scrollY > 40); }
  addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  if (!document.body.classList.contains('home') || !window.gsap || !window.ScrollTrigger) {
    if (motionButton) motionButton.hidden = true;
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const paragraph = document.querySelector('.scroll-copy');
  const original = paragraph.textContent;
  paragraph.replaceChildren();
  original.split(/\s+/).forEach((word, index) => {
    if (index) paragraph.append(' ');
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = word;
    paragraph.append(span);
  });

  let paused = reduced.matches;
  let media = null;
  let hasEntered = false;
  function announceMotion() {
    document.documentElement.classList.toggle('motion-paused', paused);
    dispatchEvent(new CustomEvent('avatar-motion', { detail: { paused } }));
  }
  function setupMotion() {
    media?.revert();
    media = null;
    document.documentElement.style.scrollBehavior = paused ? 'auto' : '';
    motionButton.textContent = paused ? 'Activar animaciones' : 'Pausar animaciones';
    motionButton.setAttribute('aria-pressed', String(paused));
    announceMotion();
    if (paused) return;
    media = gsap.matchMedia();
    media.add({ desktop: '(min-width:651px)', mobile: '(max-width:650px)' }, context => {
      const mobile = context.conditions.mobile;
      const portrait = document.querySelector('.portrait-tilt');
      // The outer portrait belongs to the hero, so it cannot float over another
      // character or get stranded off-screen after scrolling back up.
      gsap.fromTo('.hero-portrait', { y: 0, scale: 1, autoAlpha: 1 }, {
        y: 70, scale: .88, autoAlpha: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '65% top', scrub: .35, invalidateOnRefresh: true }
      });
      const turn = gsap.quickTo(portrait, 'rotationY', { duration: .6, ease: 'power3.out' });
      const nod = gsap.quickTo(portrait, 'rotationX', { duration: .6, ease: 'power3.out' });
      const move = event => {
        if (event.pointerType === 'touch' || document.hidden) return;
        turn((event.clientX / innerWidth - .5) * 12);
        nod((.5 - event.clientY / innerHeight) * 8);
      };
      const reset = () => { turn(0); nod(0); };
      addEventListener('pointermove', move, { passive: true });
      document.documentElement.addEventListener('pointerleave', reset);
      if (!hasEntered && scrollY < 100) {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('.hero-title-wrap', { autoAlpha: 0, y: 32, duration: .85 })
          .from('.hero-bottom > *', { autoAlpha: 0, y: 18, stagger: .12, duration: .7 }, .35);
        hasEntered = true;
      }
      gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .7 } })
        .to('.hero-title-wrap', { yPercent: 60, scale: .94, ease: 'none' }, 0)
        .to('.hero-bottom, .hero-sticker-note', { autoAlpha: 0, y: 35, ease: 'none' }, 0);
      gsap.to('.rail-one', { x: () => innerWidth * .08, rotation: 0, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true } });
      gsap.to('.rail-two', { x: () => -innerWidth * .33, rotation: 0, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true } });
      gsap.fromTo('.scroll-copy .word', { opacity: .23 }, { opacity: 1, stagger: .075, ease: 'none', scrollTrigger: { trigger: '.scroll-copy', start: 'top 78%', end: 'bottom 45%', scrub: .5 } });
      gsap.utils.toArray('.reveal').forEach(element => gsap.from(element, { y: 48, rotationX: 6, autoAlpha: 0, duration: .95, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } }));
      gsap.from('.entry-choices', { y: mobile ? 24 : 40, autoAlpha: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.entry-stage', start: 'top 88%', once: true } });
      gsap.from('.selector-character', { y: 35, autoAlpha: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.selector-character', start: 'top 92%', once: true } });
      return () => {
        removeEventListener('pointermove', move);
        document.documentElement.removeEventListener('pointerleave', reset);
      };
    });
    ScrollTrigger.refresh();
  }

  setupMotion();
  motionButton.addEventListener('click', () => { paused = !paused; setupMotion(); });
  reduced.addEventListener('change', event => { paused = event.matches; setupMotion(); });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener('pageshow', event => event.persisted && setupMotion());
  addEventListener('pagehide', () => media?.revert());
})();
