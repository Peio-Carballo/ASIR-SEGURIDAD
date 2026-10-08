(() => {
  'use strict';
  if (!window.gsap) return; // The original examples remain usable without the player.
  const pink = '#e87899', purple = '#a9a5bd', green = '#94c8ac';
  const duration = 7;
  const players = [];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let motionDisabled = preference.matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const layer = (phases, content) => `<g data-phases="${phases}">${content}</g>`;
  const label = (x,y,text,color='#c3bfd1',size=14) => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="middle">${esc(text)}</text>`;
  const line = (d,color=purple) => `<path class="story-wire" d="${d}" stroke="${color}"/>`;
  const pulse = (d,color=pink,n=4) => `${line(d,color)}<g data-flow="${d}">${Array.from({length:n},()=>`<circle r="4" fill="${color}"/>`).join('')}</g>`;
  const badge = (x,y,text,color=pink) => `<g transform="translate(${x} ${y})"><rect x="-93" y="-15" width="186" height="30" rx="15" fill="#181522" stroke="${color}" stroke-opacity=".55"/>${label(0,5,text,color,12)}</g>`;
  const laptop = (x,y,title='Tu equipo',accent=purple) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="112" rx="115" ry="19" fill="#06060c" opacity=".7"/><path d="M-93 -69 L73 -69 L92 -57 L92 60 L73 73 L-93 73Z" fill="#25262d" stroke="#5a4a76"/><path d="M73 -69 L92 -57 L92 60 L73 73Z" fill="#303139"/><rect x="-84" y="-60" width="148" height="119" rx="5" fill="#0e101b" stroke="${accent}" stroke-opacity=".7"/><rect x="-75" y="-50" width="129" height="15" rx="3" fill="#25223a"/><circle cx="-67" cy="-43" r="2" fill="${pink}"/><circle cx="-59" cy="-43" r="2" fill="${purple}"/><circle cx="-51" cy="-43" r="2" fill="${green}"/><path d="M-93 73 L73 73 L115 97 L-49 113 L-116 91Z" fill="#303137" stroke="#5e5d69"/><path d="M-74 79 L63 79 L84 90 L-53 99Z" fill="#151522"/><path d="M-30 99 L11 95 L24 100 L-17 104Z" fill="#5b4c72"/>${label(0,145,title,accent,15)}</g>`;
  const server = (x,y,title='La web',accent=purple) => `<g transform="translate(${x} ${y})"><ellipse cx="5" cy="100" rx="76" ry="19" fill="#06060c" opacity=".7"/><path d="M-49 -65 L25 -81 L66 -56 L-8 -38Z" fill="#484951" stroke="#78678d"/><path d="M-49 -65 L-8 -38 L-8 95 L-49 68Z" fill="#24252b" stroke="#5a426d"/><path d="M-8 -38 L66 -56 L66 77 L-8 95Z" fill="#35363d" stroke="${accent}" stroke-opacity=".7"/>${[0,1,2].map(i=>`<path d="M1 ${-19+i*35} L54 ${-32+i*35} L54 ${-12+i*35} L1 ${1+i*35}Z" fill="#11111d" stroke="#584068"/><circle cx="45" cy="${-17+i*35}" r="3" fill="${accent}"/><path d="M8 ${-7+i*35} L31 ${-13+i*35}" stroke="#736184"/>`).join('')}${label(5,135,title,accent,15)}</g>`;
  const envelope = (x,y) => `<g transform="translate(${x} ${y})"><rect x="-57" y="-35" width="114" height="70" rx="9" fill="#2d2d34" stroke="${pink}" stroke-width="1.5"/><path d="M-55 -29 L0 7 L55 -29 M-55 29 L-18 1 M55 29 L18 1" fill="none" stroke="${pink}"/>${label(0,65,'Un aviso urgente',pink,14)}</g>`;
  const card = (x,y,title,content,color=purple) => `<g transform="translate(${x} ${y})"><rect x="-83" y="-37" width="166" height="74" rx="10" fill="#27282f" stroke="${color}" stroke-opacity=".65"/>${label(0,-9,title,color,13)}${label(0,17,content,'#eee7f5',16)}</g>`;
  const shield = (x,y,color=green) => `<g transform="translate(${x} ${y})"><path d="M0 -42 L34 -27 L30 8 Q20 33 0 43 Q-20 33 -30 8 L-34 -27Z" fill="#182b29" stroke="${color}" stroke-width="2"/><path d="M-15 0 L-4 12 L18 -14" stroke="${color}" stroke-width="3" fill="none"/></g>`;
  const bug = (x,y) => `<g transform="translate(${x} ${y})"><ellipse rx="21" ry="29" fill="#411b35" stroke="${pink}" stroke-width="2"/><path d="M-20 -15 L-37 -25 M-22 0 L-40 0 M-20 15 L-37 26 M20 -15 L37 -25 M22 0 L40 0 M20 15 L37 26 M-8 -25 L-16 -40 M8 -25 L16 -40 M0 -20 L0 20" stroke="${pink}" fill="none" stroke-width="2"/><circle cx="-7" cy="-12" r="3" fill="${pink}"/><circle cx="7" cy="-12" r="3" fill="${pink}"/></g>`;
  const eye = (x,y) => `<g transform="translate(${x} ${y})"><path d="M-55 0 Q0 -65 55 0 Q0 65 -55 0Z" fill="#2d1731" stroke="${pink}" stroke-width="2"/><circle r="20" fill="#513152" stroke="${pink}"/><circle r="8" fill="${pink}"/>${label(0,65,'Observa a escondidas',pink,14)}</g>`;
  const packageBox = (x,y) => `<g transform="translate(${x} ${y})"><path d="M-48 -32 L15 -49 L60 -20 L-4 -1Z" fill="#555560" stroke="${purple}"/><path d="M-48 -32 L-4 -1 L-4 67 L-48 33Z" fill="#2c2d34" stroke="${purple}"/><path d="M-4 -1 L60 -20 L60 47 L-4 67Z" fill="#41424a" stroke="${purple}"/><path d="M17 8 L42 1 L48 24 L34 22 L21 31Z" fill="${purple}"/><path d="M26 14 L36 11 M31 8 L31 18" stroke="#282032" stroke-width="2"/>${label(0,99,'GameBoost gratis',purple,15)}</g>`;
  const door = (x,y,color=purple,title='Acceso') => `<g transform="translate(${x} ${y})"><path d="M-23 -39 L23 -39 L23 42 L-23 42Z" fill="#272034" stroke="${color}"/><path d="M-18 -33 L13 -24 L13 40 L-18 35Z" fill="#12131f" stroke="${color}"/><circle cx="7" cy="10" r="2" fill="${color}"/>${label(0,66,title,color,13)}</g>`;
  const archive = (x,y) => `<g transform="translate(${x} ${y})"><path d="M-57 -46 L32 -46 L57 -24 L57 55 L-57 55Z" fill="#2c2d34" stroke="${pink}"/><path d="M32 -46 L32 -24 L57 -24" fill="#4a2a46" stroke="${pink}"/><path d="M-25 -10 L25 -10 M-25 4 L25 4 M-25 18 L8 18" stroke="${pink}" stroke-opacity=".7"/>${label(0,84,'Otra persona',pink,15)}</g>`;
  const definitions = {
    phishing: {
      title:'Cómo funciona el phishing', tag:'01 / EL ENGAÑO', hint:'Sigue el viaje de un aviso falso.',
      steps:[
        ['El gancho','Te llega un aviso que parece de tu cuenta. Te mete prisa para que no lo compruebes.'],
        ['La copia','El enlace lleva a una página que imita a la original. El aspecto no demuestra quién está detrás.'],
        ['La consecuencia','Si escribes allí la contraseña, se la entregas a quien ha creado la trampa.'],
        ['Comprobar','Abre tú la aplicación oficial y comprueba el aviso por esa vía, sin usar el enlace del mensaje.']
      ],
      art:()=>layer('0 1 2',laptop(145,200))+layer('0',envelope(490,164)+pulse('M445 194 Q310 100 174 183',pink)+badge(488,267,'«Tu cuenta se cierra»'))+
        layer('1 2',server(601,176,'Página falsa',pink)+pulse('M240 188 Q390 100 570 168',pink))+
        layer('1',card(370,104,'MISMO ASPECTO','Otro destino',pink)+card(133,209,'CONTRASEÑA','••••••••',pink))+
        layer('2',card(137,209,'CONTRASEÑA','••••••••',pink)+pulse('M200 222 Q365 295 565 220',pink,6)+badge(402,286,'Tus datos salen'))+
        layer('3',laptop(145,200,'Tú decides',green)+server(601,176,'Aplicación oficial',green)+shield(374,188)+pulse('M240 207 L337 207',green)+pulse('M411 207 L566 207',green)+badge(374,298,'Comprueba por otra vía',green))
    },
    dos: {
      title:'Qué pasa durante un DDoS', tag:'02 / LA SATURACIÓN', hint:'Mira qué ocurre cuando ya no puede atender.',
      steps:[
        ['Uso normal','Los visitantes envían peticiones y la web tiene capacidad para responder.'],
        ['La avalancha','En este ejemplo, muchos equipos envían peticiones a la vez para saturar el servicio: es un DDoS.'],
        ['No queda sitio','Las peticiones reales esperan o fallan. Saturar una web no significa, por sí solo, robar sus datos.'],
        ['Filtrar el ataque','La protección intenta distinguir el tráfico del ataque y dejar pasar a los usuarios reales. No es infalible.']
      ],
      art:()=>layer('0 1 2 3',laptop(120,235,'Un visitante real',green)+server(611,175,'El servicio',purple))+
        layer('0',pulse('M213 219 Q380 162 582 170',green)+badge(400,294,'Hay capacidad',green))+
        layer('1 2 3',[0,1,2].map(i=>card(110+i*190,64,'EQUIPO DEL ATAQUE','Muchas peticiones',pink)).join(''))+
        layer('1 2',[0,1,2].map(i=>pulse(`M${110+i*190} 105 Q${330+i*90} 120 590 177`,pink,5)).join(''))+
        layer('1',badge(413,291,'La carga aumenta'))+
        layer('2',line('M213 219 Q390 225 582 170',green)+Array.from({length:9},(_,i)=>`<rect x="${285+i*25}" y="221" width="17" height="13" rx="3" fill="${pink}"/>`).join('')+badge(410,291,'Usuarios esperando')+badge(615,339,'No puede atender'))+
        layer('3',[0,1,2].map(i=>pulse(`M${110+i*190} 105 Q${250+i*95} 112 404 156`,pink,3)).join('')+shield(420,190)+pulse('M213 219 Q312 242 385 210',green)+pulse('M457 210 Q531 244 586 190',green)+badge(403,299,'Se filtra el ataque',green))
    },
    troyano: {
      title:'Qué puede esconder un troyano', tag:'03 / LA SORPRESA', hint:'Mira lo que hay detrás de una descarga.',
      steps:[
        ['La promesa','Un programa de una web desconocida promete acelerar tus juegos. Parece justo lo que buscas.'],
        ['Lo ejecutas','El engaño consigue que abras el instalador. La amenaza entra disfrazada de algo útil.'],
        ['Lo que escondía','En este caso instala un ladrón de datos en segundo plano. El troyano es el disfraz; robar es lo que hace después.'],
        ['Antes de abrir','Descarga desde fuentes oficiales y revisa lo que instalas. Un logo bonito no garantiza que un programa sea seguro.']
      ],
      art:()=>layer('0 1 2',laptop(587,195))+layer('0 1',packageBox(157,172))+
        layer('0',card(416,128,'LA PROMESA','«Más FPS»')+badge(174,306,'Demasiado bueno'))+
        layer('1',pulse('M222 197 Q382 103 502 189',purple)+badge(416,303,'Abres el instalador',purple))+
        layer('2',packageBox(154,171)+bug(347,182)+pulse('M210 193 L303 193',pink)+pulse('M388 193 L503 193',pink)+badge(347,299,'El problema iba dentro'))+
        layer('3',server(160,184,'Fuente oficial',green)+laptop(587,195,'Revisa antes',green)+shield(372,190)+pulse('M222 197 L336 197',green)+pulse('M410 197 L501 197',green))
    },
    backdoors: {
      title:'Cómo funciona una puerta trasera', tag:'04 / EL ACCESO OCULTO', hint:'Sigue los dos caminos hasta el equipo.',
      steps:[
        ['La entrada normal','Para acceder normalmente tienes que identificarte y pasar las comprobaciones.'],
        ['La vía escondida','Después de comprometer un equipo, alguien puede dejar otro acceso que se salta esos controles.'],
        ['Cambiar no basta','Cambias la contraseña de la entrada principal, pero la vía oculta puede seguir ahí.'],
        ['Revisar qué dejaron','Hay que investigar cómo entraron y eliminar los accesos que dejaron. Cambiar solo la contraseña puede no resolverlo.']
      ],
      art:()=>layer('0 1 2 3',laptop(118,209,'Quien intenta entrar')+server(623,170,'Tu equipo'))+
        layer('0',door(381,150,green,'Control normal')+pulse('M212 187 Q292 130 351 144',green)+pulse('M410 144 L585 167',green)+badge(380,293,'Identificarse primero',green))+
        layer('1 2',door(381,99,green,'Entrada principal')+door(381,265,pink,'Puerta oculta')+line('M212 186 Q289 94 353 99',green)+line('M410 99 L585 154',green)+pulse('M212 239 Q275 288 353 269',pink)+pulse('M410 269 Q522 281 594 219',pink))+
        layer('1',badge(612,343,'Se salta el control'))+
        layer('2',badge(384,24,'Contraseña nueva',green)+badge(608,343,'La otra vía sigue ahí'))+
        layer('3',door(381,109,green,'Control normal')+shield(384,243)+line('M212 236 Q282 290 350 255',pink)+line('M415 254 Q530 268 594 213',pink)+badge(382,336,'Investigar y eliminar',green))
    },
    spyware: {
      title:'Qué recoge un programa espía', tag:'05 / LO QUE NO SE VE', hint:'La actividad parece normal; el seguimiento no.',
      steps:[
        ['Todo parece normal','Utilizas una aplicación y navegas. No hay una ventana que avise de que te están observando.'],
        ['Observa','Un programa oculto puede recoger la actividad del dispositivo, según las capacidades que tenga.'],
        ['Recoge y envía','En este ejemplo guarda páginas visitadas y texto escrito, y después envía esa información.'],
        ['Revisar la app','Comprueba de dónde viene y qué permisos pide. Si sospechas, revisa el equipo con herramientas de seguridad.']
      ],
      art:()=>layer('0 1 2',laptop(169,202,'Tu actividad'))+
        layer('0',card(514,157,'LA APP','Uso normal')+line('M271 210 Q391 170 431 161',purple))+
        layer('1 2',eye(526,155)+pulse('M263 205 Q370 113 473 155',pink))+
        layer('1',badge(517,283,'Sin aviso visible'))+
        layer('2',card(430,276,'PÁGINAS Y TEXTO','Actividad ficticia',pink)+pulse('M507 204 Q502 244 450 244',pink)+archive(668,270)+pulse('M517 281 L606 281',pink,4))+
        layer('3',laptop(169,202,'Revisa tu equipo',green)+shield(400,177)+card(606,160,'PERMISOS','Solo los necesarios',green)+pulse('M269 207 L361 188',green)+badge(497,297,'Origen + permisos',green))
    },
    stealers: {
      title:'Qué intenta robar un stealer', tag:'06 / EL ROBO', hint:'No solo les interesa tu contraseña.',
      steps:[
        ['Datos guardados','Tu navegador puede guardar contraseñas y mantener cuentas abiertas. Son datos valiosos.'],
        ['Los reúne','Un stealer intenta recoger contraseñas, datos de pago o sesiones a las que consiga acceder.'],
        ['Se los lleva','Envía los datos a otra persona. Una sesión robada puede permitir acceder sin escribir otra vez la contraseña.'],
        ['Qué hacer después','Revisa el equipo afectado. Desde uno seguro, cambia las contraseñas y cierra las sesiones de tus cuentas.']
      ],
      art:()=>layer('0 1 2',laptop(120,204,'Tu navegador'))+
        layer('0 1',card(426,88,'CONTRASEÑAS','••••••••',purple)+card(426,200,'DATOS DE PAGO','•••• 1234',purple)+card(426,312,'SESIONES','Cuenta abierta',purple))+
        layer('0',line('M213 182 Q275 88 341 88')+line('M213 213 L341 200')+line('M213 239 Q279 312 341 312'))+
        layer('1',archive(667,197)+[88,200,312].map(y=>pulse(`M509 ${y} Q580 ${y} 608 204`,pink)).join(''))+
        layer('2',archive(668,197)+card(392,134,'DATOS RECOGIDOS','Contraseña + sesión',pink)+pulse('M218 213 Q401 263 607 213',pink,7)+badge(397,304,'El PC puede seguir normal'))+
        layer('3',laptop(142,201,'Un equipo seguro',green)+shield(390,191)+card(615,136,'CONTRASEÑAS','Cambiadas',green)+card(615,261,'SESIONES','Cerradas',green)+pulse('M241 203 L351 203',green))
    }
  };

  function createPlayer(id, story, index) {
    const section = document.getElementById(id);
    const original = section?.querySelector('.demo');
    if (!original) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'story-column';
    const cardElement = document.createElement('div');
    cardElement.className = 'threat-story';
    cardElement.innerHTML = `<div class="story-heading"><span>${story.tag}</span><span class="story-format">EXPLICACIÓN ANIMADA</span></div>
      <h3>${story.title}</h3><p class="story-hint">${story.hint}</p>
      <div class="story-stage"><span class="stage-corner">S/A. <span>/ ESCENA ${String(index+1).padStart(2,'0')}</span></span>
      <svg class="story-svg" viewBox="0 0 760 410" role="img" aria-labelledby="${id}-scene-title ${id}-scene-description">
        <title id="${id}-scene-title">${esc(story.title)}</title><desc id="${id}-scene-description">${esc(story.steps[0][1])}</desc>
        <defs><radialGradient id="${id}-halo"><stop stop-color="#17181c" stop-opacity=".32"/><stop offset="1" stop-color="#111119" stop-opacity="0"/></radialGradient><pattern id="${id}-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#bb8ddd" stroke-opacity=".055"/></pattern></defs>
        
        <g class="story-camera">${story.art()}</g>
      </svg><div class="story-stage-footer"><span><i class="stage-dot"></i> Ejemplo ficticio</span><span class="stage-counter">01 / 04</span></div></div>
      <div class="story-caption"><span class="caption-index">01</span><div><h4>${story.steps[0][0]}</h4><p>${story.steps[0][1]}</p></div></div>
      <div class="story-timeline" role="group" aria-label="Pasos de la explicación de ${id}">${story.steps.map((s,i)=>`<button type="button" data-step="${i}" aria-label="Paso ${i+1}: ${esc(s[0])}" ${i===0?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span>${esc(s[0])}<i></i></button>`).join('')}</div>
      <div class="story-controls"><button class="story-play" type="button" aria-label="Reproducir explicación de ${id}"><span class="play-icon" aria-hidden="true">▶</span><span class="play-text">Ver explicación</span></button><button class="story-replay" type="button" aria-label="Repetir explicación de ${id}">↺ <span>Repetir</span></button><div class="story-arrows"><button data-direction="-1" type="button" aria-label="Paso anterior">←</button><button data-direction="1" type="button" aria-label="Paso siguiente">→</button></div></div>
      <label class="story-scrub"><span>Progreso de la explicación</span><input type="range" min="0" max="${duration*4}" step="0.05" value="0" aria-label="Progreso de la explicación de ${id}"></label>
      <p class="story-note">${id==='dos'?'Simulación local: no genera tráfico real.':'Todos los datos y acciones de la escena son inventados.'}</p>`;
    // The examples supplied in the original article stay available for exploration.
    const explore = document.createElement('details');
    explore.className = 'story-explore';
    const summary = document.createElement('summary');
    summary.textContent = id==='dos'?'Prueba tú: cambia la carga':'Explorar el ejemplo original';
    explore.append(summary);
    original.before(wrapper);
    wrapper.append(cardElement, explore);
    explore.append(original);

    const phaseGroups = [...cardElement.querySelectorAll('[data-phases]')];
    const camera = cardElement.querySelector('.story-camera');
    const caption = cardElement.querySelector('.story-caption');
    const stepButtons = [...cardElement.querySelectorAll('[data-step]')];
    const play = cardElement.querySelector('.story-play');
    const scrub = cardElement.querySelector('input[type="range"]');
    const previous = cardElement.querySelector('[data-direction="-1"]');
    const next = cardElement.querySelector('[data-direction="1"]');
    let current = -1;
    let playing = false;
    let phaseTween;
    let cameraTween;
    const clock = { time: 0 };
    const activeFlows = [];
    const temporarySvg = cardElement.querySelector('svg');
    cardElement.querySelectorAll('[data-flow]').forEach(flow => {
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',flow.dataset.flow);
      temporarySvg.append(path);
      const length = path.getTotalLength();
      const points = Array.from({length:121},(_,i)=>path.getPointAtLength(length*i/120));
      path.remove();
      activeFlows.push({parent:flow.closest('[data-phases]'),dots:[...flow.children],points});
    });
    function setPhase(step, animate=false) {
      if (step === current) return;
      current = step;
      phaseTween?.kill();
      cameraTween?.kill();
      const active = [], inactive = [];
      phaseGroups.forEach(group => (group.dataset.phases.split(' ').includes(String(step))?active:inactive).push(group));
      gsap.killTweensOf(phaseGroups);
      gsap.set(inactive,{autoAlpha:0});
      gsap.set(active,{autoAlpha:1,y:0});
      if (animate && !motionDisabled) {
        phaseTween = gsap.fromTo(active,{opacity:0,y:10},{opacity:1,y:0,duration:.55,ease:'power2.out'});
        cameraTween = gsap.fromTo(camera,{scale:.96,x:0,y:0},{scale:1,x:0,y:0,svgOrigin:'380 205',duration:3.5,ease:'power2.out'});
      } else gsap.set(camera,{scale:1,x:0,y:0});
      cardElement.dataset.phase = String(step);
      const [title, text] = story.steps[step];
      caption.querySelector('.caption-index').textContent = String(step+1).padStart(2,'0');
      caption.querySelector('h4').textContent = title;
      caption.querySelector('p').textContent = text;
      cardElement.querySelector('desc').textContent = text;
      cardElement.querySelector('.stage-counter').textContent = `${String(step+1).padStart(2,'0')} / 04`;
      stepButtons.forEach((button,i)=>{
        button.classList.toggle('is-current',i===step);
        button.classList.toggle('is-done',i<step);
        if(i===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
      });
      previous.disabled = step === 0;
      next.disabled = step === 3;
    }
    function render() {
      const step = Math.min(3,Math.floor(clock.time/duration));
      const changed = step !== current;
      setPhase(step,playing);
      scrub.value = String(clock.time);
      const progress = (clock.time%duration)/duration;
      stepButtons.forEach((button,i)=>button.style.setProperty('--step-progress',`${i<step?100:i===step?progress*100:0}%`));
      activeFlows.forEach(flow => {
        if(!flow.parent.dataset.phases.split(' ').includes(String(step)))return;
        flow.dots.forEach((dot,i)=>{
          const t = ((clock.time*.36+i/flow.dots.length)%1+1)%1;
          const point = flow.points[Math.floor(t*120)];
          dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);
          dot.setAttribute('opacity',t<.08?t/.08:t>.9?(1-t)/.1:1);
        });
      });
      if (changed) {
        // Frame the visible illustration, rather than shrinking a large empty canvas.
        const boxes = phaseGroups.filter(group => group.dataset.phases.split(' ').includes(String(step))).map(group => group.getBBox());
        const left = Math.min(...boxes.map(box => box.x));
        const top = Math.min(...boxes.map(box => box.y));
        const right = Math.max(...boxes.map(box => box.x + box.width));
        const bottom = Math.max(...boxes.map(box => box.y + box.height));
        temporarySvg.setAttribute('viewBox', `${left-22} ${top-16} ${right-left+44} ${bottom-top+32}`);
      }
    }
    function buttonState() {
      play.classList.toggle('is-playing',playing);
      play.querySelector('.play-icon').textContent = playing?'Ⅱ':'▶';
      play.querySelector('.play-text').textContent = motionDisabled?'Ver paso siguiente':playing?'Pausar':clock.time>=duration*4?'Ver otra vez':clock.time>0?'Continuar':'Ver explicación';
      play.setAttribute('aria-label',motionDisabled?'Ver paso siguiente':`${playing?'Pausar':'Reproducir'} explicación de ${id}`);
    }
    const timeline = gsap.timeline({paused:true,onUpdate:render,onComplete:()=>{playing=false;buttonState();stepButtons[3].style.setProperty('--step-progress','100%')}});
    timeline.to(clock,{time:duration*4,duration:duration*4,ease:'none'});
    function pause() {
      timeline.pause();phaseTween?.pause();cameraTween?.pause();playing=false;buttonState();
    }
    function jump(step) {
      pause();timeline.time(Math.max(0,Math.min(3,step))*duration,true);
      render();buttonState();
    }
    function start() {
      if(motionDisabled){jump(current===3?0:current+1);return;}
      if(clock.time>=duration*4){timeline.time(0,true);current=-1;render();}
      playing=true;phaseTween?.resume();cameraTween?.resume();timeline.play();buttonState();
    }
    play.addEventListener('click',()=>playing?pause():start());
    cardElement.querySelector('.story-replay').addEventListener('click',()=>{jump(0);if(!motionDisabled)start()});
    stepButtons.forEach(button=>button.addEventListener('click',()=>jump(Number(button.dataset.step))));
    previous.addEventListener('click',()=>jump(current-1));next.addEventListener('click',()=>jump(current+1));
    scrub.addEventListener('input',()=>{pause();timeline.time(Number(scrub.value),true);render();buttonState()});
    const state = {element:cardElement,pause,refresh:()=>{pause();current=-1;render();buttonState()},get playing(){return playing}};
    players.push(state);
    render();buttonState();
  }
  Object.entries(definitions).forEach(([id,story],i)=>createPlayer(id,story,i));
  // Pause background players; viewing another section never starts one automatically.
  const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)players.find(p=>p.element===entry.target)?.pause();
  }),{threshold:0});
  players.forEach(p=>observer.observe(p.element));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)players.forEach(p=>p.pause())});
  addEventListener('threat-motion',event=>{motionDisabled=event.detail.paused;players.forEach(p=>p.refresh())});
  document.documentElement.classList.add('stories-ready');
})();
