(() => {
  document.querySelectorAll('[data-reveal]').forEach(button=>button.addEventListener('click',()=>{
    const panel=document.getElementById(button.dataset.reveal);
    panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));
  }));
  const range=document.getElementById('load-range');
  function updateLoad(){
    const count=Number(range.value),over=count>8;
    document.getElementById('load-value').value=String(count);
    document.querySelectorAll('.request-grid span').forEach((el,i)=>{el.classList.toggle('filled',i<count);el.classList.toggle('overflow',i<count&&i>=8)});
    document.querySelector('.load-demo').classList.toggle('overloaded',over);
    document.getElementById('load-status').textContent=over?'Sin capacidad: '+(count-8)+' peticiones tendrían que esperar o podrían fallar.':'Hay sitio: las peticiones se atienden.';
  }
  range.addEventListener('input',updateLoad);updateLoad();
  const sections=[...document.querySelectorAll('.concept')],links=[...document.querySelectorAll('.concept-nav a')];
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting)links.forEach(a=>{const current=a.hash==='#'+entry.target.id;a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
  },{rootMargin:'-20% 0px -55% 0px'});
  sections.forEach(section=>observer.observe(section));
  document.documentElement.classList.add('article-motion');
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('seen');reveal.unobserve(entry.target)}}),{rootMargin:'0px 0px -5% 0px'});
  document.querySelectorAll('.demo, .takeaway').forEach(el=>reveal.observe(el));
  const button=document.getElementById('motion-toggle'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  button.hidden=false;let paused=reduced.matches;
  function motion(){document.documentElement.classList.toggle('reading-paused',paused);button.textContent=paused?'Activar animaciones':'Pausar animaciones';button.setAttribute('aria-pressed',String(paused))}
  button.addEventListener('click',()=>{paused=!paused;motion()});reduced.addEventListener('change',e=>{paused=e.matches;motion()});motion();
})();
