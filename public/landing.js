/* SevnSoul landing — one scene: room, mascot, speech, orbiting suggestions, banner from above.
 * World units are sprite pixels ("px"); screen = px * scale. Overlays are DOM, positioned from world coords. */
(function () {
  'use strict';
  const { Mascot, ANIMS, merge, headTop, drawPose, AX, AY, FW } = window.SevnSprite;
  const { iconSVG } = window.SevnIcons;
  const { DESTINATIONS, SUGGESTIONS, search } = window.SevnContent;

  const $ = s => document.querySelector(s);
  const scene = $('#scene'), room = $('#room'), say = $('#say'), sayText = $('#sayText'), sayLive = $('#sayLive');
  const orbit = $('#orbit'), form = $('#searchForm'), input = $('#q'), banner = $('#banner'), cord = $('#cord');
  const hydrateIcons = el => el.querySelectorAll('[data-icon]').forEach(n => { n.innerHTML = iconSVG(n.dataset.icon, +(n.dataset.size || 24)); });

  const LINES = {
    greet: 'Selamat datang. Apa yang kamu cari di sini?',
    searching: [
      'Sebentar, aku carikan…',
      'Oke, aku cek dulu ya…',
      'Hmm, coba kulihat dulu…',
      'Tunggu sebentar, lagi kucari…',
      'Siap, aku telusuri dulu…',
      'Sebentar ya, aku intip dulu…',
      'Aku cari di sekitar sini dulu…',
    ],
    found: 'Ketemu!',
    list: 'Ini semua yang ada di sini.',
    missing: q => `Hmm, belum ketemu “${q}”. Mungkin salah satu ini?`,
  };
  // Random pick that never repeats the previous one.
  const lastPick = new Map();
  function pick(list) {
    let i;
    do i = Math.floor(Math.random() * list.length); while (list.length > 1 && i === lastPick.get(list));
    lastPick.set(list, i);
    return list[i];
  }

  // Idle: after this long with no input, the mascot does something small on its own.
  const IDLE_AFTER = 7000;
  const IDLE_ACTS = [['lookL', 'lookR'], ['stretch'], ['wave'], ['crouch']];

  const ROOM_COLOR = '#f4f4f2';
  const TOP_SAFE = 68; // keep floating UI clear of the header row
  const ROOM_SLACK = 160; // px of room drawn below the viewport

  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const st = { scale: 3, W: 0, H: 0, ground: 0, cx: 0, x: 0, walkTo: null, attached: false, banner: 'hidden', token: 0, chips: [], chipMode: 'orbit' };
  const m = new Mascot();
  let reduced = mq.matches;

  // ---------- Layout ----------
  const S = v => v * st.scale;
  function layout() {
    const vw = innerWidth, vh = innerHeight;
    st.scale = vw < 560 ? 3 : vw < 1500 ? 4 : 5;
    // Extra height below the fold so a collapsing mobile URL bar never uncovers the floor.
    st.W = Math.ceil(vw / st.scale); st.H = Math.ceil((vh + ROOM_SLACK) / st.scale);
    st.ground = Math.round(vh / st.scale * 0.6);
    st.ceil = Math.ceil(TOP_SAFE / st.scale);   // ceiling line, just under the header
    scene.style.setProperty('--ceil', `${S(st.ceil + 1)}px`);
    st.cx = Math.round(st.W / 2);
    // Mid-sequence (walking, banner peeking/held) the director owns x; otherwise stay centred.
    if (st.walkTo === null && (st.banner === 'hidden' || st.banner === 'final')) st.x = st.cx;
    room.width = st.W * st.scale; room.height = st.H * st.scale;
    st.roomImg = buildRoom();
    st.roomDirty = true;
    placeForm(); placeSay(); placeChips(false);
    if (st.banner === 'final') placeBannerFinal(false);
  }

  function place(el, x, y) { el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`; }

  function placeForm() { place(form, (innerWidth - form.offsetWidth) / 2, S(st.ground + 12)); }

  function placeSay() {
    const w = say.offsetWidth, h = say.offsetHeight, ax = S(st.x);
    const x = Math.max(16, Math.min(innerWidth - 16 - w, ax - w / 2));
    say.style.setProperty('--tail', `${ax - x}px`);
    place(say, x, S(st.ground - 38) - h - 6);
  }

  // ---------- Room (drawn once per resize, one colour, low alpha) ----------
  function buildRoom() {
    const c = document.createElement('canvas'); c.width = st.W; c.height = st.H;
    const g = c.getContext('2d');
    const W = st.W, H = st.H, cx = st.cx, gy = st.ground;
    const px = (x, y, a) => { g.globalAlpha = a; g.fillRect(x, y, 1, 1); };
    const band = (y, h, a) => { g.globalAlpha = a; g.fillRect(0, y, W, h); };
    // Flat 2D room seen straight on: ceiling, wall, baseboard, floor line, floor, a contact shadow.
    g.fillStyle = ROOM_COLOR;
    const fy = gy;                             // floor surface = the sprite's ground row, right under the shoes
    band(0, st.ceil, 0.03);                    // ceiling
    band(st.ceil, 1, 0.14);                    // ceiling line
    band(st.ceil + 1, fy - 5 - st.ceil, 0.012); // wall
    band(fy - 4, 4, 0.03);                     // baseboard
    band(fy, 1, 0.14);                         // floor line
    band(fy + 1, H - fy - 1, 0.022);           // floor
    for (let y = -1; y <= 1; y++) for (let x = -14; x <= 14; x++) {
      if ((x * x) / 196 + (y * y) / 2.2 <= 1) px(cx + x, gy + y + 1, 0.035);
    }
    return c;
  }

  // ---------- Speech ----------
  let typeTimer = 0;
  function speak(text, t) {
    clearInterval(typeTimer);
    sayLive.textContent = text;
    say.style.width = '';
    say.classList.add('is-in');
    if (reduced) { sayText.textContent = text; placeSay(); return Promise.resolve(); }
    // Measure the full line first so the bubble does not grow while typing.
    sayText.textContent = text; placeSay();
    say.style.width = say.offsetWidth + 'px';
    let i = 0;
    sayText.innerHTML = '<span class="caret"></span>';
    return new Promise(res => {
      typeTimer = setInterval(() => {
        if (t !== st.token) { clearInterval(typeTimer); return res(); }
        i = Math.min(text.length, i + 1);
        sayText.textContent = text.slice(0, i);
        if (i < text.length) sayText.insertAdjacentHTML('beforeend', '<span class="caret"></span>');
        else { clearInterval(typeTimer); res(); }
      }, 34);
    });
  }
  function hush() { clearInterval(typeTimer); say.classList.remove('is-in'); say.style.width = ''; }

  // ---------- Orbiting suggestions ----------
  // Even angles from left (180°) over the top to right (0°) on an ellipse around the head,
  // then a few relaxation passes push apart any bubbles that overlap each other or the mascot.
  function orbitPositions(sizes) {
    const n = sizes.length, ax = S(st.x), ay = S(st.ground - 20);
    const maxW = Math.max(...sizes.map(s => s.w));
    const rx = Math.max(maxW / 2 + S(13), Math.min(innerWidth / 2 - maxW / 2 - 12, S(58)));
    const ry = S(24) + 18;
    const pos = sizes.map((s, i) => {
      const a = (n === 1 ? 90 : 180 - (180 * i) / (n - 1)) * Math.PI / 180;
      return { x: ax + rx * Math.cos(a) - s.w / 2, y: ay - ry * Math.sin(a) - s.h / 2, w: s.w, h: s.h };
    });
    // Obstacles: the mascot, plus the speech bubble while it is visible.
    const blocks = [{ x: ax - S(13), y: S(st.ground - 36), w: S(26), h: S(36) }];
    if (say.classList.contains('is-in')) {
      const r = say.getBoundingClientRect();
      blocks.push({ x: r.left, y: r.top, w: r.width, h: r.height + 8 });
    }
    const hit = (a, b, pad) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
    for (let pass = 0; pass < 40; pass++) {
      let moved = false;
      for (let i = 0; i < n; i++) {
        const p = pos[i];
        if (blocks.some(b => hit(p, b, 6))) { p.y -= 6; moved = true; }
        for (let j = i + 1; j < n; j++) {
          const q = pos[j];
          if (!hit(p, q, 8)) continue;
          const upper = p.y <= q.y ? p : q;
          upper.y -= 6; moved = true;
        }
        p.x = Math.max(12, Math.min(innerWidth - 12 - p.w, p.x));
        p.y = Math.max(TOP_SAFE, p.y);
      }
      if (!moved) break;
    }
    return pos;
  }

  // Docked: the same bubbles in centred rows under the search field, so another
  // destination is one tap away while a result is showing.
  function dockPositions(sizes) {
    const gap = 8, maxW = innerWidth - 32;
    const rows = [[]];
    let rowW = 0;
    sizes.forEach((s, i) => {
      const add = (rows[rows.length - 1].length ? gap : 0) + s.w;
      if (rowW + add > maxW && rows[rows.length - 1].length) { rows.push([]); rowW = 0; }
      rowW += (rows[rows.length - 1].length ? gap : 0) + s.w;
      rows[rows.length - 1].push(i);
    });
    const pos = [];
    let y = S(st.ground + 12) + form.offsetHeight + 16;
    rows.forEach(r => {
      const w = r.reduce((a, i) => a + sizes[i].w, 0) + gap * (r.length - 1);
      let x = (innerWidth - w) / 2;
      const h = Math.max(...r.map(i => sizes[i].h));
      r.forEach(i => { pos[i] = { x, y }; x += sizes[i].w + gap; });
      y += h + gap;
    });
    return pos;
  }

  // Move existing bubbles between the orbit and the dock (they glide, they are not rebuilt).
  function setChipMode(mode) {
    if (st.chipMode === mode && st.chips.length) return;
    st.chipMode = mode;
    if (!st.chips.length) { showChips(SUGGESTIONS); return; }
    st.chips.forEach(b => b.classList.add('glide'));
    placeChips(false);
    setTimeout(() => st.chips.forEach(b => b.classList.remove('glide')), reduced ? 0 : 520);
  }
  function markCurrent(id) {
    st.chips.forEach(b => {
      const on = b.dataset.id === id;
      b.classList.toggle('is-current', on);
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }

  function showChips(list) {
    hideChips(true);
    st.chips = list.map(d => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'bubble float'; b.dataset.id = d.id;
      b.innerHTML = `<span class="ico" data-icon="${d.icon}" data-size="24"></span><span>${d.chip}</span>`;
      b.addEventListener('click', () => { input.value = d.chip; runSearch(d.keywords[0], d.chip); });
      orbit.appendChild(b);
      return b;
    });
    hydrateIcons(orbit);
    placeChips(true);
  }
  function placeChips(animateIn) {
    if (!st.chips.length) return;
    const sizes = st.chips.map(b => ({ w: b.offsetWidth, h: b.offsetHeight }));
    const pos = st.chipMode === 'dock' ? dockPositions(sizes) : orbitPositions(sizes);
    st.chips.forEach((b, i) => {
      place(b, pos[i].x, pos[i].y);
      if (animateIn) setTimeout(() => b.classList.add('is-in'), reduced ? 0 : 90 * i);
    });
  }
  function hideChips(now) {
    const old = st.chips; st.chips = [];
    old.forEach(b => { b.classList.remove('is-in'); b.tabIndex = -1; setTimeout(() => b.remove(), now || reduced ? 0 : 260); });
  }

  // ---------- Banner ----------
  // The banner rides just above the hair; short ropes (sprite fx) link it to the hands.
  const holdY = p => headTop(p) - 2;
  const CJ = ANIMS.ceilingJump.frames;
  const APEX = merge(CJ.find(f => f.ev === 'grab'));
  const isCJ = ev => (type, name, i) => type === 'frame' && name === 'ceilingJump' && CJ[i].ev === ev;
  // Height that brings the top of the hair right under the ceiling line. The chibi head is taller
  // than the raised hands, so the hair is what reaches the ceiling first; the banner (held at
  // holdY = hair − 2) then sits exactly on the ceiling line at the grab frame.
  const jumpHeight = () => st.ground + holdY(Object.assign({}, APEX, { air: 0 })) - (st.ceil + 1);
  // Air for the current ceilingJump frame: decelerate on the way up, hang, accelerate down.
  function jumpAir() {
    const f = m.frame, H = jumpHeight(), u = Math.min(1, m.t / f.d);
    if (f.phase === 'rise') return -H * (1 - (1 - u) * (1 - u));
    if (f.phase === 'apex') return -H;
    if (f.phase === 'fall') return -H * (1 - u * u);
    return null;
  }
  function fillBanner(d, alts) {
    banner.classList.remove('is-list');
    $('#bannerIcon').innerHTML = iconSVG(d.icon, 24);
    $('#bannerTitle').textContent = d.title;
    $('#bannerDesc').textContent = d.desc;
    const badge = $('#bannerBadge');
    const status = d.tbd ? 'Segera' : d.status || '';
    badge.textContent = status;
    badge.hidden = !status;
    badge.classList.toggle('is-soon', !!d.tbd);
    const cta = $('#bannerCta');
    cta.removeAttribute('target'); cta.removeAttribute('rel');
    cta.classList.toggle('is-disabled', !!d.tbd);
    if (d.tbd) {
      // No confirmed URL yet: show the state instead of a link that goes nowhere.
      cta.removeAttribute('href');
      cta.setAttribute('aria-disabled', 'true');
      cta.textContent = 'Segera hadir';
    } else {
      cta.href = d.url;
      cta.removeAttribute('aria-disabled');
      cta.innerHTML = `${d.cta}<span data-icon="${d.external ? 'external' : 'arrowRight'}" data-size="24"></span>`;
      if (d.external) { cta.target = '_blank'; cta.rel = 'noopener'; }
    }
    const altBox = $('#bannerAlts');
    altBox.innerHTML = alts.length ? 'Atau mungkin:' : '';
    alts.forEach(a => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = a.chip || a.title;
      b.addEventListener('click', () => { input.value = b.textContent; runSearch(a.keywords[0], b.textContent); });
      altBox.appendChild(b);
    });
    hydrateIcons(banner);
  }
  // "Daftar": the same banner, but its body is a list of every destination.
  function fillList(all) {
    banner.classList.add('is-list');
    $('#bannerIcon').innerHTML = iconSVG('grid', 24);
    $('#bannerTitle').textContent = 'Semua di Sevnsoul';
    const badge = $('#bannerBadge');
    badge.textContent = `${all.length} item`;
    badge.hidden = false;
    badge.classList.remove('is-soon');
    // Live products first; entries without a confirmed URL are listed but not linked.
    const sorted = all.filter(d => !d.tbd).concat(all.filter(d => d.tbd));
    $('#bannerList').innerHTML = sorted.map(d => {
      const body = `
        <span class="row-icon" data-icon="${d.icon}" data-size="24"></span>
        <span class="row-text"><strong>${d.title}</strong><span>${d.desc}</span></span>`;
      return d.tbd
        ? `<li><div class="row is-soon">${body}<span class="badge is-soon">Segera</span></div></li>`
        : `<li><a class="row" href="${d.url}"${d.external ? ' target="_blank" rel="noopener"' : ''}>${body}
            <span class="row-arrow" data-icon="${d.external ? 'external' : 'arrowRight'}" data-size="24"></span></a></li>`;
    }).join('');
    hydrateIcons(banner);
  }
  // Positions the banner so its bottom edge is centred on (screenX, screenBottom).
  function bannerAt(x, bottom, animate, free) {
    banner.classList.toggle('is-moving', !!animate && !reduced);
    const w = banner.offsetWidth, h = banner.offsetHeight;
    place(banner, Math.max(16, Math.min(innerWidth - 16 - w, x - w / 2)), free ? bottom - h : Math.max(S(st.ceil + 1) + 6, bottom - h));
  }
  function placeBannerFinal(animate) { bannerAt(innerWidth / 2, S(st.ground - 40), animate); }
  // Fully above the viewport (bannerAt clamps to the screen, so place it directly).
  function bannerOffTop(x, animate) {
    banner.classList.toggle('is-moving', !!animate && !reduced);
    const w = banner.offsetWidth, h = banner.offsetHeight;
    place(banner, Math.max(16, Math.min(innerWidth - 16 - w, x - w / 2)), -h - 40);
  }

  async function retractBanner(t) {
    if (st.banner === 'hidden') return;
    st.attached = false;
    bannerOffTop(innerWidth / 2, true);
    st.banner = 'hidden';
    await sleep(reduced ? 0 : 420, t);
    banner.hidden = true;
  }

  // ---------- Timing helpers (cancel when a newer search starts) ----------
  const CANCEL = Symbol('cancel');
  const sleep = (ms, t) => new Promise((res, rej) => setTimeout(() => (t === st.token ? res() : rej(CANCEL)), ms));
  const untilEvent = (pred, t) => new Promise((res, rej) => {
    const h = (type, name, i) => {
      if (t !== st.token) { off(); rej(CANCEL); } else if (pred(type, name, i)) { off(); res(); }
    };
    const off = () => { listeners.delete(h); };
    listeners.add(h);
  });
  const listeners = new Set();
  m.on((type, name, i) => listeners.forEach(fn => fn(type, name, i)));

  // Faster cadence instead of longer strides keeps the feet planted (vx stays 1px/frame).
  // Short trips are walked, long ones are run (run moves 2 px per frame, so feet stay planted too).
  const WALK_CADENCE = 1.8, RUN_CADENCE = 1.5, RUN_FROM = 45;
  function walkTo(x, t) {
    if (reduced || x === st.x) { st.x = x; return Promise.resolve(); }
    const run = Math.abs(x - st.x) >= RUN_FROM;
    m.facing = x > st.x ? 1 : -1;
    st.walkTo = x;
    m.speed = run ? RUN_CADENCE : WALK_CADENCE;
    m.play(run ? 'run' : 'walk');
    return untilEvent(type => type === 'arrived', t);
  }

  // ---------- Ceiling spot + pull cord ----------
  // Each banner hangs somewhere different above the ceiling: left or right of centre, never the
  // same side twice in a row, far enough to need a few steps, close enough to stay on screen.
  let lastSide = 0;
  function chooseSpot() {
    const maxOff = Math.max(20, Math.min(90, (st.W >> 1) - 24));
    const minOff = Math.min(30, maxOff);
    const side = lastSide ? -lastSide : (Math.random() < 0.5 ? -1 : 1);
    lastSide = side;
    return st.cx + side * Math.round(minOff + Math.random() * (maxOff - minOff));
  }
  // A short cord drops out of the ceiling where the banner is: the only hint of where to go.
  function dropCord(x) {
    place(cord, S(x) - 4, S(st.ceil + 1));
    cord.getBoundingClientRect();
    cord.classList.add('is-down');
  }
  const liftCord = () => cord.classList.remove('is-down');

  // ---------- Search flow ----------
  // How long the mascot "thinks" before answering, in ms (PRD: 1–3 s).
  function searchDuration(result) {
    // TODO(human): decide how long the searching animation runs for this result.
    return 1600;
  }

  async function runSearch(query, shown) {
    const result = search(query);
    if (!result) { input.focus(); return; }
    const t = ++st.token;
    const label = shown || result.query;
    try {
      setChipMode('dock');
      markCurrent(null);
      liftCord();
      await retractBanner(t);
      await walkTo(st.cx, t);
      m.facing = 1;
      speak(pick(LINES.searching), t);
      m.play('search');
      await sleep(Math.max(1000, Math.min(3000, searchDuration(result))) * (reduced ? 0.4 : 1), t);

      if (!result.best && !result.all) {
        m.play('sad');
        await speak(LINES.missing(label), t);
        setChipMode('orbit');
        return;
      }

      m.play('idle');
      speak(result.all ? LINES.list : LINES.found, t);
      markCurrent(result.all ? 'all' : result.best.id);
      if (result.all) fillList(DESTINATIONS);
      else fillBanner(result.best, result.alternatives.slice(0, 2));
      banner.classList.add('is-compact');
      banner.style.visibility = ''; banner.style.transition = '';
      banner.hidden = false;

      if (reduced) {
        banner.classList.remove('is-compact');
        st.banner = 'final'; placeBannerFinal(false);
        await sleep(600, t); hush();
        return;
      }

      // The banner waits above the ceiling, out of sight. The mascot jumps all the way up,
      // grabs it at the ceiling, and drags it down through the ceiling line on the way back.
      bannerOffTop(S(st.x), false);
      banner.style.visibility = 'hidden';
      const spot = chooseSpot();
      dropCord(spot);
      m.facing = spot > st.x ? 1 : -1;  // look towards the cord before setting off
      await sleep(600, t);
      hush();
      await walkTo(spot, t);
      m.play('ceilingJump');
      // Listen for every milestone up front: on a slow frame several can fire in one update,
      // and a listener added after the event would wait forever.
      const grabbed = untilEvent(isCJ('grab'), t), released = untilEvent(isCJ('release'), t);
      const ended = untilEvent((type, name) => type === 'end' && name === 'ceilingJump', t);
      [released, ended].forEach(p => p.catch(() => {})); // cancelled early → no unhandled rejection
      await grabbed;
      liftCord();
      st.banner = 'held';
      st.attached = true;               // from here the banner rides the hands, clipped at the ceiling
      banner.style.visibility = '';
      await released;
      st.attached = false;
      banner.classList.remove('is-compact');
      st.banner = 'final';
      placeBannerFinal(true);
      await ended;
      await walkTo(st.cx, t);
      m.facing = 1;
    } catch (e) {
      if (e !== CANCEL) throw e;
    }
  }

  // ---------- Intro ----------
  async function intro() {
    const t = st.token;
    try {
      scene.classList.add('is-lit');
      await sleep(reduced ? 0 : 500, t);
      m.play('bow');
      await sleep(reduced ? 0 : 260, t);
      await speak(LINES.greet, t);
      await sleep(reduced ? 0 : 450, t);
      form.classList.add('is-in');
      scene.classList.add('is-ready');
      // Let the line be read, then the speech bubble gives its space to the suggestions.
      await sleep(reduced ? 0 : 1100, t);
      hush();
      await sleep(reduced ? 0 : 180, t);
      showChips(SUGGESTIONS);
    } catch (e) {
      if (e !== CANCEL) throw e;
    }
  }

  // ---------- Idle ----------
  // Only while the scene is at rest: intro finished, mascot standing in plain idle, nothing
  // carried or walked to. Any input resets the clock, and so does anything the mascot is busy
  // with (searching, jumping, a previous idle act), so the 7 s count starts once it is still.
  let lastInput = performance.now();
  const poke = () => { lastInput = performance.now(); };
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'focusin'].forEach(e => addEventListener(e, poke, { passive: true }));
  function atRest() {
    return scene.classList.contains('is-ready') && m.name === 'idle' && st.walkTo === null && !st.attached
      && st.banner !== 'held' && !document.hidden;
  }
  function idleCheck(now) {
    if (!atRest()) { lastInput = Math.max(lastInput, now); return; }
    if (now - lastInput < IDLE_AFTER) return;
    lastInput = now;  // the next idle act comes after another quiet stretch
    const [first, ...rest] = pick(IDLE_ACTS);
    m.facing = 1;
    m.play(first, rest);
  }

  // ---------- Rendering ----------
  // The room is static, so only the mascot's box is repainted, and only when its pose,
  // position or blink actually changed. Idle breathing repaints ~4 times a second, not 60.
  let lastKey = '', lastBox = null;
  function mascotBox(p) {
    const top = st.ground - AY + Math.min(0, p.air) - 8;       // fx (dots, "!") sit above the frame
    return [st.x - AX - 3, top, FW + 6, st.ground + 4 - top];   // + shadow under the feet
  }
  function restore(g, [x, y, w, h]) {
    x = Math.max(0, x); y = Math.max(0, y);
    w = Math.min(st.W - x, w); h = Math.min(st.H - y, h);
    if (w <= 0 || h <= 0) return;
    g.clearRect(x, y, w, h);
    g.drawImage(st.roomImg, x, y, w, h, x, y, w, h);
  }
  function render() {
    const p = m.pose();
    const key = `${st.x}|${m.facing}|${m.name}|${m.i}|${p.eyes}|${p.air}`;
    if (key === lastKey && !st.roomDirty) return p;
    const g = room.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.setTransform(st.scale, 0, 0, st.scale, 0, 0);
    const box = mascotBox(p);
    if (st.roomDirty || !lastBox) { g.clearRect(0, 0, st.W, st.H); g.drawImage(st.roomImg, 0, 0); st.roomDirty = false; }
    else { restore(g, lastBox); restore(g, box); }
    drawPose(g, p, st.x, st.ground, m.facing < 0);
    lastKey = key; lastBox = box;
    return p;
  }

  // ---------- Loop ----------
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(1000, now - last); last = now;
    const moved = m.update(dt);
    if (st.walkTo !== null) {
      st.x += moved;
      if ((m.facing > 0 && st.x >= st.walkTo) || (m.facing < 0 && st.x <= st.walkTo)) {
        st.x = st.walkTo; st.walkTo = null;
        m.speed = 1;
        m.play('idle');
        listeners.forEach(fn => fn('arrived'));
      }
    }
    m.airOverride = m.name === 'ceilingJump' ? jumpAir() : null;
    idleCheck(now);
    const p = render();
    if (st.attached) bannerAt(S(st.x), S(st.ground + holdY(p)), false, true);
    requestAnimationFrame(tick);
  }

  // ---------- Motion preference ----------
  function setReduced(v) {
    reduced = v; m.reduced = v;
    document.documentElement.dataset.motion = v ? 'reduced' : 'full';
    const btn = $('#motionToggle');
    btn.setAttribute('aria-pressed', String(v));
    btn.querySelector('[data-icon]').dataset.icon = v ? 'play' : 'pause';
    btn.querySelector('.sr-only').textContent = v ? 'Gerak penuh' : 'Kurangi gerak';
    hydrateIcons(btn);
  }

  form.addEventListener('submit', e => { e.preventDefault(); runSearch(input.value); });
  $('#motionToggle').addEventListener('click', () => setReduced(!reduced));
  mq.addEventListener('change', e => setReduced(e.matches));
  // Phones change height constantly (URL bar, keyboard). Only rebuild the scene for a real
  // change: a new width, or a big height change while not typing.
  let lastVW = innerWidth, lastVH = innerHeight;
  addEventListener('resize', () => {
    const typing = document.activeElement === input;
    if (innerWidth === lastVW && (typing || Math.abs(innerHeight - lastVH) < 120)) return keyboardShift();
    lastVW = innerWidth; lastVH = innerHeight;
    layout(); keyboardShift();
  });
  // Keep the search field above the on-screen keyboard by sliding the whole scene up.
  const vv = window.visualViewport;
  function keyboardShift() {
    let shift = 0;
    if (vv && document.activeElement === input) {
      const visibleBottom = Math.min(innerHeight, vv.height + vv.offsetTop);
      const formBottom = S(st.ground + 12) + form.offsetHeight + 12;
      shift = Math.max(0, formBottom - visibleBottom);
    }
    scene.style.transform = shift ? `translateY(${-shift}px)` : '';
  }
  if (vv) vv.addEventListener('resize', keyboardShift);
  input.addEventListener('focus', () => setTimeout(keyboardShift, 300));
  input.addEventListener('blur', keyboardShift);

  hydrateIcons(document.body);
  $('#year').textContent = new Date().getFullYear();
  setReduced(reduced);
  layout();
  requestAnimationFrame(tick);
  // Wait for the web fonts so the bubbles measure correctly, but never more than 1.2 s on a slow network.
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 1200))])
    .then(() => { placeForm(); intro(); });
  if (document.fonts) document.fonts.addEventListener('loadingdone', () => { placeForm(); placeChips(false); });
})();
