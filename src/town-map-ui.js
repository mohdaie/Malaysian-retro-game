import { mapView, project, unproject, clampView, zoomView, routeLength } from './map-navigation.js?v=2.1.0';

export function createTownMap({ buildings, districts, roads, bridges, getEntries, getPlayer, getQuest, getJobs, getNavigation, planRoute, onNavigate, onClose }) {
  const $ = id => document.getElementById(id), canvas = $('town-map'), ctx = canvas.getContext('2d');
  let view = mapView(600, 400), entries = [], selected = null, preview = null, open = false, hits = [];
  const pointers = new Map(); let multi = false, frame = 0;
  const colors = new Map(districts.map(d => [d.id, d.color]));
  const filtered = () => {
    const q = $('map-search').value.trim().toLocaleLowerCase(), kind = $('map-filter').value;
    return entries.filter(e => (kind === 'all' || e.tags.includes(kind)) && `${e.name} ${e.subtitle} ${e.search}`.toLocaleLowerCase().includes(q));
  };
  function resize() {
    if (!open) return;
    const r = canvas.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    view = clampView(mapView(r.width, r.height, view.zoom, view.x, view.z));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  }
  const invalidate = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; if (open) draw(); }); };
  function renderList() {
    const list = $('map-results'); list.replaceChildren(); const rows = filtered(), p = getPlayer();
    $('map-result-count').textContent = `${rows.length} lokasi · pilih untuk lihat jalan`;
    for (const e of rows) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'map-result'; button.dataset.mapEntry = e.id;
      button.setAttribute('aria-pressed', String(selected?.id === e.id));
      const badge = document.createElement('span'); badge.className = 'map-result-badge'; badge.textContent = e.badge; badge.style.background = e.color;
      const text = document.createElement('span'), title = document.createElement('b'), subtitle = document.createElement('small');
      title.textContent = e.name; subtitle.textContent = `${e.subtitle} · ${Math.round(Math.hypot(e.x - p.x, e.z - p.z))} m dari sini`;
      text.append(title, subtitle); button.append(badge, text); button.onclick = () => select(e); list.append(button);
    }
    if (!rows.length) { const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'Tak jumpa. Cuba nama kedai, NPC atau permainan.'; list.append(p); }
    invalidate();
  }
  function select(entry) {
    if ($('map-browser').hidden) toggleBrowser();
    selected = entry; preview = planRoute(entry);
    const panel = $('map-destination'); panel.hidden = false;
    $('map-selected-name').textContent = entry.name;
    $('map-selected-info').textContent = `${entry.subtitle} · ${preview ? `${Math.round(routeLength(preview))} m berjalan` : 'Laluan belum ditemui'}`;
    $('map-navigate').disabled = !preview; $('map-navigate').textContent = preview && routeLength(preview) < 2.6 ? 'Dah dekat · kembali ke game →' : 'Tunjuk jalan →';
    view = clampView(mapView(view.width, view.height, Math.max(2.2, view.zoom), entry.mapX, entry.mapZ));
    renderList();
  }
  function draw() {
    const w = view.width, h = view.height, p = getPlayer(), show = new Set(filtered().map(e => e.place));
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#edf0dc'; ctx.fillRect(0, 0, w, h);
    const rect = (x, z, rw, rh, color, stroke) => {
      const a = project(view, { x: x - rw / 2, z: z - rh / 2 }); ctx.fillStyle = color;
      ctx.fillRect(a.x, a.y, rw * view.scale, rh * view.scale);
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.strokeRect(a.x, a.y, rw * view.scale, rh * view.scale); }
    };
    for (const b of buildings) rect(b.x, b.z, b.w + 4, b.d + 4, colors.get(b.zone) + '16');
    rect(-65, 0, 10.5, 140, '#96c5cb');
    for (const r of roads) rect(r.x, r.z, r.w, r.d, r.kind === 'asphalt' ? '#bbc1b4' : '#d5c5a5');
    for (const b of bridges) rect(b.x, b.z, b.w, b.d, '#ead8b4', '#8b795a');
    for (const b of buildings) { ctx.globalAlpha = show.has(b.id) ? 1 : .3; rect(b.x, b.z, b.w, b.d, colors.get(b.zone) + 'a8', '#485747'); } ctx.globalAlpha = 1;
    const route = preview || getNavigation()?.route;
    if (route?.length) {
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); route.forEach((point, i) => { const a = project(view, point); i ? ctx.lineTo(a.x, a.y) : ctx.moveTo(a.x, a.y); });
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.stroke(); ctx.strokeStyle = '#175fd0'; ctx.lineWidth = 4; ctx.stroke();
    }
    hits = []; const labels = [], occupied = [];
    const pin = (e, special = false) => {
      const a = project(view, { x: e.mapX, z: e.mapZ }); if (a.x < -24 || a.y < -24 || a.x > w + 24 || a.y > h + 24) return;
      const active = selected?.id === e.id, r = active ? 16 : special ? 13 : 11;
      ctx.beginPath(); ctx.arc(a.x, a.y, r, 0, Math.PI * 2); ctx.fillStyle = active ? '#f4c94d' : special ? e.color : '#fffdf4'; ctx.fill();
      ctx.strokeStyle = '#253e37'; ctx.lineWidth = active ? 3 : 1.5; ctx.stroke(); ctx.fillStyle = special && !active ? '#fff' : '#253e37';
      ctx.font = `800 ${special ? 12 : 11}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e.badge, a.x, a.y + .5);
      hits.push({ entry: e, x: a.x, y: a.y });
      if (active || view.zoom >= 2.5 || [2, 21, 22, 25, 29, 31, 34, 35, 37, 38].includes(e.place)) labels.push({ e, a, active, r });
    };
    // Overview highlights landmarks; zoom reveals every house/shop number.
    // Every building footprint can still be tapped at any zoom level.
    for (const e of entries.filter(e => e.type === 'place' && (show.has(e.place) || selected?.id === e.id))) {
      if (view.zoom >= 2 || selected?.id === e.id || [2,21,22,25,29,31,34,35,37,38].includes(e.place)) pin(e);
    }
    if (selected?.type === 'npc') pin(selected, true);
    // Labels stay at phone-readable text size; omit overlapping background labels.
    const labelPriority=[25,34,2,37,31,29,21,35,38,22];
    labels.sort((a,b)=>Number(b.active)-Number(a.active)||(labelPriority.indexOf(a.e.place)<0?99:labelPriority.indexOf(a.e.place))-(labelPriority.indexOf(b.e.place)<0?99:labelPriority.indexOf(b.e.place)));
    ctx.font = '700 12px system-ui';
    for (const { e, a, active, r } of labels) {
      const text = e.short || e.name, width = ctx.measureText(text).width + 12;
      const box = { x: Math.max(4, Math.min(w - width - 4, a.x - width / 2)), y: a.y - r - 23, w: width, h: 20 };
      if (box.y < 2 || (!active && occupied.some(b => box.x < b.x + b.w && box.x + box.w > b.x && box.y < b.y + b.h && box.y + box.h > b.y))) continue;
      occupied.push(box); ctx.fillStyle = active ? '#f4c94d' : '#fffdf3ed'; ctx.fillRect(box.x, box.y, width, 20);
      ctx.fillStyle = '#253e37'; ctx.textAlign = 'center'; ctx.fillText(text, box.x + width / 2, box.y + 10);
    }
    for (const stop of getJobs()) { const a = project(view, stop); ctx.fillStyle = '#d88323'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.fillRect(a.x - 5, a.y - 5, 10, 10); ctx.strokeRect(a.x - 5, a.y - 5, 10, 10); }
    const quest = getQuest(); if (quest) { const a = project(view, quest); ctx.fillStyle = '#e6b931'; ctx.strokeStyle = '#684f1c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(a.x, a.y - 8); ctx.lineTo(a.x + 7, a.y); ctx.lineTo(a.x, a.y + 8); ctx.lineTo(a.x - 7, a.y); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    const a = project(view, p); ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(-p.heading); ctx.fillStyle = '#175fd0'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(-8, -7); ctx.lineTo(0, -3); ctx.lineTo(8, -7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.font = '800 12px system-ui'; ctx.fillStyle = '#253e37'; ctx.textAlign = 'center'; ctx.fillText('AKU', a.x, a.y + 24);
    $('map-zoom-level').textContent = `${Math.round(view.zoom * 100)}%`;
    $('map-zoom-out').disabled = view.zoom <= 1; $('map-zoom-in').disabled = view.zoom >= 6;
  }
  function local(event) { const r = canvas.getBoundingClientRect(); return { x: event.clientX - r.left, y: event.clientY - r.top }; }
  canvas.addEventListener('pointerdown', event => {
    if (!open || event.button > 0) return;
    const p = local(event); canvas.setPointerCapture(event.pointerId); pointers.set(event.pointerId, { ...p, startX: p.x, startY: p.y, moved: false });
    if (pointers.size > 1) { multi = true; for (const p of pointers.values()) p.moved = true; }
  });
  canvas.addEventListener('pointermove', event => {
    const old = pointers.get(event.pointerId); if (!old) return; const now = local(event);
    if (Math.hypot(now.x - old.startX, now.y - old.startY) > 7) old.moved = true;
    if (pointers.size === 2) {
      const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)[1];
      const d0 = Math.hypot(old.x - other.x, old.y - other.y), d1 = Math.hypot(now.x - other.x, now.y - other.y);
      const midpoint = { x: (old.x + other.x) / 2, y: (old.y + other.y) / 2 };
      view = zoomView(view, view.zoom * d1 / Math.max(1, d0), midpoint);
      view = clampView({ ...view, x: view.x - (now.x - old.x) / view.scale / 2, z: view.z - (now.y - old.y) / view.scale / 2 });
    } else if (old.moved) view = clampView({ ...view, x: view.x - (now.x - old.x) / view.scale, z: view.z - (now.y - old.y) / view.scale });
    pointers.set(event.pointerId, { ...old, ...now }); invalidate();
  });
  function release(event) {
    const p = pointers.get(event.pointerId); if (!p) return;
    if (event.type === 'pointerup' && !p.moved && !multi) {
      const a = local(event), hit = hits.map(h => ({ ...h, distance: Math.hypot(a.x - h.x, a.y - h.y) })).sort((a, b) => a.distance - b.distance)[0];
      const ground=unproject(view,a),building=buildings.find(b=>Math.abs(ground.x-b.x)<=b.w/2&&Math.abs(ground.z-b.z)<=b.d/2);
      if(hit?.distance<=14)select(hit.entry);
      else if(building)select(entries.find(e=>e.type==='place'&&e.place===building.id));
      else if(hit?.distance<=24)select(hit.entry);
    }
    pointers.delete(event.pointerId); if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (!pointers.size) multi = false;
  }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, release);
  canvas.addEventListener('wheel', event => { if (!open) return; event.preventDefault(); view = zoomView(view, view.zoom * Math.exp(-event.deltaY * .002), local(event)); invalidate(); }, { passive: false });
  canvas.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-'].includes(event.key)) {
      event.preventDefault(); event.stopPropagation();
      if (['+', '=', '-'].includes(event.key)) view = zoomView(view, view.zoom * (event.key === '-' ? .75 : 1.33));
      else view = clampView({ ...view, x: view.x + (event.key === 'ArrowRight' ? 40 : event.key === 'ArrowLeft' ? -40 : 0) / view.scale, z: view.z + (event.key === 'ArrowDown' ? 40 : event.key === 'ArrowUp' ? -40 : 0) / view.scale });
      invalidate();
    }
  });
  function toggleBrowser(){const hidden=!$('map-browser').hidden;$('map-browser').hidden=hidden;$('map-panel').querySelector('.map-modal').classList.toggle('map-wide',hidden);$('map-browse-toggle').setAttribute('aria-expanded',String(!hidden));}
  $('map-browse-toggle').onclick=toggleBrowser;
  $('map-zoom-in').onclick = () => { view = zoomView(view, view.zoom * 1.4); invalidate(); };
  $('map-zoom-out').onclick = () => { view = zoomView(view, view.zoom / 1.4); invalidate(); };
  $('map-fit').onclick = () => { view = mapView(view.width, view.height); invalidate(); };
  $('map-me').onclick = () => { const p = getPlayer(); view = clampView(mapView(view.width, view.height, 3, p.x, p.z)); invalidate(); };
  $('map-quest').onclick = () => { const q = getQuest(); if (!q) return; const e = entries.find(e => e.type === 'npc' && Math.hypot(e.x - q.x, e.z - q.z) < 1) || entries.filter(e => e.type === 'place').sort((a, b) => Math.hypot(a.x - q.x, a.z - q.z) - Math.hypot(b.x - q.x, b.z - q.z))[0]; if (e) select(e); };
  $('map-jobs').onclick = () => { $('map-filter').value = 'jobs'; $('map-search').value = ''; renderList(); };
  $('map-search').oninput = renderList; $('map-filter').onchange = renderList;
  $('map-navigate').onclick = () => { if (selected && preview) { onNavigate(selected, preview); hide(); onClose(); } };
  $('map-close').onclick = () => { hide(); onClose(); };
  // Trap focus in the map. Escape also works while typing in search.
  $('map-panel').addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); $('map-close').click(); }
    if (event.key !== 'Tab') return;
    const items = [...$('map-panel').querySelectorAll('button,input,select,[tabindex="0"]')].filter(e => !e.disabled && e.getClientRects().length);
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  function hide() { open = false; $('map-panel').hidden = true; pointers.clear(); multi = false; }
  new ResizeObserver(resize).observe(canvas);
  return {
    open() {
      entries = getEntries(); open = true; if ($('map-browser').hidden) toggleBrowser(); $('map-panel').hidden = false; $('map-search').value = ''; $('map-filter').value = 'all';
      const nav = getNavigation(); selected = nav ? entries.find(e => e.id === nav.entry.id) : null; preview = nav?.route || null;
      $('map-destination').hidden = true; $('map-quest').disabled = !getQuest(); $('map-jobs').disabled = !getJobs().length;
      view = mapView(view.width, view.height); renderList(); resize(); if (selected) select(selected); $('map-close').focus();
    },
    close: hide,
    snapshot: () => ({ open, zoom: view.zoom, center: { x: view.x, z: view.z }, selected: selected?.id || null, results: filtered().map(e => e.id), route: preview ? preview.map(p => ({ ...p })) : null })
  };
}
