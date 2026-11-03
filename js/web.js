// Construccions i Reformes DASER · cabecera, menú, portada con zoom lento,
// manifiesto que se enciende palabra a palabra, aspas que giran, hojas apiladas, arco de los pasos, parallax,
// antes/después a mano, apariciones y formulario a WhatsApp. Todo el scroll en un solo requestAnimationFrame.
(() => {
  const d = document, reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lim = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  // progreso de una sección fijada: 0 al llegar arriba, 1 cuando se acaba su recorrido
  const fijado = (el, vh) => { const r = el.getBoundingClientRect(); return lim(-r.top / Math.max(1, r.height - vh)); };

  // menú del móvil
  const cab = d.getElementById('cab'), menu = d.getElementById('menu'), nav = d.getElementById('nav');
  const poner = (ab) => { cab.classList.toggle('abierto', ab); menu.setAttribute('aria-expanded', ab); };
  menu.addEventListener('click', () => poner(!cab.classList.contains('abierto')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) poner(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') poner(false); });

  // manifiesto: cada palabra en su span para encenderlas una a una
  const man = d.querySelector('[data-manifiesto]');
  let palabras = [];
  if (man) {
    man.innerHTML = man.textContent.trim().split(/\s+/).map((w) => `<span class="p">${w}</span>`).join(' ');
    palabras = [...man.querySelectorAll('.p')];
  }

  const portada = d.querySelector('[data-portada]'), flot = d.querySelector('.flotante');
  const pFoto = portada && portada.querySelector('.portada__foto img'), pTxt = portada && portada.querySelector('.portada__txt');
  const giro = d.querySelector('[data-giro]');
  const hojas = [...d.querySelectorAll('.hoja')];
  let topes = [];
  const medirHojas = () => { topes = hojas.map((h) => parseFloat(getComputedStyle(h).top) || 0); };
  medirHojas();
  const pasos = d.getElementById('pasos'), arco = pasos && pasos.querySelector('.arco--pasos path');
  const pxs = [...d.querySelectorAll('[data-px]')].map((el) => ({ el, v: parseFloat(el.dataset.px) }));
  const nombre = d.querySelector('.pie__nombre');

  let pendiente = false;
  const fotograma = () => {
    pendiente = false;
    const y = scrollY, vh = innerHeight;
    cab.classList.toggle('fija', y > 30);

    // portada: la foto se acerca despacio y el texto sube y se apaga al bajar
    if (portada) {
      const p = lim(y / Math.max(1, portada.offsetHeight));
      if (!reducir) {
        pFoto && pFoto.style.setProperty('--z', (p * .12).toFixed(4));
        if (pTxt) { pTxt.style.setProperty('--ty', `${(-p * 90).toFixed(1)}px`); pTxt.style.setProperty('--op', (1 - p * 1.4).toFixed(3)); }
      }
      flot && flot.classList.toggle('ver', y > portada.offsetHeight * .7);
    }
    // el manifiesto se enciende al pasar por el centro de la pantalla
    if (man) {
      const r = man.getBoundingClientRect();
      const t = reducir ? 1 : lim((vh * .82 - r.top) / (r.height + vh * .32));
      const n = Math.round(t * palabras.length);
      palabras.forEach((w, i) => w.classList.toggle('on', i < n));
    }
    if (giro && !reducir) giro.style.transform = `rotate(${(y * .18).toFixed(1)}deg)`;
    // hojas apiladas: la de debajo se encoge un poco cuando la siguiente la tapa
    if (!reducir) hojas.forEach((h, i) => {
      const sig = hojas[i + 1];
      if (!sig) return;
      const t = lim(1 - (sig.getBoundingClientRect().top - topes[i]) / h.offsetHeight);
      h.style.setProperty('--s', (1 - t * .05).toFixed(4));
    });
    // el arco cobre recorre los cuatro pasos
    if (arco && !reducir) {
      const r = pasos.getBoundingClientRect();
      arco.style.setProperty('--avance', (1 - lim((vh * .85 - r.top) / (r.height + vh * .35))).toFixed(3));
    }
    if (!reducir) {
      pxs.forEach(({ el, v }) => { const r = el.parentElement.getBoundingClientRect(); el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * v).toFixed(1)}px, 0)`; });
      if (nombre) { const r = nombre.getBoundingClientRect(); nombre.style.setProperty('--ny', `${(lim((vh - r.top) / vh) * -40 + 40).toFixed(1)}px`); }
    }
  };
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(fotograma); } };
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', () => { medirHojas(); pedir(); });
  fotograma();

  // antes / después a mano
  d.querySelectorAll('[data-ad]').forEach((ad) => {
    const r = ad.querySelector('.ad__rango');
    const poner = (v) => { ad.style.setProperty('--x', v + '%'); r.value = v; };
    r.addEventListener('input', () => { ad.classList.remove('barrido'); tocado = true; poner(r.value); });
    // al aparecer, un barrido corto enseña que la barra se mueve
    let tocado = false;
    if (!reducir && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return; io.disconnect();
        ad.classList.add('barrido');
        [[300, 86], [1500, 30], [2700, 62]].forEach(([t, v]) => setTimeout(() => { if (!tocado) poner(v); }, t));
        setTimeout(() => ad.classList.remove('barrido'), 3900);
      }, { threshold: .55 });
      io.observe(ad);
    }
  });

  // el mapa de Google solo se carga si se pide (pesa mucho y no hace falta para ver la web)
  const mapa = d.querySelector('[data-mapa]');
  mapa && mapa.querySelector('.mapa__ver').addEventListener('click', (e) => {
    const f = d.createElement('iframe');
    f.title = 'Mapa: Construccions i Reformes DASER en La Llosa de Ranes';
    f.src = 'https://www.google.com/maps?q=Construccions+i+Reformes+DASER,+La+Llosa+de+Ranes&z=13&output=embed';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    e.currentTarget.replaceWith(f);
  }, { once: true });

  // apariciones suaves
  const el = d.querySelectorAll('.titular, .hoja__texto, .ad__texto, .ad, .obra-publica__texto, .pasos li, .zona__texto, .zona__mapa, .contacto__datos, .formulario, .nota-google');
  const rev = d.querySelectorAll('[data-revela]');
  if ('IntersectionObserver' in window && !reducir) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
    el.forEach((x, i) => { x.classList.add('aparece'); x.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(x); });
    rev.forEach((x) => io.observe(x));
  } else rev.forEach((x) => x.classList.add('visto'));

  // formulario → WhatsApp con el mensaje ya escrito
  const f = d.getElementById('formulario');
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    for (const n of ['nombre', 'telefono']) { const c = f.elements[n], vale = c.value.trim().length > 1; c.setAttribute('aria-invalid', !vale); if (!vale && ok) { c.focus(); ok = false; } }
    if (!ok) return;
    const v = (n) => f.elements[n].value.trim();
    const texto = `Hola, soy ${v('nombre')}. Quería pedir presupuesto para: ${v('obra')}${v('pueblo') ? ' en ' + v('pueblo') : ''}.${v('mensaje') ? '\n' + v('mensaje') : ''}\nMi teléfono: ${v('telefono')}`;
    window.open('https://wa.me/34605153140?text=' + encodeURIComponent(texto), '_blank', 'noopener');
  });
})();
