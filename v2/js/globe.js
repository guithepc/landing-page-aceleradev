(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);

  // ---------- globo ----------
  const canvas = $('#globe'), stage = $('#stage');
  if (!window.d3 || !window.topojson) return;
  const ctx = canvas.getContext('2d');
  // Pontos ilustrativos: 40 devs em 15 capitais + Portugal (os dados reais ficam em resultados.aceleradev.com.br)
  const cities = [
    ['São Paulo', -46.63, -23.55, 8], ['Rio de Janeiro', -43.17, -22.91, 4], ['Belo Horizonte', -43.94, -19.92, 3],
    ['Curitiba', -49.27, -25.43, 3], ['Porto Alegre', -51.23, -30.03, 2], ['Florianópolis', -48.55, -27.59, 2],
    ['Salvador', -38.50, -12.97, 2], ['Recife', -34.88, -8.05, 2], ['Fortaleza', -38.52, -3.73, 2],
    ['Brasília', -47.88, -15.79, 2], ['Goiânia', -49.25, -16.68, 2], ['Manaus', -60.02, -3.12, 1],
    ['Belém', -48.49, -1.46, 1], ['Vitória', -40.34, -20.32, 2], ['Campo Grande', -54.62, -20.47, 2],
    ['Lisboa', -9.14, 38.72, 1], ['Porto', -8.61, 41.15, 1],
  ];
  const avatarImgs = ['luan', 'catarina', 'thiago', 'gabriel', 'victor', 'vinicius', 'lucas', 'luis'].map(n => { const im = new Image(); im.src = `assets/av-${n}.jpg`; return im; });
  // avatares flutuando ao lado de algumas cidades (não indicam onde cada aluno mora)
  const avatarSpots = [[-46.63, -23.55, 0], [-9.14, 38.72, 1], [-43.17, -22.91, 2], [-38.52, -3.73, 3], [-49.27, -25.43, 4], [-47.88, -15.79, 5], [-34.88, -8.05, 6], [-60.02, -3.12, 7]];
  const arcs = [[[-46.63, -23.55], [-9.14, 38.72]], [[-43.94, -19.92], [-8.61, 41.15]]];
  let land, borders, w = 0, h = 0, dpr = 1;
  const proj = d3.geoOrthographic().clipAngle(90).precision(.4);
  const path = d3.geoPath(proj, ctx);
  const grat = d3.geoGraticule10();
  let rot = [52, 12], dragging = false, last = null, visible = true, t0 = performance.now();

  const size = () => {
    const r = stage.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
    w = r.width; h = r.height; canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const R = Math.min(w * .4, h * .5);
    proj.translate([w / 2, h * .58]).scale(R);
  };
  const visibleAt = (lon, lat) => d3.geoDistance([lon, lat], [-rot[0], -rot[1]]) < Math.PI / 2 - .02;
  const draw = now => {
    ctx.clearRect(0, 0, w, h);
    proj.rotate(rot);
    const [cx, cy] = proj.translate(), R = proj.scale();
    // atmosfera
    const atm = ctx.createRadialGradient(cx, cy, R * .9, cx, cy, R * 1.25);
    atm.addColorStop(0, 'rgba(0,224,164,.16)'); atm.addColorStop(1, 'rgba(0,224,164,0)');
    ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2); ctx.fill();
    // oceano
    const sea = ctx.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R);
    sea.addColorStop(0, '#13201D'); sea.addColorStop(1, '#070B0C');
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.fillStyle = sea; ctx.fill();
    ctx.beginPath(); path(grat); ctx.strokeStyle = 'rgba(255,255,255,.045)'; ctx.lineWidth = 1; ctx.stroke();
    if (land) {
      ctx.beginPath(); path(land); ctx.fillStyle = '#2A3A35'; ctx.fill();
      ctx.beginPath(); path(borders); ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = .6; ctx.stroke();
    }
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.strokeStyle = 'rgba(0,224,164,.25)'; ctx.lineWidth = 1; ctx.stroke();
    // arcos Brasil → Portugal com traço correndo
    const tt = (now - t0) / 1000;
    arcs.forEach(([a, b], i) => {
      const interp = d3.geoInterpolate(a, b), pts = d3.range(0, 1.0001, .02).map(interp);
      ctx.beginPath(); path({ type: 'LineString', coordinates: pts });
      ctx.strokeStyle = 'rgba(0,224,164,.35)'; ctx.lineWidth = 1.4; ctx.setLineDash([4, 6]); ctx.lineDashOffset = -tt * 18 - i * 5; ctx.stroke(); ctx.setLineDash([]);
      const k = (tt * .22 + i * .5) % 1, p = interp(k);
      if (visibleAt(p[0], p[1])) { const [x, y] = proj(p); ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = '#7CF5CF'; ctx.fill(); }
    });
    // cidades
    cities.forEach(([name, lon, lat, n], i) => {
      if (!visibleAt(lon, lat)) return;
      const [x, y] = proj([lon, lat]), r = 2.5 + Math.sqrt(n) * 1.6;
      const ph = ((tt * .6 + i * .13) % 1);
      ctx.beginPath(); ctx.arc(x, y, r + ph * 16, 0, Math.PI * 2); ctx.strokeStyle = `rgba(0,224,164,${.5 * (1 - ph)})`; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#00E0A4'; ctx.shadowColor = 'rgba(0,224,164,.9)'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
      if (name === 'Lisboa' || name === 'São Paulo') {
        ctx.font = '500 11px "Geist Mono", monospace'; ctx.fillStyle = 'rgba(242,244,241,.75)';
        ctx.fillText(name === 'Lisboa' ? 'PORTUGAL' : 'BRASIL', x + 10, y - 8);
      }
    });
    // avatares
    avatarSpots.forEach(([lon, lat, k], i) => {
      if (!visibleAt(lon, lat)) return;
      const im = avatarImgs[k]; if (!im.complete || !im.naturalWidth) return;
      const [x0, y0] = proj([lon, lat]), bob = Math.sin(tt * 1.6 + i) * 3;
      const s = Math.max(22, R * .085), x = x0 + (i % 2 ? -s * .9 : s * .9), y = y0 - s * 1.1 + bob;
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, s / 2 + 2.5, 0, Math.PI * 2); ctx.fillStyle = '#00E0A4'; ctx.shadowColor = 'rgba(0,224,164,.7)'; ctx.shadowBlur = 14; ctx.fill(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, s / 2, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(im, x - s / 2, y - s / 2, s, s); ctx.restore();
    });
  };
  let prev = performance.now();
  const loop = now => {
    const dt = Math.min(64, now - prev); prev = now;
    // gira devagar com Brasil e Portugal de frente e acelera no resto do mundo
    if (!dragging && !reduce) {
      const d = Math.abs(((((-rot[0]) + 30) % 360) + 540) % 360 - 180) / 180;
      rot[0] = (rot[0] + dt * (.006 + .05 * d * d)) % 360;
    }
    if (visible) draw(now);
    requestAnimationFrame(loop);
  };
  stage.addEventListener('pointerdown', e => { if (e.target.closest('a')) return; dragging = true; last = [e.clientX, e.clientY]; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', e => {
    if (!dragging) return;
    rot[0] += (e.clientX - last[0]) * .35; rot[1] = Math.max(-50, Math.min(50, rot[1] - (e.clientY - last[1]) * .25)); last = [e.clientX, e.clientY];
    if (reduce) draw(performance.now());
  });
  const end = () => { dragging = false; };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(stage);
  new ResizeObserver(() => { size(); draw(performance.now()); }).observe(stage);
  size();
  fetch('assets/world-110m.json').then(r => r.json()).then(world => {
    land = topojson.feature(world, world.objects.land);
    borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
    draw(performance.now());
  }).catch(() => {});
  avatarImgs.forEach(im => im.addEventListener('load', () => reduce && draw(performance.now())));
  requestAnimationFrame(loop);
})();
