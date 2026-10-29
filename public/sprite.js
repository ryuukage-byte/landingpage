/* SevnSoul mascot — procedural pixel sprite + animation state machine.
 * Frame: 48x48, anchor (24,45) = ground row under the feet. Facing right; flip for left.
 * Every pose is integer pixels; smoothness comes from in-betweens, holds and lag, not sub-pixels. */
(function (root) {
  'use strict';

  const C = {
    O: '#0a0a0a',  // outline
    H1: '#1c1c1c', H2: '#303030',              // hair
    B1: '#1f1f1f', B2: '#2c2c2c', B0: '#161616', // hoodie
    P1: '#2b2b2b',                              // pants
    S: '#f3ddd2', BL: '#e8a99f',                // skin, blush
    E: '#141414', W: '#f5f5f5', L: '#b4b4b4', G: '#808080',
    M: '#6e3f3a', MR: '#b9605a',                // mouth
    SH: '#262626',                              // ground shadow
  };
  const FW = 48, FH = 48, AX = 24, AY = 45;

  // Head is 20x17, local coords (0,0) = top-left. [firstCol, lastCol] per row.
  const HEAD_MASK = [[4, 15], [2, 17], [1, 18], [0, 19], [0, 19], [0, 19], [0, 19], [0, 19], [0, 19],
    [0, 19], [0, 19], [0, 19], [1, 18], [1, 18], [2, 17], [3, 16], [5, 14]];
  // First skin row for face columns 3..16 — the jagged fringe.
  const BANGS = [10, 9, 8, 10, 9, 8, 9, 10, 8, 9, 10, 9, 8, 9];
  const TUFTS = [[5, -1], [6, -1], [6, -2], [9, -1], [10, -1], [10, -2], [11, -3], [12, -3], [14, -1], [15, -1],
    [16, 0], [-1, 9], [-1, 10], [-2, 10], [20, 8], [20, 9], [21, 9], [0, 12], [0, 13], [1, 14], [19, 12], [19, 13], [18, 14]];
  const HAIR_HI = [[6, 2], [7, 2], [8, 2], [5, 3], [6, 3], [13, 2], [14, 3], [3, 5], [16, 6]];
  const LOGO = [[1, 0], [0, 1], [1, 1], [0, 2]];

  // Arm poses relative to the shoulder (top-left of a 3px column). Written for the right arm,
  // "+x = outward"; the left arm is mirrored unless abs (then +x = facing direction).
  const ARMS = {
    down: { r: [[0, 0, 3, 7]], h: [0, 7, 3, 2] },
    sF: { abs: true, r: [[0, 0, 3, 4], [1, 4, 3, 3]], h: [1, 7, 3, 2] },
    sB: { abs: true, r: [[0, 0, 3, 4], [-1, 4, 3, 3]], h: [-1, 7, 3, 2] },
    // Running arms stay close to the body with the elbow bent: the swing reads from hand height
    // (fist up at the chest in front, hand down at the hip behind), not from reaching sideways.
    runF: { abs: true, r: [[0, 0, 3, 3], [1, 2, 3, 2]], h: [2, 1, 2, 2] },
    runB: { abs: true, r: [[0, 0, 3, 4], [-1, 3, 3, 3]], h: [-1, 6, 2, 2] },
    up: { r: [[0, -6, 3, 7]], h: [0, -8, 3, 2] },
    upOut: { r: [[0, -2, 3, 3], [1, -4, 3, 3], [2, -6, 3, 3]], h: [2, -8, 3, 2] },
    wave1: { r: [[0, -2, 3, 3], [1, -5, 3, 4]], h: [1, -7, 3, 2] },
    wave2: { r: [[0, -2, 3, 3], [2, -5, 3, 4]], h: [3, -7, 3, 2] },
    out: { r: [[0, 0, 3, 3], [2, 0, 6, 3]], h: [8, 0, 2, 3] },
    type1: { r: [[0, 0, 3, 5], [-3, 4, 4, 3]], h: [-5, 5, 2, 2] },
    type2: { r: [[0, 0, 3, 5], [-3, 3, 4, 3]], h: [-5, 3, 2, 2] },
    knees: { r: [[0, 0, 3, 4], [-1, 3, 3, 3]], h: [-1, 6, 3, 2] },
    front: { r: [[0, 0, 3, 5], [-2, 4, 3, 3]], h: [-3, 7, 3, 2] },
    pull: { r: [[0, -2, 3, 3], [-1, -6, 3, 5]], h: [-1, -8, 3, 2] },
    pullDown: { r: [[0, -1, 3, 2], [1, -3, 3, 3], [0, -5, 3, 3]], h: [-1, -7, 3, 2] },
    flail: { r: [[0, -2, 3, 3], [2, -4, 3, 3]], h: [4, -5, 2, 2] },
    chin: { r: [[0, 0, 3, 3], [-2, -3, 3, 4]], h: [-4, -5, 3, 2] },
    // Gesture set for motion graphics (inward = negative x for both arms).
    point: { r: [[0, 0, 3, 3], [2, -1, 5, 3]], h: [7, -1, 3, 2] },          // index finger forward-up
    thumb: { r: [[0, 0, 3, 4], [1, 2, 3, 3]], h: [2, -1, 2, 4] },           // fist with thumb up
    clapA: { r: [[0, 0, 3, 3], [-3, 2, 3, 3], [-5, 3, 3, 2]], h: [-7, 3, 3, 2] }, // hands meet at the centre
    clapB: { r: [[0, 0, 3, 3], [-3, 2, 3, 3]], h: [-5, 3, 2, 2] },          // hands a little apart
    shrug: { r: [[0, 0, 3, 3], [2, 2, 3, 2]], h: [4, 0, 3, 2] },            // palm up, out to the side
    hip: { r: [[0, 0, 3, 3], [2, 2, 3, 3], [0, 5, 3, 2]], h: [-1, 6, 2, 2] }, // hand on hip, elbow out
    belly: { r: [[0, 0, 3, 4], [-2, 4, 3, 2]], h: [-4, 5, 2, 2] },          // hands on the stomach
    facepalm: { r: [[0, -1, 3, 3], [-2, -3, 3, 3], [-4, -5, 3, 3]], h: [-5, -7, 3, 3] }, // palm over the eye
  };

  const BASE = { hip: 0, br: 0, bx: 0, hx: 0, hy: 0, air: 0, bowHair: 0, eyeDx: 1,
    L: { dx: 0, lift: 0 }, R: { dx: 0, lift: 0 }, armL: 'down', armR: 'down',
    eyes: 'open', mouth: 'none', fx: null, fxf: 0 };

  function merge(frame) {
    const p = Object.assign({}, BASE, { L: Object.assign({}, BASE.L), R: Object.assign({}, BASE.R) });
    for (const k in frame) {
      if (frame[k] === undefined || k === 'd' || k === 'vx') continue;
      if (k === 'L' || k === 'R') Object.assign(p[k], frame[k]);
      else p[k] = frame[k];
    }
    return p;
  }

  function canvas(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
    const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }

  const cache = new Map();
  function frameKey(p) {
    const q = Object.assign({}, p); delete q.air;
    return JSON.stringify(q);
  }

  // Renders one pose (air ignored) into a 48x48 canvas.
  function renderFrame(p) {
    const key = frameKey(p);
    if (cache.has(key)) return cache.get(key);
    const cv = canvas(FW, FH), g = cv.getContext('2d');
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(AX + x, AY + y, w, h); };

    const hipY = -6 + p.hip;
    const tTop = hipY - 10 + p.br;
    const ox = -10 + p.bx + p.hx, oy = tTop + 2 + p.hy - 16;
    const inMask = (c, r) => r >= 0 && r < 17 && c >= HEAD_MASK[r][0] && c <= HEAD_MASK[r][1];
    const isSkin = (c, r) => c >= 3 && c <= 16 && inMask(c, r) && r >= BANGS[c - 3] + p.bowHair;

    // Silhouette parts share one outline pass, so overlaps merge cleanly.
    const sil = [];
    const S = (x, y, w, h, c) => sil.push([x, y, w, h, c]);
    for (const side of ['L', 'R']) {
      const leg = p[side];
      const x = (side === 'L' ? -5 : 1) + leg.dx;
      const fb = -1 - leg.lift;
      S(x, hipY, 4, Math.max(1, fb - 2 - hipY + 1), C.P1);
      S(x, fb - 1, 5, 1, C.W);
      S(x, fb, 5, 1, C.L);
    }
    S(-7 + p.bx, tTop, 14, hipY - tTop + 2, C.B1);
    for (let r = 0; r < 17; r++) {
      for (let c = HEAD_MASK[r][0]; c <= HEAD_MASK[r][1]; c++) S(ox + c, oy + r, 1, 1, isSkin(c, r) ? C.S : C.H1);
    }
    for (const [c, r] of TUFTS) S(ox + c, oy + r, 1, 1, C.H1);
    for (const [x, y, w, h] of sil) R(x - 1, y - 1, w + 2, h + 2, C.O);
    for (const [x, y, w, h, c] of sil) R(x, y, w, h, c);

    // Hoodie details
    R(-7 + p.bx, hipY + 1, 14, 1, C.B0);
    R(-4 + p.bx, hipY - 2, 8, 1, C.B0);
    R(-7 + p.bx, tTop + 3, 1, Math.max(0, hipY - tTop - 3), C.B2);
    const headBottom = oy + 16;
    for (const [lx, ly] of LOGO) {
      const y = tTop + 4 + ly;
      if (y > headBottom + 1) R(3 + p.bx + lx, y, 1, 1, C.W);
    }
    R(ox + 5, headBottom + 1, 10, 1, C.O); // chin shadow

    for (const [c, r] of HAIR_HI) if (!isSkin(c, r)) R(ox + c, oy + r, 1, 1, C.H2);

    // Face: every pixel is masked by the fringe, so bowing hides features naturally.
    const fy = p.bowHair, ed = p.eyeDx;
    const F = (c, r, w, h, col) => {
      for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) if (isSkin(x, y)) R(ox + x, oy + y, 1, 1, col);
    };
    for (const ex of [6 + ed, 12 + ed]) {
      switch (p.eyes) {
        case 'open': F(ex, 10 + fy, 2, 3, C.E); F(ex + 1, 10 + fy, 1, 1, C.W); break;
        case 'wide': F(ex, 10 + fy, 2, 3, C.E); F(ex, 10 + fy, 1, 1, C.W); F(ex + 1, 12 + fy, 1, 1, C.W); break;
        case 'half': case 'down': case 'sad': F(ex, 11 + fy, 2, 2, C.E); break;
        case 'closed': F(ex, 12 + fy, 2, 1, C.E); break;
        case 'happy': F(ex, 11 + fy, 1, 1, C.E); F(ex + 1, 10 + fy, 1, 1, C.E); F(ex + 2, 11 + fy, 1, 1, C.E); break;
      }
    }
    if (p.eyes === 'sad') { F(7 + ed, 9 + fy, 1, 1, C.E); F(12 + ed, 9 + fy, 1, 1, C.E); }
    F(4 + ed, 13 + fy, 2, 1, C.BL); F(14 + ed, 13 + fy, 2, 1, C.BL);
    const m = 9 + ed;
    switch (p.mouth) {
      case 'smile': F(m, 14 + fy, 2, 1, C.M); break;
      case 'open': F(m, 14 + fy, 2, 1, C.M); F(m, 15 + fy, 2, 1, C.MR); break;
      case 'o': F(m, 14 + fy, 2, 2, C.M); break;
      case 'frown': F(m, 14 + fy, 2, 1, C.M); F(m - 1, 15 + fy, 1, 1, C.M); F(m + 2, 15 + fy, 1, 1, C.M); break;
    }

    // Arms carry their own outline so they read against the dark hoodie.
    const sy = tTop + 3;
    const arm = (side, name, sx) => {
      const d = ARMS[name] || ARMS.down;
      const mir = side === 'L' && !d.abs;
      const T = ([x, y, w, h]) => [sx + (mir ? 3 - (x + w) : x), sy + y, w, h];
      const rs = d.r.map(T), hd = T(d.h);
      for (const [x, y, w, h] of rs.concat([hd])) R(x - 1, y - 1, w + 2, h + 2, C.O);
      for (const [x, y, w, h] of rs) R(x, y, w, h, C.B1);
      R(hd[0], hd[1], hd[2], hd[3], C.S);
      return hd;
    };
    const hands = { L: arm('L', p.armL, -10 + p.bx), R: arm('R', p.armR, 7 + p.bx) };

    const plus = (cx, cy, r, c) => { R(cx - r, cy, 2 * r + 1, 1, c); R(cx, cy - r, 1, 2 * r + 1, c); };
    const f = p.fxf;
    switch (p.fx) {
      case 'sparkle':
        plus(ox - 3, oy + 3, f ? 1 : 2, f ? C.W : C.L);
        plus(ox + 22, oy + 1, f ? 2 : 1, f ? C.L : C.W);
        break;
      case 'spark': {
        const [hx, hy, hw] = hands.R;
        plus(hx + hw + 2, hy + 1, f ? 2 : 1, C.W);
        if (f) { R(hx + hw, hy - 1, 1, 1, C.L); R(hx + hw + 4, hy + 3, 1, 1, C.L); }
        break;
      }
      case 'excl':
        R(ox + 19, oy - 5, 1, 3, C.W); R(ox + 19, oy - 1, 1, 1, C.W);
        break;
      case 'gloom':
        for (let k = 0; k < 3; k++) R(ox + 16 + 2 * k, oy - 3 - (k === 1 ? 1 : 0) + f, 1, 3, C.G);
        break;
      case 'joy': {
        const s = f ? 1 : 0;
        R(ox - 4 - s, oy + 8, 2, 1, C.L); R(ox - 3 - s, oy + 4 - s, 1, 1, C.L); R(ox - 2 - s, oy + 5 - s, 1, 1, C.L);
        R(ox + 22 + s, oy + 8, 2, 1, C.L); R(ox + 22 + s, oy + 4 - s, 1, 1, C.L); R(ox + 21 + s, oy + 5 - s, 1, 1, C.L);
        break;
      }
      case 'rope':
        for (const hd of [hands.L, hands.R]) R(hd[0] + 1, -AY, 1, hd[1] + AY, C.L);
        break;
      case 'dots':
        for (let k = 0; k < 3; k++) R(ox + 13 + 3 * k, oy - 4, 2, 2, k === f ? C.W : C.G);
        break;
      case 'zzz': {   // two Zs drifting up, f = 0..2
        const z = (x, y, c) => { R(x, y, 4, 1, c); R(x + 2, y + 1, 1, 1, c); R(x + 1, y + 2, 1, 1, c); R(x, y + 3, 4, 1, c); };
        z(ox + 20, oy + 2 - f, C.L);
        if (f > 0) z(ox + 24, oy - 4 - f, f === 2 ? C.W : C.G);
        break;
      }
      case 'note': {  // music notes either side, bobbing with f
        const n = (x, y, c) => { R(x + 2, y, 1, 4, c); R(x, y + 3, 2, 2, c); R(x + 3, y, 1, 1, c); };
        n(ox - 6, oy + 4 - (f ? 2 : 0), C.L);
        n(ox + 22, oy + 2 - (f ? 0 : 2), C.W);
        break;
      }
      case 'heart': { // pink hearts rising, f = 0..2
        const h = (x, y, c) => { R(x, y, 2, 1, c); R(x + 3, y, 2, 1, c); R(x, y + 1, 5, 1, c); R(x + 1, y + 2, 3, 1, c); R(x + 2, y + 3, 1, 1, c); };
        h(ox + 19, oy - 1 - 2 * f, C.BL);
        if (f) h(ox - 5, oy + 5 - 2 * f, C.BL);
        break;
      }
      case 'question': // "?" above the head, nudging with f
        R(ox + 20, oy - 6 + f, 3, 1, C.W); R(ox + 22, oy - 5 + f, 1, 1, C.W); R(ox + 21, oy - 4 + f, 1, 1, C.W);
        R(ox + 21, oy - 2 + f, 1, 1, C.W);
        break;
      case 'anger': {  // anime anger mark on the forehead, pulsing with f
        const a = f ? 1 : 0, x = ox + 15 - a, y = oy + 1 - a, e = 2 * a;
        R(x + 1, y, 1, 1, C.MR); R(x + 3 + e, y, 1, 1, C.MR); R(x, y + 1, 1, 1, C.MR); R(x + 4 + e, y + 1, 1, 1, C.MR);
        R(x, y + 3 + e, 1, 1, C.MR); R(x + 4 + e, y + 3 + e, 1, 1, C.MR); R(x + 1, y + 4 + e, 1, 1, C.MR); R(x + 3 + e, y + 4 + e, 1, 1, C.MR);
        break;
      }
      case 'sweat':    // a drop sliding down the temple
        R(ox + 20, oy + 4 + f, 1, 1, C.L); R(ox + 19, oy + 5 + f, 3, 2, C.L); R(ox + 20, oy + 7 + f, 1, 1, C.W);
        break;
    }

    cache.set(key, cv);
    return cv;
  }

  // Draws a merged pose with its anchor at (x, y) = ground under the feet.
  function drawPose(ctx, p, x, y, flip) {
    const sw = Math.max(6, 16 - Math.floor(-p.air / 2) * 2);
    ctx.fillStyle = C.SH;
    ctx.fillRect(x - sw / 2, y, sw, 1);
    ctx.save();
    if (flip) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
    ctx.drawImage(renderFrame(p), x - AX, y - AY + p.air);
    ctx.restore();
  }

  // ---------- Animation data ----------
  const F = (d, o) => Object.assign({ d }, o || {});
  const opp = a => ({ sF: 'sB', sB: 'sF', runF: 'runB', runB: 'runF' })[a] || a;
  const A = {};

  A.idle = { loop: true, frames: [F(420), F(120, { br: 1, hy: -1 }), F(420, { br: 1 }), F(120, { hy: 1 })] };

  (function () {
    const hip = [0, 1, 0, -1, 0, 1, 0, -1], Ld = [2, 1, 0, -1, -2, -1, 0, 1], Ll = [0, 0, 0, 0, 0, 0, 2, 1];
    const Rl = [0, 0, 2, 1, 0, 0, 0, 0], aL = ['sB', 'sB', 'down', 'sF', 'sF', 'sF', 'down', 'sB'];
    A.walk = { loop: true, lag: true, vx: 1, frames: hip.map((h, i) => F(100, {
      hip: h, L: { dx: Ld[i], lift: Ll[i] }, R: { dx: -Ld[i], lift: Rl[i] }, armL: aL[i], armR: opp(aL[i]) })) };
  })();

  (function () {
    const hip = [1, 0, -1, 1, 0, -1], Ld = [3, 1, -2, -3, -1, 2], Ll = [0, 0, 0, 1, 3, 2], Rl = [1, 3, 2, 0, 0, 0];
    const aL = ['runB', 'runB', 'runB', 'runF', 'runF', 'runF'];
    A.run = { loop: true, lag: true, vx: 2, frames: hip.map((h, i) => F(80, {
      hip: h, bx: 1, hx: 1, L: { dx: Ld[i], lift: Ll[i] }, R: { dx: -Ld[i], lift: Rl[i] }, armL: aL[i], armR: opp(aL[i]) })) };
  })();

  A.walkStop = { lag: true, frames: [F(100, { hip: 1, L: { dx: 1 }, R: { dx: -1 }, vx: 1 }), F(120)] };
  A.runStop = { lag: true, frames: [
    F(80, { hip: 1, bx: -1, L: { dx: 3 }, R: { dx: -1 }, armL: 'sF', armR: 'sF', vx: 2 }),
    F(90, { hip: 2, br: 1, L: { dx: 2 }, armL: 'knees', armR: 'knees', vx: 1 }),
    F(90, { hip: 1 }), F(100)] };

  const landing = hard => [
    F(hard ? 90 : 80, { hip: hard ? 3 : 2, br: 1, armL: 'knees', armR: 'knees' }),
    F(80, { hip: hard ? 2 : 1, br: hard ? 1 : 0 }), F(80, { hip: hard ? 1 : 0 }), F(100)];

  (function () {
    const fr = [F(90, { hip: 2, br: 1, armL: 'knees', armR: 'knees' }), F(50, { hip: -1, air: -2, armL: 'up', armR: 'up' })];
    const N = 10, H = 16;
    for (let i = 1; i <= N; i++) {
      const t = i / (N + 1), air = -Math.round(2 + H * 4 * t * (1 - t));
      if (t < 0.42) fr.push(F(50, { air, L: { lift: 2, dx: -1 }, R: { lift: 3, dx: 1 }, armL: 'up', armR: 'up' }));
      else if (t < 0.62) fr.push(F(60, { air, L: { lift: 3 }, R: { lift: 3 }, armL: 'upOut', armR: 'upOut', eyes: 'wide' }));
      else fr.push(F(50, { air, L: { dx: -1 }, R: { dx: 1 }, armL: 'flail', armR: 'up' }));
    }
    A.jump = { lag: true, frames: fr.concat(landing(false)) };
  })();

  A.fallLand = { lag: true, frames: [-22, -21, -18, -13, -6].map((air, i) => F(60, {
    air, L: { dx: -1 }, R: { dx: 1, lift: 1 }, armL: i % 2 ? 'up' : 'flail', armR: i % 2 ? 'flail' : 'up', eyes: 'wide' }))
    .concat(landing(true)) };

  const hands2 = (a, b) => ({ armL: a, armR: b || a });
  A.bow = { frames: [
    F(90, Object.assign({ hy: 1, eyes: 'half' }, hands2('front'))),
    F(90, Object.assign({ br: 1, hy: 2, eyes: 'closed', bowHair: 1 }, hands2('front'))),
    F(520, Object.assign({ br: 1, hip: 1, hy: 3, hx: 1, eyes: 'closed', bowHair: 2 }, hands2('front'))),
    F(110, Object.assign({ br: 1, hy: 2, eyes: 'closed', bowHair: 1 }, hands2('front'))),
    F(90, { eyes: 'half' }), F(90, { hy: -1 }), F(200, { mouth: 'smile' })] };

  A.typing = { loop: true, frames: [
    F(130, { hy: 1, eyes: 'down', armL: 'type1', armR: 'type2' }),
    F(130, { hy: 1, eyes: 'down', armL: 'type2', armR: 'type1' })] };

  const yay = { eyes: 'happy', mouth: 'open', armL: 'upOut', armR: 'upOut', fx: 'sparkle' };
  A.found = { lag: true, frames: [
    F(70, { hip: 1, br: 1, eyes: 'wide' }),
    F(70, Object.assign({ air: -3, fxf: 0 }, yay)), F(90, Object.assign({ air: -5, fxf: 1 }, yay)),
    F(70, Object.assign({ air: -3, fxf: 0 }, yay)), F(80, Object.assign({ hip: 1, br: 1, fxf: 1 }, yay)),
    F(220, { eyes: 'happy', mouth: 'smile', fx: 'sparkle', fxf: 0, armR: 'wave1' }),
    F(220, { eyes: 'happy', mouth: 'smile', fx: 'sparkle', fxf: 1, armR: 'wave2' }),
    F(200, { mouth: 'smile' })] };

  A.pull = { lag: true, frames: [
    F(120, hands2('up')),
    F(80, Object.assign({ air: -2 }, hands2('up'))),
    F(90, Object.assign({ hip: 1, fx: 'rope' }, hands2('pull'))),
    F(140, Object.assign({ hip: 2, br: 1, eyes: 'closed', mouth: 'o', fx: 'rope' }, hands2('pullDown'))),
    F(120, Object.assign({ hip: 1, fx: 'rope' }, hands2('pullDown'))),
    F(320, { mouth: 'smile', armR: 'out' })] };

  A.wave = { frames: [F(100, { armR: 'up', mouth: 'smile' })]
    .concat([0, 1, 2, 3, 4, 5].map(k => F(160, { armR: k % 2 ? 'wave2' : 'wave1', mouth: 'smile', eyes: k === 2 || k === 3 ? 'happy' : undefined })))
    .concat([F(120, { armR: 'up' })]) };

  // Stretch with a yawn: rise onto the toes, arms up and out, eyes shut, then settle.
  A.stretch = { lag: true, frames: [
    F(140, { br: 1 }),
    F(160, { hip: -1, armL: 'up', armR: 'up', eyes: 'half' }),
    F(900, { hip: -1, armL: 'upOut', armR: 'upOut', eyes: 'closed', mouth: 'o' }),
    F(160, { armL: 'up', armR: 'up', eyes: 'half' }),
    F(180, { br: 1, eyes: 'half' }),
    F(120)] };

  A.lookL = { frames: [F(80, { eyeDx: 0 }), F(700, { hx: -1, eyeDx: -1 }), F(80, { eyeDx: 0 })] };
  A.lookR = { frames: [F(80, { eyeDx: 2 }), F(700, { hx: 1, eyeDx: 2 }), F(80, { eyeDx: 1 })] };

  A.crouch = { lag: true, frames: [
    F(80, { hip: 1, br: 1 }), F(80, Object.assign({ hip: 2, br: 1 }, hands2('knees'))),
    F(1200, Object.assign({ hip: 3, br: 1, L: { dx: -1 }, R: { dx: 1 } }, hands2('knees'))),
    F(80, { hip: 1 })] };

  A.interact = { frames: [
    F(90, { armR: 'sF' }), F(120, { armR: 'out', bx: 1 }),
    F(150, { armR: 'out', bx: 1, fx: 'spark', fxf: 0 }), F(150, { armR: 'out', bx: 1, fx: 'spark', fxf: 1 }),
    F(150, { armR: 'out', bx: 1, fx: 'spark', fxf: 0 }), F(120, { armR: 'sF' })] };

  const joy = { eyes: 'happy', mouth: 'open', armL: 'upOut', armR: 'upOut', fx: 'joy' };
  A.happy = { lag: true, frames: [
    F(80, { hip: 1, br: 1 }), F(90, Object.assign({ air: -2, fxf: 0 }, joy)),
    F(200, Object.assign({ fxf: 1 }, joy)), F(200, Object.assign({ fxf: 0 }, joy)), F(200, Object.assign({ fxf: 1 }, joy)),
    F(100, { hip: 1 })] };

  const shock = { eyes: 'wide', mouth: 'o', fx: 'excl', armL: 'sB', armR: 'sB' };
  A.surprised = { lag: true, frames: [
    F(60, Object.assign({ air: -3 }, shock)), F(60, Object.assign({ air: -1 }, shock)),
    F(80, Object.assign({ hip: 1 }, shock)), F(700, shock), F(100, { eyes: 'half' })] };

  const blue = { br: 1, hy: 2, eyes: 'sad', mouth: 'frown', fx: 'gloom' };
  A.sad = { frames: [
    F(120, { hy: 1, eyes: 'half' }),
    F(160, Object.assign({ fxf: 0 }, blue)), F(500, Object.assign({ fxf: 1 }, blue)),
    F(500, Object.assign({ fxf: 0 }, blue)), F(500, Object.assign({ fxf: 1 }, blue)),
    F(150, { hy: 1, eyes: 'half' })] };

  // Searching: hand on chin, eyes scan left → right, "..." dots cycle.
  const think = (o) => Object.assign({ armR: 'chin', fx: 'dots' }, o);
  A.search = { loop: true, frames: [
    F(380, think({ eyeDx: -1, hx: -1, fxf: 0 })), F(120, think({ eyeDx: 0, fxf: 1 })),
    F(380, think({ eyeDx: 2, hx: 1, fxf: 2 })), F(120, think({ eyeDx: 1, fxf: 0 })),
    F(300, think({ eyes: 'half', fxf: 1 })), F(300, think({ eyes: 'half', br: 1, fxf: 2 }))] };

  // Jump up, grab the banner at the apex, ride it down, tug, let go.
  // `ev` marks frames the scene listens for: grab → attach banner, release → detach.
  const both = a => ({ armL: a, armR: a });
  A.grabJump = { lag: true, frames: [
    F(110, Object.assign({ hip: 2, br: 1, eyes: 'wide' }, both('knees'))),
    F(50, Object.assign({ hip: -1, air: -3 }, both('up'))),
    ...[-8, -13, -16].map(air => F(50, Object.assign({ air, L: { lift: 2, dx: -1 }, R: { lift: 3, dx: 1 } }, both('up')))),
    F(110, Object.assign({ air: -18, L: { lift: 3 }, R: { lift: 3 }, ev: 'grab' }, both('up'))),
    ...[-16, -12, -7, -2].map(air => F(55, Object.assign({ air, L: { dx: -1 }, R: { dx: 1 }, fx: 'rope' }, both('pull')))),
    F(90, Object.assign({ hip: 2, br: 1, ev: 'land', fx: 'rope' }, both('pullDown'))),
    F(160, Object.assign({ hip: 2, br: 1, eyes: 'closed', mouth: 'o', fx: 'rope' }, both('pullDown'))),
    F(100, Object.assign({ hip: 1, fx: 'rope' }, both('pullDown'))),
    F(240, { armR: 'out', mouth: 'smile', ev: 'release' }),
    F(160, { mouth: 'smile' })] };

  // Jump to the ceiling. Frames give the poses; the height is set from outside through
  // Mascot.airOverride, because it depends on the room (ground → ceiling distance).
  // `phase` tells the driver which part of the arc a frame covers. The air values here are
  // only a stand-in so the lab can preview the poses.
  A.ceilingJump = { lag: true, frames: [
    F(150, Object.assign({ hip: 2, br: 1, eyes: 'wide' }, both('knees'))),
    F(440, Object.assign({ air: -10, L: { lift: 2, dx: -1 }, R: { lift: 3, dx: 1 }, phase: 'rise' }, both('up'))),
    F(150, Object.assign({ air: -18, L: { lift: 3 }, R: { lift: 3 }, ev: 'grab', phase: 'apex' }, both('up'))),
    F(400, Object.assign({ air: -8, L: { dx: -1 }, R: { dx: 1 }, fx: 'rope', phase: 'fall' }, both('pull'))),
    F(90, Object.assign({ hip: 2, br: 1, ev: 'land', fx: 'rope' }, both('pullDown'))),
    F(160, Object.assign({ hip: 2, br: 1, eyes: 'closed', mouth: 'o', fx: 'rope' }, both('pullDown'))),
    F(100, Object.assign({ hip: 1, fx: 'rope' }, both('pullDown'))),
    F(240, { armR: 'out', mouth: 'smile', ev: 'release' }),
    F(160, { mouth: 'smile' })] };

  // ---------- Expressions & gestures (motion graphics set) ----------
  // Talking: mouth shapes cycle under a small beat of the head and an explaining hand.
  A.talk = { loop: true, frames: [
    F(110, { mouth: 'open', armR: 'front' }), F(90, { mouth: 'smile', armR: 'front', hy: 1 }),
    F(120, { mouth: 'o', armR: 'sF' }), F(90, { mouth: 'none', armR: 'sF' }),
    F(110, { mouth: 'open', armR: 'shrug' }), F(140, { mouth: 'smile', armR: 'shrug', hy: 1 })] };
  // Presenting: one open palm out to the side, chatty.
  A.present = { lag: true, frames: [
    F(100, { armR: 'sF' }), F(120, { armR: 'shrug', mouth: 'smile' }),
    F(600, { armR: 'shrug', mouth: 'open', eyes: 'happy' }), F(400, { armR: 'shrug', mouth: 'smile' }), F(120, { armR: 'sF' })] };
  A.point = { lag: true, frames: [
    F(90, { bx: -1, armR: 'sB' }), F(80, { armR: 'out', eyes: 'wide' }),
    F(700, { bx: 1, armR: 'point', mouth: 'open', eyeDx: 2 }), F(300, { bx: 1, armR: 'point', mouth: 'smile', eyeDx: 2 }), F(120, { armR: 'sF' })] };
  A.nod = { frames: [
    F(90, { hy: 1, eyes: 'half' }), F(110, { hy: 2, eyes: 'closed', mouth: 'smile' }), F(90, { hy: 0, mouth: 'smile' }),
    F(110, { hy: 2, eyes: 'closed', mouth: 'smile' }), F(250, { hy: 0, mouth: 'smile' })] };
  A.shake = { frames: [
    F(100, { hx: -1, eyeDx: 0, mouth: 'frown' }), F(100, { hx: 1, eyeDx: 2, mouth: 'frown' }),
    F(100, { hx: -1, eyeDx: 0, mouth: 'frown' }), F(100, { hx: 1, eyeDx: 2, mouth: 'frown' }), F(250, { eyes: 'half', mouth: 'frown' })] };
  A.thumbsUp = { lag: true, frames: [
    F(90, { hip: 1, armR: 'sF' }), F(80, { armR: 'thumb', hip: -1 }),
    F(500, { armR: 'thumb', eyes: 'happy', mouth: 'smile', fx: 'sparkle', fxf: 0 }),
    F(400, { armR: 'thumb', eyes: 'happy', mouth: 'smile', fx: 'sparkle', fxf: 1 }), F(140, { armR: 'sF', mouth: 'smile' })] };
  A.clap = { loop: true, lag: true, frames: [
    F(110, { armL: 'clapB', armR: 'clapB', eyes: 'happy', mouth: 'open' }),
    F(90, { armL: 'clapA', armR: 'clapA', eyes: 'happy', mouth: 'open', hip: 1 }),
    F(110, { armL: 'clapB', armR: 'clapB', eyes: 'happy', mouth: 'smile' }),
    F(90, { armL: 'clapA', armR: 'clapA', eyes: 'happy', mouth: 'smile', hip: 1 })] };
  A.shrug = { lag: true, frames: [
    F(100, { armL: 'sF', armR: 'sF' }), F(120, { armL: 'shrug', armR: 'shrug', br: -1, hy: -1, eyes: 'half' }),
    F(800, { armL: 'shrug', armR: 'shrug', br: -1, hy: -1, eyes: 'half', fx: 'question', fxf: 0 }),
    F(200, { armL: 'shrug', armR: 'shrug', eyes: 'half', fx: 'question', fxf: 1 }), F(140, {})] };
  A.facepalm = { lag: true, frames: [
    F(100, { armR: 'chin', eyes: 'half' }), F(90, { armR: 'facepalm', hy: 1, eyes: 'closed' }),
    F(900, { armR: 'facepalm', hy: 1, br: 1, eyes: 'closed', mouth: 'frown', fx: 'gloom', fxf: 0 }),
    F(300, { armR: 'facepalm', hy: 1, br: 1, eyes: 'closed', mouth: 'frown', fx: 'gloom', fxf: 1 }), F(160, { eyes: 'half' })] };
  A.sleep = { loop: true, frames: [
    F(700, { eyes: 'closed', hy: 1, br: 1, fx: 'zzz', fxf: 0 }), F(500, { eyes: 'closed', hy: 2, br: 1, fx: 'zzz', fxf: 1 }),
    F(700, { eyes: 'closed', hy: 2, br: 1, mouth: 'o', fx: 'zzz', fxf: 2 }), F(400, { eyes: 'closed', hy: 1, fx: 'zzz', fxf: 1 })] };
  A.dance = { loop: true, lag: true, frames: [
    F(120, { hip: 1, bx: -1, L: { lift: 2 }, armL: 'up', armR: 'shrug', eyes: 'happy', mouth: 'smile', fx: 'note', fxf: 0 }),
    F(120, { hip: -1, armL: 'upOut', armR: 'sF', eyes: 'happy', mouth: 'open', fx: 'note', fxf: 0 }),
    F(120, { hip: 1, bx: 1, R: { lift: 2 }, armL: 'shrug', armR: 'up', eyes: 'happy', mouth: 'smile', fx: 'note', fxf: 1 }),
    F(120, { hip: -1, armL: 'sF', armR: 'upOut', eyes: 'happy', mouth: 'open', fx: 'note', fxf: 1 })] };
  A.love = { lag: true, frames: [
    F(100, { armL: 'clapB', armR: 'clapB', eyes: 'happy' }),
    ...[0, 1, 2].map(k => F(260, { armL: 'clapA', armR: 'clapA', eyes: 'happy', mouth: 'smile', br: k % 2, fx: 'heart', fxf: k })),
    F(300, { armL: 'clapB', armR: 'clapB', eyes: 'happy', mouth: 'smile', fx: 'heart', fxf: 2 }), F(140, { mouth: 'smile' })] };
  A.confused = { frames: [
    F(120, { eyeDx: 0, hx: -1 }), F(500, { eyeDx: 0, hx: -1, mouth: 'o', fx: 'question', fxf: 0 }),
    F(500, { eyeDx: 2, hx: 1, mouth: 'o', armR: 'chin', fx: 'question', fxf: 1 }),
    F(300, { eyeDx: 1, armR: 'chin', eyes: 'half', fx: 'question', fxf: 0 }), F(140, {})] };
  A.laugh = { loop: true, lag: true, frames: [
    F(110, { armL: 'belly', armR: 'belly', eyes: 'happy', mouth: 'open', br: 1, fx: 'joy', fxf: 0 }),
    F(90, { armL: 'belly', armR: 'belly', eyes: 'happy', mouth: 'smile', hip: 1, br: 1, fx: 'joy', fxf: 1 }),
    F(110, { armL: 'belly', armR: 'belly', eyes: 'happy', mouth: 'open', br: 1, fx: 'joy', fxf: 0 }),
    F(90, { armL: 'belly', armR: 'belly', eyes: 'happy', mouth: 'smile', fx: 'joy', fxf: 1 })] };
  A.angry = { lag: true, frames: [
    F(90, { armL: 'sF', armR: 'sF', eyes: 'down' }), F(80, { armL: 'hip', armR: 'hip', hip: 1, eyes: 'down', mouth: 'frown' }),
    F(300, { armL: 'hip', armR: 'hip', eyes: 'down', mouth: 'frown', fx: 'anger', fxf: 0 }),
    F(300, { armL: 'hip', armR: 'hip', eyes: 'down', mouth: 'frown', fx: 'anger', fxf: 1 }),
    F(300, { armL: 'hip', armR: 'hip', eyes: 'down', mouth: 'frown', fx: 'anger', fxf: 0 }), F(140, { eyes: 'half' })] };
  A.nervous = { loop: true, frames: [
    F(200, { eyes: 'wide', mouth: 'o', armL: 'belly', armR: 'belly', eyeDx: 0, fx: 'sweat', fxf: 0 }),
    F(200, { eyes: 'wide', mouth: 'o', armL: 'belly', armR: 'belly', eyeDx: 2, fx: 'sweat', fxf: 1 }),
    F(200, { eyes: 'wide', mouth: 'frown', armL: 'belly', armR: 'belly', eyeDx: 0, hx: -1, fx: 'sweat', fxf: 2 }),
    F(200, { eyes: 'half', mouth: 'frown', armL: 'belly', armR: 'belly', eyeDx: 1, fx: 'sweat', fxf: 3 })] };
  A.cheer = { lag: true, frames: [
    F(100, { hip: 2, br: 1, armL: 'knees', armR: 'knees' }),
    ...[-4, -8, -10, -8, -4].map(air => F(60, { air, armL: 'up', armR: 'up', eyes: 'happy', mouth: 'open', L: { lift: 2 }, R: { lift: 2 }, fx: 'sparkle', fxf: air < -7 ? 1 : 0 })),
    F(90, { hip: 2, br: 1, armL: 'upOut', armR: 'upOut', eyes: 'happy', mouth: 'open' }),
    F(400, { armL: 'upOut', armR: 'upOut', eyes: 'happy', mouth: 'open', fx: 'joy', fxf: 1 }), F(140, { mouth: 'smile' })] };

  // Head follows body with a one-frame delay (follow-through), clamped to 1px.
  for (const name in A) {
    const a = A[name];
    if (!a.lag) continue;
    const v = a.frames.map(f => (f.hip || 0) + (f.air || 0));
    a.frames.forEach((f, i) => {
      if ('hy' in f) return;
      const prev = i ? v[i - 1] : (a.loop ? v[v.length - 1] : 0);
      f.hy = Math.max(-1, Math.min(1, prev - v[i]));
    });
  }
  // Reduced motion: one key pose per animation (the longest hold), no travel.
  for (const name in A) {
    const a = A[name];
    const total = a.frames.reduce((s, f) => s + f.d, 0);
    let k = 0;
    if (!a.loop) a.frames.forEach((f, i) => { if (f.d > a.frames[k].d) k = i; });
    a.still = k;
    a.reducedFrames = [Object.assign({}, a.frames[k], { d: a.loop ? 1e9 : Math.min(900, total), air: 0, vx: 0 })];
  }

  const LABELS = {
    idle: 'Idle', walk: 'Jalan', run: 'Lari', jump: 'Lompat', fallLand: 'Jatuh / Mendarat', bow: 'Salam (bow)',
    typing: 'Mengetik', found: 'Ketemu', pull: 'Tarik banner', wave: 'Lambai', lookL: 'Lihat kiri', lookR: 'Lihat kanan',
    crouch: 'Jongkok', interact: 'Interaksi', happy: 'Senang', surprised: 'Kaget', sad: 'Sedih',
    search: 'Mencari', grabJump: 'Lompat ambil banner', ceilingJump: 'Lompat ke langit-langit', stretch: 'Menguap / peregangan',
    talk: 'Bicara', present: 'Presentasi', point: 'Menunjuk', nod: 'Mengangguk', shake: 'Menggeleng',
    thumbsUp: 'Jempol', clap: 'Tepuk tangan', shrug: 'Angkat bahu', facepalm: 'Tepuk jidat', sleep: 'Tidur',
    dance: 'Menari', love: 'Suka / hati', confused: 'Bingung', laugh: 'Tertawa', angry: 'Marah', nervous: 'Gugup',
    cheer: 'Bersorak',
  };

  // Top of the hands relative to the ground row (includes air) — where a held object sits.
  function handY(p) {
    const d = ARMS[p.armR] || ARMS.down;
    return -6 + p.hip - 10 + p.br + 3 + d.h[1] + p.air;
  }
  // Highest hair pixel (ahoge) relative to the ground row, including air.
  function headTop(p) {
    return -6 + p.hip - 10 + p.br + 2 + p.hy - 16 - 3 + p.air;
  }
  const STOPS = { walk: 'walkStop', run: 'runStop' };

  class Mascot {
    constructor() {
      this.facing = 1; this.speed = 1; this.reduced = false; this.paused = false;
      this.airOverride = null; // set by a driver (e.g. ceilingJump) to replace the frame's air
      this.queue = []; this.listeners = [];
      this.blinkIn = 1500 + Math.random() * 2500; this.blinkT = -1;
      this._set('idle');
    }
    get frames() { return this.reduced ? this.anim.reducedFrames : this.anim.frames; }
    get frame() { return this.frames[this.i]; }
    on(fn) { this.listeners.push(fn); }
    _emit(type) { for (const fn of this.listeners) fn(type, this.name, this.i); }
    _set(name) { this.name = name; this.anim = A[name]; this.i = 0; this.t = 0; this._emit('start'); this._emit('frame'); }

    // Moving states get a braking clip so the character never snaps to a stop.
    play(name, then) {
      if (!A[name]) return;
      this.queue = then ? [].concat(then) : [];
      const stop = STOPS[this.name];
      if (stop && !this.reduced && name !== 'walk' && name !== 'run') { this.queue.unshift(name); this._set(stop); }
      else this._set(name);
    }

    // Advances time; returns pixels travelled (already multiplied by facing).
    update(dt) {
      if (this.paused) return 0;
      dt *= this.speed;
      let moved = 0;
      if (!this.reduced) {
        if (this.blinkT >= 0) { this.blinkT += dt; if (this.blinkT > 170) { this.blinkT = -1; this.blinkIn = Math.random() < 0.2 ? 180 : 2200 + Math.random() * 3000; } }
        else if ((this.blinkIn -= dt) <= 0) this.blinkT = 0;
      }
      this.t += dt;
      for (let guard = 0; guard < 64 && this.t >= this.frame.d; guard++) moved += this.step(true);
      return moved * this.facing;
    }

    step(timed) {
      if (timed) this.t -= this.frame.d; else this.t = 0;
      const f = this.frame;
      const vx = this.reduced ? 0 : (f.vx !== undefined ? f.vx : this.anim.vx || 0);
      if (this.i < this.frames.length - 1) this.i++;
      else if (this.anim.loop) this.i = 0;
      else { this._emit('end'); this._set(this.queue.shift() || this.anim.next || 'idle'); return vx; }
      this._emit('frame');
      return vx;
    }

    pose() {
      const p = merge(this.frame);
      if (this.airOverride !== null && !this.reduced) p.air = Math.round(this.airOverride);
      if (this.blinkT >= 0 && p.eyes === 'open') p.eyes = this.blinkT < 50 || this.blinkT > 120 ? 'half' : 'closed';
      return p;
    }
    draw(ctx, x, y) { drawPose(ctx, this.pose(), x, y, this.facing < 0); }
  }

  root.SevnSprite = { C, FW, FH, AX, AY, ANIMS: A, LABELS, ARMS, Mascot, merge, renderFrame, drawPose, handY, headTop };
})(typeof window !== 'undefined' ? window : globalThis);
