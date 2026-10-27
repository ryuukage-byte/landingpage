(function () {
  'use strict';
  const { Mascot, ANIMS, LABELS, FW, FH, merge, renderFrame } = window.SevnSprite;
  const { iconSVG, ICON_NAMES } = window.SevnIcons;

  const $ = (s, el) => (el || document).querySelector(s);
  const h = (tag, attrs, html) => {
    const el = document.createElement(tag);
    for (const k in attrs || {}) el.setAttribute(k, attrs[k]);
    if (html != null) el.innerHTML = html;
    return el;
  };
  const hydrateIcons = rootEl => (rootEl || document).querySelectorAll('[data-icon]').forEach(el => {
    el.innerHTML = iconSVG(el.dataset.icon, +(el.dataset.size || 24));
  });

  // ---------- Motion preference ----------
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = mq.matches;
  const mascots = [];
  function setReduced(v) {
    reduced = v;
    document.documentElement.dataset.motion = v ? 'reduced' : 'full';
    for (const m of mascots) { m.reduced = v; m.play(m.name === 'walk' || m.name === 'run' ? 'idle' : m.name); }
    const btn = $('#motionToggle');
    btn.setAttribute('aria-pressed', String(v));
    $('[data-icon]', btn).dataset.icon = v ? 'play' : 'pause';
    $('.label', btn).textContent = v ? 'Gerak dikurangi' : 'Gerak penuh';
    hydrateIcons(btn);
  }

  // ---------- Stage ----------
  const STAGE_W = 160, STAGE_H = 64, GROUND = 56;
  const stage = { cv: $('#stage'), m: new Mascot(), x: 80, grid: false, scale: 4 };
  mascots.push(stage.m);

  function fitStage() {
    const w = stage.cv.parentElement.clientWidth;
    stage.scale = Math.max(2, Math.min(6, Math.floor(w / STAGE_W)));
    stage.cv.width = STAGE_W * stage.scale;
    stage.cv.height = STAGE_H * stage.scale;
  }

  function drawStage() {
    const g = stage.cv.getContext('2d'), s = stage.scale;
    g.imageSmoothingEnabled = false;
    g.setTransform(s, 0, 0, s, 0, 0);
    g.fillStyle = '#101010'; g.fillRect(0, 0, STAGE_W, STAGE_H);
    g.fillStyle = '#1c1c1c'; g.fillRect(0, GROUND + 1, STAGE_W, STAGE_H - GROUND - 1);
    stage.m.draw(g, Math.round(stage.x), GROUND);
    if (stage.grid) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = 'rgba(255,255,255,0.05)';
      for (let x = 0; x <= STAGE_W; x++) g.fillRect(x * s, 0, 1, stage.cv.height);
      for (let y = 0; y <= STAGE_H; y++) g.fillRect(0, y * s, stage.cv.width, 1);
    }
    const f = stage.m.frame;
    $('#frameInfo').textContent = `${stage.m.name} · frame ${stage.m.i + 1}/${stage.m.frames.length} · ${Math.round(f.d)} ms`;
  }

  function buildStateButtons() {
    const wrap = $('#states');
    for (const name of Object.keys(LABELS)) {
      const b = h('button', { type: 'button', class: 'chip chip--sm', 'data-state': name }, LABELS[name]);
      b.addEventListener('click', () => {
        stage.m.play(name);
        if (name !== 'walk' && name !== 'run') return;
        if (stage.x > STAGE_W - 30) stage.m.facing = -1;
        if (stage.x < 30) stage.m.facing = 1;
      });
      wrap.appendChild(b);
    }
    stage.m.on((type, name) => {
      if (type !== 'start') return;
      wrap.querySelectorAll('[data-state]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.state === name)));
    });
  }

  function bindStageControls() {
    $('#faceL').addEventListener('click', () => { stage.m.facing = -1; });
    $('#faceR').addEventListener('click', () => { stage.m.facing = 1; });
    $('#gridToggle').addEventListener('click', e => {
      stage.grid = !stage.grid; e.currentTarget.setAttribute('aria-pressed', String(stage.grid));
    });
    $('#pauseToggle').addEventListener('click', e => {
      stage.m.paused = !stage.m.paused; e.currentTarget.setAttribute('aria-pressed', String(stage.m.paused));
    });
    $('#stepBtn').addEventListener('click', () => {
      stage.m.paused = true; $('#pauseToggle').setAttribute('aria-pressed', 'true');
      stage.x += stage.m.step(false) * stage.m.facing;
    });
    $('#speed').addEventListener('change', e => { stage.m.speed = +e.target.value; });
  }

  // ---------- Sprite sheet ----------
  function buildSheet() {
    const wrap = $('#sheet');
    for (const name of Object.keys(LABELS)) {
      const a = ANIMS[name];
      const row = h('div', { class: 'sheet-row' });
      const total = a.frames.reduce((s, f) => s + f.d, 0);
      row.appendChild(h('div', { class: 'sheet-label' },
        `<strong>${LABELS[name]}</strong><span>${name} · ${a.frames.length}f · ${total} ms${a.loop ? ' · loop' : ''}</span>`));
      const strip = h('div', { class: 'sheet-strip' });
      a.frames.forEach(f => {
        const cell = h('figure', { class: 'sheet-cell' });
        const c = h('canvas', { width: FW, height: FH });
        c.getContext('2d').drawImage(renderFrame(merge(f)), 0, 0);
        cell.appendChild(c);
        cell.appendChild(h('figcaption', {}, `${f.d}${f.air ? ` · ↑${-f.air}` : ''}`));
        strip.appendChild(cell);
      });
      row.appendChild(strip);
      wrap.appendChild(row);
    }
  }

  function exportSheet() {
    const names = Object.keys(LABELS);
    const cols = Math.max(...names.map(n => ANIMS[n].frames.length));
    const c = h('canvas', { width: cols * FW, height: names.length * FH });
    const g = c.getContext('2d');
    const meta = { frameSize: [FW, FH], anchor: [24, 45], animations: {} };
    names.forEach((n, r) => {
      meta.animations[n] = { loop: !!ANIMS[n].loop, frames: ANIMS[n].frames.map((f, i) => {
        g.drawImage(renderFrame(merge(f)), i * FW, r * FH);
        return { x: i * FW, y: r * FH, w: FW, h: FH, duration: f.d, offsetY: f.air || 0, vx: f.vx !== undefined ? f.vx : ANIMS[n].vx || 0 };
      }) };
    });
    download(c.toDataURL('image/png'), 'sevnsoul-mascot.png');
    download('data:application/json,' + encodeURIComponent(JSON.stringify(meta, null, 2)), 'sevnsoul-mascot.json');
  }
  function download(href, name) { const a = h('a', { href, download: name }); document.body.appendChild(a); a.click(); a.remove(); }

  // ---------- Icons ----------
  function buildIcons() {
    const wrap = $('#iconGrid');
    for (const name of ICON_NAMES) {
      const b = h('button', { type: 'button', class: 'icon-card', title: 'Salin SVG' },
        `<span class="icon-row">${iconSVG(name, 24)}${iconSVG(name, 36)}${iconSVG(name, 48)}</span><code>${name}</code>`);
      b.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(iconSVG(name, 24)); flash(b, 'Disalin'); } catch (e) { flash(b, 'Gagal menyalin'); }
      });
      wrap.appendChild(b);
    }
    $('#iconCount').textContent = `${ICON_NAMES.length} ikon · grid 12×12`;
  }
  function flash(el, text) {
    const code = $('code', el), prev = code.textContent;
    code.textContent = text; setTimeout(() => { code.textContent = prev; }, 900);
  }

  // ---------- Loop ----------
  let last = performance.now();
  function tick(now) {
    // Cap only big gaps (tab switch); the mascot skips frames to stay on time below 60 fps.
    const dt = Math.min(1000, now - last); last = now;
    stage.x += stage.m.update(dt);
    if (stage.x > STAGE_W - 14) { stage.x = STAGE_W - 14; stage.m.facing = -1; }
    if (stage.x < 14) { stage.x = 14; stage.m.facing = 1; }
    drawStage();
    requestAnimationFrame(tick);
  }

  buildStateButtons(); bindStageControls(); buildSheet(); buildIcons();
  hydrateIcons();
  $('#exportSheet').addEventListener('click', exportSheet);
  $('#motionToggle').addEventListener('click', () => setReduced(!reduced));
  mq.addEventListener('change', e => setReduced(e.matches));
  setReduced(reduced);
  fitStage(); addEventListener('resize', fitStage);
  requestAnimationFrame(tick);
})();
