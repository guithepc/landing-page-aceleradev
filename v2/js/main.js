(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);

  // ---------- alunos (dados tirados dos prints reais) ----------
  const people = [
    { img: 'luan', name: 'Luan Mendes', via: 'Discord', title: 'Contrato internacional em Portugal', q: 'Boa parte dessa conquista começou dentro da comunidade.', tag: 'Dev Java · Portugal' },
    { img: 'catarina', name: 'Catarina', via: 'Discord', title: 'Vaga de júnior front-end', q: 'Depois de fazer as melhorias no CV e LinkedIn como o PC ensina, comecei a ter entrevistas todas as semanas.', tag: 'Front-end Jr.' },
    { img: 'thiago', name: 'Thiago', via: 'Discord', title: 'Engenheiro de Software Jr. no BTG Pactual', q: 'Quando entrei no AceleraDev, eu não conseguia chegar nem na etapa das entrevistas.', tag: 'BTG Pactual' },
    { img: 'lucas', name: 'Lucas Mendes', via: 'Discord', title: 'Aprovado pra nível Pleno', q: 'Entrei no AceleraDev em 25/05 e hoje fui aprovado para uma nova oportunidade a nível Pleno.', tag: 'Pleno · Cyber' },
    { img: 'gabriel', name: 'Gabriel Nunes', via: 'Discord', title: 'Júnior Full Stack com 1 mês de comunidade', q: 'Com 3 meses de estágio comecei a procurar vagas de Júnior, mas não conseguia nada.', tag: 'Full Stack Jr.' },
    { img: 'vinicius', name: 'Vinicius', via: 'Discord', title: 'Estágio no Bradesco, em Produtos e Dados', q: 'Vou ter a oportunidade de trabalhar com análise de dados… e ferramentas como Databricks.', tag: 'Bradesco · Dados' },
    { img: 'victor', name: 'Victor Leal', via: 'Discord', title: 'Estágio como dev, 100% home office', q: 'Antes eu nem chegava em entrevista… depois do curso mudou tudo, comecei a cair em entrevista direto.', tag: 'Estágio · Remoto' },
    { img: 'luis', name: 'Luís', via: 'Discord', title: 'Dev Java remoto, aprovado de primeira', q: 'Depois de mais de um ano tentando… transformei a entrevista em uma conversa natural.', tag: 'Java · Remoto' },
    { img: 'sicredi', name: 'Aluna AceleraDev', via: 'Instagram', title: 'Entrou no Sicredi', q: 'Consegui entrar no Sicredi! Você me ajudou na entrevista.', tag: 'Sicredi' },
    { img: 'tres', name: 'Aluna AceleraDev', via: 'Instagram', title: 'Chamada pra 3 processos de uma vez', q: 'Os ajustes feitos no LinkedIn e no CV… fui chamada para 3 processos seletivos, entre eles Itaú e Saint-Gobain.', tag: 'Itaú · Saint-Gobain' },
  ];
  const peopleEl = $('#people');
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  peopleEl.innerHTML = people.map(p => `
    <article class="card person rv">
      <div class="who"><img src="assets/av-${p.img}.jpg" alt="Foto de perfil de ${esc(p.name)}"><div><b>${esc(p.name)}</b><small>via ${p.via}</small></div></div>
      <h3>${esc(p.title)}</h3>
      <q>${esc(p.q)}</q>
      <span class="tag">${esc(p.tag)}</span>
    </article>`).join('') + `
    <figure class="shot rv"><img src="assets/ph-kit.jpg" alt="Notebook do kit de estágio recebido pelo aluno"><span>Dia 1 do estágio</span><p>“Hoje fui retirar meu kit para começar o meu estágio.”</p></figure>
    <figure class="shot rv"><img src="assets/ph-mochila.jpg" alt="Mochila e notebook recebidos pelo aluno"><span>Postado por aluno</span><p>“Muito obrigado, irmão! Acelera mudou minha vida.”</p></figure>`;

  // ---------- mural de prints ----------
  const wallFiles = Array.from({ length: 21 }, (_, i) => `assets/wall/feedback-${String(i + 1).padStart(2, '0')}.avif`);
  const cols = 6, wallCols = $('#wallCols');
  for (let c = 0; c < cols; c++) {
    const mine = wallFiles.filter((_, i) => i % cols === c);
    const items = mine.map(src => `<button type="button" data-src="${src}"><img src="${src}" alt="Print de relato de aluno no Discord" loading="lazy"></button>`).join('');
    // duplicado para o loop vertical ser contínuo
    wallCols.insertAdjacentHTML('beforeend', `<div class="wall-col"><div class="wall-track">${items}${items.replace(/<button /g, '<button tabindex="-1" aria-hidden="true" ')}</div></div>`);
  }
  const lb = $('#lb'), lbImg = $('#lbImg');
  wallCols.addEventListener('click', e => {
    const b = e.target.closest('button[data-src]'); if (!b) return;
    lbImg.src = b.dataset.src; lbImg.alt = 'Print ampliado de relato de aluno';
    if (lb.showModal) lb.showModal();
  });
  $('#lbClose').addEventListener('click', () => lb.close());
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });

  // ---------- DMs ----------
  const dmTrack = $('#dmTrack');
  dmTrack.innerHTML = Array.from({ length: 19 }, (_, i) => `<img src="assets/dm/dm-${String(i + 1).padStart(2, '0')}.avif" alt="Print de mensagem de recrutador no LinkedIn" loading="lazy">`).join('');

  // ---------- revelar ao rolar ----------
  const rv = [...document.querySelectorAll('.rv')];
  if (!reduce && 'IntersectionObserver' in window) {
    const vh = innerHeight;
    rv.forEach(el => { if (el.getBoundingClientRect().top > vh * 0.92) el.classList.add('pre'); });
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target, sibs = [...el.parentElement.children].filter(x => x.classList.contains('rv'));
        el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 70 + 'ms';
        el.classList.remove('pre'); io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(el => io.observe(el));
  }

  // ---------- contadores ----------
  const fmt = n => n.toLocaleString('pt-BR');
  const counters = [...document.querySelectorAll('[data-count]')];
  const runCount = el => {
    const to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce) return;
    const t0 = performance.now(), dur = 1400;
    const step = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = pre + fmt(Math.round(to * e)) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } }), { threshold: .6 });
    counters.forEach(el => cio.observe(el));
  }

  // ---------- etapas do método acendem ----------
  const steps = [...document.querySelectorAll('#steps li')];
  if ('IntersectionObserver' in window) {
    const sio = new IntersectionObserver(es => es.forEach(en => en.target.classList.toggle('on', en.isIntersecting)), { rootMargin: '-40% 0px -45% 0px' });
    steps.forEach(s => sio.observe(s));
  }

  // ---------- nav + parallax + DM horizontal ----------
  const nav = $('#nav'), heroPhoto = $('#heroPhoto');
  const pin = $('#dmPin'), sticky = $('#dmSticky'), bar = $('#dmBar');
  let travel = 0;
  const layoutDM = () => {
    if (reduce) { pin.classList.remove('pinning'); pin.style.height = ''; return; }
    travel = Math.max(0, dmTrack.scrollWidth - innerWidth + 120);
    pin.classList.add('pinning');
    pin.style.height = (sticky.offsetHeight + travel * 0.9) + 'px';
  };
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 24);
    if (!reduce && y < 1200) heroPhoto.style.transform = `translateY(${y * -0.06}px)`;
    if (!reduce && travel) {
      const r = pin.getBoundingClientRect();
      const span = pin.offsetHeight - sticky.offsetHeight;
      const top = parseFloat(getComputedStyle(sticky).top) || 0;
      const p = Math.min(1, Math.max(0, (top - r.top) / span));
      dmTrack.style.transform = `translateX(${-p * travel}px)`;
      bar.style.transform = `scaleX(${p})`;
    }
  };
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); } }, { passive: true });
  addEventListener('resize', () => { layoutDM(); onScroll(); });
  addEventListener('load', () => { layoutDM(); onScroll(); });
  layoutDM(); onScroll();
})();
