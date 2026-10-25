import { tile, person, OUTFITS, TILE } from './art.js';

const SCALE = 3, VW = 240, VH = 160, STEP = 2; // 16px per 8 frames, FireRed walking pace
export const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
// Letters match the printed key (e.key), so QWERTZ/AZERTY layouts work; other keys match the physical code.
// Confirm is Space or Enter only. Key* codes stay for synthetic events without a key.
const KEYMAP = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right',
  ' ': 'A', Enter: 'A', NumpadEnter: 'A', x: 'B', Escape: 'B', m: 'M', Tab: 'map', g: 'grid', i: 'items', t: 'T',
  KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right', Space: 'A', KeyX: 'B', KeyM: 'M', KeyG: 'grid', KeyI: 'items',
};
// Typed or pasted names: any visible character (letters, symbols, punctuation, emojis). Only invisible and
// control characters are dropped. Counted in visible characters (graphemes), so 👩‍💻 or a flag is one;
// at most 12, trimmed. Names are only drawn on the canvas, never put into HTML.
const graphemes = (s) => [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s)].map((x) => x.segment);
const nameChar = (c) => c === ' ' || !/^[\p{C}\s]+$/u.test(c);
const partialName = (s) => graphemes(graphemes(s.normalize('NFC')).filter(nameChar).join('').replace(/\s+/g, ' ').replace(/^ /, '')).slice(0, 12).join('');
export const cleanName = (s) => partialName(s).trim();
const keyOf = (e) => KEYMAP[e.key?.length === 1 ? e.key.toLowerCase() : e.code];
const FONT = '13px "Press Start 2P", monospace';
// A phone or tablet: index.html shows the on-screen pad, and hints talk about tapping instead of keys.
// Joystick drag (pixels from the centre) to one of the four walking directions, or null inside the dead zone.
export function stickDir(dx, dy, dead) {
  if (Math.hypot(dx, dy) < dead) return null;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}
export const TOUCH = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
// Press Start 2P has no ő ű Ő Ű: take the body of ó ú Ó Ú and draw its accent twice, side by side.
const ACUTE = { 'ő': 'ó', 'ű': 'ú', 'Ő': 'Ó', 'Ű': 'Ú' };
function pixelText(ctx, s, x, y) {
  if (!/[őűŐŰ]/.test(s)) return ctx.fillText(s, x, y);
  const chars = [...s], plain = chars.map((c) => (ACUTE[c] ? ' ' : c)).join('');
  ctx.fillText(plain, x, y);
  const u = parseFloat(ctx.font) / 8; // one font pixel; with textBaseline 'top' the accent is in the top two rows
  chars.forEach((c, i) => {
    if (!ACUTE[c]) return;
    const cx = x + ctx.measureText(plain.slice(0, i)).width; // monospace: index i starts at the width of the prefix
    const cut = Math.round(y + 2 * u); // whole pixel between the accents and the letter body
    ctx.save(); ctx.beginPath(); ctx.rect(cx, cut, 8 * u, 7 * u); ctx.clip(); ctx.fillText(ACUTE[c], cx, y); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(cx, y - u, 8 * u, cut - y + u); ctx.clip(); ctx.fillText(ACUTE[c], cx - u, y); ctx.fillText(ACUTE[c], cx + 2 * u, y); ctx.restore();
  });
}

export class Game {
  constructor(canvas, maps, hooks) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    canvas.width = VW * SCALE; canvas.height = VH * SCALE;
    this.maps = maps; this.hooks = hooks;
    this.keys = new Set(); this.pressed = [];
    this.dialog = null; this.menu = null; this.overlay = null; this.fadeAlpha = 0; this.busy = false; this.showMap = true; this.itemsView = 'mini'; this.hud = []; this.trail = [];
    this.scripted = false; // no player input while the story moves the player (a spotter walking up to you)
    this.player = { x: 0, y: 0, dir: 'down', ox: 0, oy: 0, frame: 0, outfit: OUTFITS.player, steps: 0 };
    addEventListener('keydown', (e) => {
      if (this.entry) { this.entryKey(e); return; }
      const k = keyOf(e); if (!k) return; e.preventDefault();
      if (e.repeat) this.keys.add(k); else this.press(k);
    });
    addEventListener('keyup', (e) => { const k = keyOf(e); if (k) this.release(k); });
    addEventListener('blur', () => this.keys.clear());
    addEventListener('paste', (e) => { if (!this.entry || e.target === this.textInput) return; e.preventDefault(); this.entryAdd(e.clipboardData?.getData('text') || ''); });
  }

  // The one way input gets in: keyboard and the on-screen touch pad both come through here. `pressed` holds
  // one-shot presses for this frame, `keys` what is held down (walking reads it).
  press(k) {
    if (this.entry) { if (k === 'A') this.entryConfirm(); return; } // the A button confirms a typed name
    this.pressed.push(k); this.hooks.onKey?.(k); this.keys.add(k);
  }
  release(k) { this.keys.delete(k); }

  start() { let last = 0; const loop = (t) => { if (t - last >= 15) { last = t; this.update(); this.draw(); } requestAnimationFrame(loop); }; requestAnimationFrame(loop); }

  loadMap(name, x, y, dir) {
    const m = this.maps[name]; if (!m) throw new Error('no map ' + name);
    this.map = m; this.mapName = name; this.minimap = null;
    Object.assign(this.player, { x, y, dir: dir || this.player.dir, ox: 0, oy: 0 });
    for (const n of m.npcs) { n.ox = 0; n.oy = 0; n.frame = 0; n.wait = 60 + Math.random() * 120; n.outfit ||= OUTFITS[n.look] || OUTFITS.dev; }
    this.hooks.onMap?.(name, this);
  }

  tileAt(x, y) {
    const row = this.map.rows[y]; if (row === undefined || x < 0 || x >= row.length) return null;
    return this.map.legend[row[x]] || this.map.legend[' '];
  }
  objectAt(x, y) { return this.map.objects.find((o) => o.x === x && o.y === y); }
  npcAt(x, y) { return this.map.npcs.find((n) => n.x === x && n.y === y); }
  walkable(x, y, who) {
    const t = this.tileAt(x, y); if (!t || t.solid) return false;
    const o = this.objectAt(x, y); if (o && (typeof o.solid === 'function' ? o.solid() : o.solid !== false)) return false;
    if (this.npcAt(x, y)) return false;
    if (who !== this.player && this.player.x === x && this.player.y === y) return false;
    if (who !== this.player && this.map.warps.some((w) => w.x === x && w.y === y)) return false;
    return true;
  }

  // Moves an entity one tile if free; returns true when it started moving.
  tryMove(e, dir) {
    e.dir = dir;
    const [dx, dy] = DIRS[dir];
    if (!this.walkable(e.x + dx, e.y + dy, e)) return false;
    e.x += dx; e.y += dy; e.ox = -dx * TILE; e.oy = -dy * TILE; return true;
  }
  tween(e) {
    if (!e.ox && !e.oy) return false;
    const sp = e.speed || STEP; // pixels per frame; a slower walker can set its own speed
    e.ox -= Math.sign(e.ox) * Math.min(Math.abs(e.ox), sp); e.oy -= Math.sign(e.oy) * Math.min(Math.abs(e.oy), sp);
    e.steps = (e.steps || 0) + 1; e.frame = Math.floor(e.steps / 8) % 2;
    return true;
  }

  update() {
    const p = this.player;
    if (this.pressed.includes('map')) { this.showMap = !this.showMap; this.minimap = null; }
    if (this.pressed.includes('grid')) this.showGrid = !this.showGrid;
    if (this.pressed.includes('items') && !this.dialog && !this.overlay && !this.entry && (!this.menu || this.menu.items)) this.cycleItems();
    this.pressed = this.pressed.filter((k) => k !== 'map' && k !== 'grid' && k !== 'items');
    if (this.overlay) { for (const k of this.pressed.splice(0)) this.overlay.key?.(k); return; }
    if (this.entry) { this.pressed.length = 0; return; }
    if (this.menu) { this.menuInput(); return; }
    if (this.dialog) { this.dialogInput(); this.tweenNpcs(); return; }
    if (this.fadeAlpha > 0 || this.busy) { this.pressed.length = 0; this.tweenNpcs(); return; }

    const moving = this.tween(p);
    if (!moving) {
      p.frame = 0;
      this.spotCheck(); // standing still in someone's view counts too
      const pressed = this.pressed.splice(0);
      if (this.scripted) return this.tweenNpcs();
      if (pressed.includes('A')) this.interact();
      else {
        const dir = ['up', 'down', 'left', 'right'].find((d) => this.keys.has(d));
        if (dir) this.tryMove(p, dir);
      }
    } else if (!p.ox && !p.oy) {
      this.trail = this.trail.filter((t) => t.m !== this.map || Math.abs(t.x - p.x) > 1 || Math.abs(t.y - p.y) > 1); // footprints next to you (or under you) fade
      const w = this.map.warps.find((w) => w.x === p.x && w.y === p.y);
      if (w) this.warp(w); else { this.hooks.onStep?.(this); this.spotCheck(); }
    }
    this.tweenNpcs();
  }

  tweenNpcs() {
    for (const n of this.map.npcs) {
      if (this.tween(n)) continue;
      n.frame = n.frenzy ? Math.floor(performance.now() / 90) % 2 : 0; // frantic typing
      if (!n.wander || this.dialog || this.busy) continue;
      if (--n.wait > 0) continue;
      n.wait = 60 + Math.random() * 180;
      const dir = Object.keys(DIRS)[Math.floor(Math.random() * 4)];
      const [dx, dy] = DIRS[dir];
      if (Math.abs(n.x + dx - n.home[0]) <= n.wander && Math.abs(n.y + dy - n.home[1]) <= n.wander) this.tryMove(n, dir); else n.dir = dir;
    }
  }

  interact() {
    const [dx, dy] = DIRS[this.player.dir];
    const x = this.player.x + dx, y = this.player.y + dy;
    const n = this.npcAt(x, y);
    if (n) {
      const was = n.dir;
      if (!n.busy && !n.frenzy) n.dir = { up: 'down', down: 'up', left: 'right', right: 'left' }[this.player.dir];
      const { x: nx, y: ny, dir: faced } = n;
      // after the chat they go back to their screen; not if the talk sent them walking somewhere
      Promise.resolve(this.hooks.talk(n, this)).then(() => { if (n.x === nx && n.y === ny && n.dir === faced) n.dir = was; });
      return;
    }
    const o = this.objectAt(x, y);
    if (o) return this.hooks.talk(o, this);
    const t = this.tileAt(x, y);
    if (t?.solid) this.hooks.talk({ id: 'tile', tile: t.t, x, y }, this);
  }

  async warp(w) {
    if (w.when) { const r = w.when(); if (r !== true) { this.player.x -= DIRS[this.player.dir][0]; this.player.y -= DIRS[this.player.dir][1]; if (typeof r === 'string') await this.say(r); return; } }
    await this.fade(true);
    this.loadMap(w.to, w.tx, w.ty, w.dir);
    await this.fade(false);
  }

  fade(out) {
    return new Promise((res) => {
      this.busy = true;
      const tick = () => { this.fadeAlpha += out ? 0.1 : -0.1; if (this.fadeAlpha > 0 && this.fadeAlpha < 1) requestAnimationFrame(tick); else { this.fadeAlpha = out ? 1 : 0; this.busy = false; res(); } };
      tick();
    });
  }
  wait(ms) { this.busy = true; return new Promise((r) => setTimeout(() => { this.busy = false; r(); }, ms)); }

  // ---- dialog -------------------------------------------------------------
  // Dialogs queue: a say() while one is open shows after it, so no caller's promise is ever dropped.
  say(text) {
    const pages = wrap(text, 40, 3);
    const show = () => new Promise((res) => { this.dialog = { pages, page: 0, shown: 0, res }; });
    this.dialogQueue = (this.dialogQueue || Promise.resolve()).then(show);
    return this.dialogQueue;
  }
  dialogInput() {
    const d = this.dialog, cur = d.pages[d.page].join('\n');
    if (d.shown < cur.length) d.shown += 2;
    for (const k of this.pressed.splice(0)) {
      if (k === 'up') { if (d.page > 0) { d.page--; d.shown = Infinity; this.hooks.onKey?.('blip'); } continue; } // back a page, shown at once
      if (k !== 'A' && k !== 'B' && k !== 'down') continue;
      this.hooks.onKey?.('blip');
      if (d.shown < cur.length) { d.shown = cur.length; continue; }
      if (++d.page >= d.pages.length) { this.dialog = null; d.res(); return; }
      d.shown = 0;
    }
  }
  // Text entry box; resolves with the cleaned text (or `fallback` when empty) on Enter.
  // A hidden text field takes focus while the name box is open. The game is a canvas, so without it the
  // browser has nowhere to paste and the system emoji picker or an IME has nowhere to type.
  ask(prompt, fallback) {
    this.keys.clear();
    const ta = this.textInput || this.makeTextInput();
    ta.value = ''; ta.focus();
    return new Promise((res) => { this.entry = { prompt, text: '', fallback, res }; });
  }
  makeTextInput() {
    const ta = this.textInput = document.createElement('textarea');
    ta.setAttribute('aria-label', 'Your name'); ta.autocomplete = 'off'; ta.spellcheck = false;
    ta.style.cssText = 'position:fixed;left:-1000px;top:0;width:10px;height:10px;opacity:0';
    document.body.append(ta);
    const take = () => { if (this.entry && ta.value) this.entryAdd(ta.value); ta.value = ''; };
    ta.addEventListener('input', (e) => { if (!e.isComposing) take(); });
    ta.addEventListener('compositionend', take);
    this.canvas.addEventListener('pointerdown', (e) => { if (this.entry) { e.preventDefault(); ta.focus(); } }); // in the tap itself, or iOS keeps its keyboard closed
    return ta;
  }
  entryKey(e) {
    const en = this.entry;
    // Ctrl/Cmd shortcuts such as Ctrl+V must reach the browser so the paste event fires. AltGr (reported as
    // Ctrl+Alt, used for $ * > ; ß on Hungarian keyboards) is typing, not a shortcut.
    if (e.isComposing) return;
    if (e.key === 'Tab') { e.preventDefault(); return; }
    if (e.key === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); this.entryConfirm(); return; }
    if (e.key === 'Backspace') { e.preventDefault(); en.text = graphemes(en.text).slice(0, -1).join(''); return; }
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.getModifierState?.('AltGraph')) return;
    if (this.textInput && document.activeElement === this.textInput) return; // the hidden field receives the text
    e.preventDefault(); // fallback when the field lost focus: take the key directly
    if (e.key?.length >= 1 && graphemes(e.key).length === 1) this.entryAdd(e.key);
  }
  entryConfirm() {
    const en = this.entry; if (!en) return;
    this.entry = null; this.textInput?.blur(); this.hooks.onKey?.('blip'); en.res(cleanName(en.text) || en.fallback);
  }
  entryAdd(text) { this.entry.text = partialName(this.entry.text + text); }
  drawEntry() {
    const { ctx } = this, en = this.entry, W = VW * SCALE, H = VH * SCALE;
    this.box(60, H / 2 - 80, W - 120, 160);
    ctx.font = FONT; ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.fillStyle = '#3A3A3A';
    pixelText(ctx, en.prompt, 84, H / 2 - 56);
    ctx.fillStyle = '#E3F6FB'; ctx.fillRect(84, H / 2 - 20, W - 168, 40);
    ctx.fillStyle = '#054B64'; ctx.font = '16px "Press Start 2P", monospace';
    const cursor = Math.floor(performance.now() / 400) % 2 ? '_' : ' ';
    pixelText(ctx, en.text + cursor, 96, H / 2 - 9);
    ctx.font = '10px "Press Start 2P", monospace'; ctx.fillStyle = '#5B6166';
    ctx.fillText(TOUCH ? 'Tap here to type · A confirms' : 'Type your name · Backspace deletes · Enter confirms', 84, H / 2 + 40); // pasting emojis is an easter egg, so no hint
  }
  // Choice menu; `prompt` stays visible in the dialog box while choosing.
  choose(options, prompt) { return new Promise((res) => { this.menu = { options, i: 0, res, prompt }; }); }
  addNpc(mapName, n) {
    Object.assign(n, { ox: 0, oy: 0, frame: 0, wait: 0, home: [n.x, n.y] });
    n.outfit ||= OUTFITS[n.look] || OUTFITS.dev;
    this.maps[mapName].npcs.push(n);
  }
  // Scripted walk for an NPC on map `m` to `to` ([x, y] or a function returning it, re-planned every step).
  // With `near`, stops next to the target. Pauses while the player is elsewhere or reading a dialog.
  async walkNpc(m, n, to, { near = false, trail = false } = {}) {
    for (let tries = 0; tries < 3000;) {
      const [tx, ty] = typeof to === 'function' ? to() : to;
      const dist = Math.abs(n.x - tx) + Math.abs(n.y - ty);
      if (near ? dist <= 1 : dist === 0) return;
      if (this.map !== m || this.dialog || this.menu || this.overlay || this.entry || this.busy) { await sleep(100); continue; } // paused, not a try
      const dir = findStep([n.x, n.y], [tx, ty], (x, y) => this.walkable(x, y, n));
      const from = { m, x: n.x, y: n.y };
      if (!dir || !this.tryMove(n, dir)) { tries++; await sleep(200); continue; }
      if (trail) this.trail.push(from); // golden footprints to follow
      while (n.ox || n.oy) await sleep(16);
    }
  }
  // I cycles: small list in the corner -> item menu (pick one to look at it) -> hidden -> small list again.
  cycleItems() {
    if (this.itemsView === 'menu') { const m = this.menu; this.menu = null; m?.res(-1); this.itemsView = 'hidden'; return; }
    if (this.itemsView === 'hidden') { this.itemsView = 'mini'; return; }
    if (!this.hud.length) { this.itemsView = 'hidden'; return; }
    this.itemsView = 'menu';
    const items = [...this.hud];
    this.choose([...items.map((h) => h.text), 'Close'], 'Your items: pick one to take a look.').then((i) => {
      if (this.itemsView !== 'menu') return; // closed with I instead
      this.itemsView = 'mini';
      if (i >= 0 && i < items.length) this.hooks.useItem?.(items[i], this);
    });
    this.menu.items = true; // marks the item menu, so I can close it
  }
  menuInput() {
    const m = this.menu;
    for (const k of this.pressed.splice(0)) {
      if (k === 'up') m.i = (m.i + m.options.length - 1) % m.options.length;
      if (k === 'down') m.i = (m.i + 1) % m.options.length;
      if (k === 'A') { this.menu = null; this.hooks.onKey?.('blip'); m.res(m.i); return; }
    }
  }

  // ---- drawing ------------------------------------------------------------
  draw() {
    const { ctx, map } = this;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#1E2A33'; ctx.fillRect(0, 0, VW * SCALE, VH * SCALE);
    if (map) this.drawWorld();
    if (map && this.showGrid) this.drawGrid();
    if (map && this.showMap && !this.menu) this.drawMinimap();
    if (this.itemsView === 'mini' && !this.dialog && !this.overlay) this.drawHud();
    if (this.timer && !this.overlay) { // a running stopwatch, e.g. how long HR has been chasing you
      const secs = ((performance.now() - this.timer.from) / 1000).toFixed(1);
      this.box(8, 8, 230, 40); ctx.font = FONT; ctx.fillStyle = '#E65038'; ctx.textBaseline = 'top'; pixelText(ctx, `${this.timer.label}: ${secs}s`, 20, 21);
    }
    this.overlay?.draw?.(ctx, VW * SCALE, VH * SCALE);
    if (this.dialog) this.drawDialog();
    if (this.menu) this.drawMenu();
    if (this.entry) this.drawEntry();
    if (this.fadeAlpha > 0) { ctx.fillStyle = `rgba(0,0,0,${this.fadeAlpha})`; ctx.fillRect(0, 0, VW * SCALE, VH * SCALE); }
  }
  drawWorld() {
    const { ctx, map, player: p } = this;
    const mw = map.rows[0].length * TILE, mh = map.rows.length * TILE;
    const cam = {
      x: mw <= VW ? (mw - VW) / 2 : clamp(p.x * TILE + p.ox + 8 - VW / 2, 0, mw - VW),
      y: mh <= VH ? (mh - VH) / 2 : clamp(p.y * TILE + p.oy + 8 - VH / 2, 0, mh - VH),
    };
    this.cam = cam;
    ctx.save(); ctx.scale(SCALE, SCALE); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
    const x0 = Math.max(0, Math.floor(cam.x / TILE)), y0 = Math.max(0, Math.floor(cam.y / TILE));
    for (let y = y0; y <= Math.min(map.rows.length - 1, y0 + VH / TILE + 1); y++)
      for (let x = x0; x <= Math.min(map.rows[0].length - 1, x0 + VW / TILE + 1); x++) {
        const t = this.tileAt(x, y);
        ctx.drawImage(tile(t.t), x * TILE, y * TILE);
      }
    for (const o of map.objects) if (o.tile) ctx.drawImage(tile(o.tile), o.x * TILE, o.y * TILE);
    const now = performance.now();
    for (const [i, t] of this.trail.entries()) {
      if (t.m !== map) continue;
      const a = 0.55 + 0.45 * Math.sin(now / 180 - i * 0.6), cx = t.x * TILE + 8, cy = t.y * TILE + 8;
      ctx.fillStyle = `rgba(255, 209, 52, ${a})`; ctx.fillRect(cx - 2, cy - 2, 4, 4);
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`; ctx.fillRect(cx - 1, cy - 4, 2, 2); ctx.fillRect(cx + 2, cy + 1, 1, 1);
    }
    ctx.font = 'bold 7px monospace'; ctx.textBaseline = 'top'; ctx.fillStyle = '#FFD134';
    for (const o of map.objects) if (o.label) ctx.fillText(o.label, o.x * TILE + 5, o.y * TILE + 1);
    for (const o of map.objects) if (o.banner) this.drawBanner(o);
    const people = [...map.npcs, p].sort((a, b) => a.y * TILE + a.oy - (b.y * TILE + b.oy));
    for (const e of people) ctx.drawImage(person(e.dir, e.frame, e.outfit), e.x * TILE + e.ox + 2, e.y * TILE + e.oy - 4);
    for (const n of map.npcs) if (n.frenzy) this.drawFrenzy(n);
    for (const n of map.npcs) if (n.alertUntil > now || this.hooks.mark?.(n)) { // "!": a colleague noticed you, or has something for you
      const x = n.x * TILE + n.ox + 4, y = n.y * TILE + n.oy - 14;
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, 8, 9); ctx.fillStyle = '#054B64'; ctx.fillRect(x, y + 9, 8, 1);
      ctx.fillStyle = '#E65038'; ctx.fillRect(x + 3, y + 1, 2, 5); ctx.fillRect(x + 3, y + 7, 2, 1);
    }
    if (this.spotlight && now < this.spotlight.until) this.drawSpotlight(now);
    ctx.restore();
  }
  // Grid with tile coordinates, for realigning the maps by hand.
  drawGrid() {
    const { ctx, map, player: p } = this, cam = this.cam;
    ctx.save(); ctx.scale(SCALE, SCALE); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
    ctx.strokeStyle = 'rgba(230,80,56,0.5)'; ctx.lineWidth = 0.5; ctx.font = '4px monospace'; ctx.fillStyle = '#E65038';
    const x0 = Math.floor(cam.x / TILE), y0 = Math.floor(cam.y / TILE);
    for (let y = y0; y <= y0 + VH / TILE + 1; y++) for (let x = x0; x <= x0 + VW / TILE + 1; x++) {
      ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
      if (x % 5 === 0 && y % 5 === 0) ctx.fillText(`${x},${y}`, x * TILE + 1, y * TILE + 5);
    }
    ctx.restore();
    this.box(8, 8, 300, 40); ctx.font = FONT; ctx.fillStyle = '#3A3A3A'; ctx.textBaseline = 'top';
    ctx.fillText(`${this.mapName} ${p.x},${p.y} '${map.rows[p.y][p.x]}'`, 20, 20);
  }
  // Whole current map at 3px per tile; built when toggled on so it stays cheap.
  drawMinimap() {
    const { ctx, map } = this, w = map.rows[0].length, h = map.rows.length;
    const S = Math.min(2, 110 / w, 90 / h); // at most ~110x90 screen px, so it never covers the view
    if (!this.minimap) {
      const c = document.createElement('canvas'); c.width = w; c.height = h; const m = c.getContext('2d');
      const COL = { black: null, wall: '#054B64', glass: '#3EB1CC', gdoor: '#3EB1CC', door: '#A8763E', lift: '#8A8F94', liftOpen: '#FFD134', kitchen: '#CFC3A8', chill: '#D7C7E8', road: '#4A4D52', street: '#4A4D52', pave: '#CFC3A8', grass: '#48BF86', facade: '#C9CDD1', facadeTop: '#8A8F94', ground: '#A9E6F4', water: '#3EB1CC' };
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const [base, obj] = this.tileAt(x, y).t.split('+');
        const col = obj ? '#8A8F94' : COL[base] === undefined ? '#E3F6FB' : COL[base];
        if (col) { m.fillStyle = col; m.fillRect(x, y, 1, 1); }
      }
      this.minimap = c;
    }
    const mw = Math.round(w * S), mh = Math.round(h * S), x0 = VW * SCALE - mw - 14, y0 = 12;
    ctx.fillStyle = 'rgba(5,75,100,0.85)'; ctx.fillRect(x0 - 4, y0 - 4, mw + 8, mh + 8);
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(this.minimap, x0, y0, mw, mh); ctx.restore();
    if (Math.floor(performance.now() / 300) % 2) { ctx.fillStyle = '#E65038'; ctx.fillRect(x0 + this.player.x * S - 2, y0 + this.player.y * S - 2, Math.max(4, S + 2), Math.max(4, S + 2)); }
  }
  // Pokémon-style spotters: an NPC with `spot: n` notices you up to n tiles in front of it (a 3-tile wide band,
  // walls block the view), shows a "!", walks up to you and starts talking. Once per NPC.
  spotCheck() {
    if (this.noSpotters || this.scripted || this.dialog || this.menu || this.overlay || this.entry) return; // noSpotters: e.g. while HR chases you
    const p = this.player;
    for (const n of this.map.npcs) {
      if (!n.spot) continue;
      if (n.spotted) { if (n.spotAgainAt && performance.now() > n.spotAgainAt) n.spotted = false; else continue; } // a spotter with a cooldown can notice you again
      const [dx, dy] = DIRS[n.dir];
      for (const o of [-1, 0, 1]) for (let k = 1; k <= n.spot; k++) {
        const x = n.x + dx * k + (dy ? o : 0), y = n.y + dy * k + (dx ? o : 0);
        if (this.tileAt(x, y)?.solid !== false) break;
        if (x === p.x && y === p.y) return this.spotted(n);
      }
    }
  }
  async spotted(n) {
    n.spotted = true; n.alertUntil = performance.now() + 900; this.scripted = true; this.keys.clear();
    this.hooks.onKey?.('ding');
    await sleep(900);
    // shortcut: if the way is blocked for 6 s they talk from where they are; fine for open corridors
    await Promise.race([this.walkNpc(this.map, n, () => [this.player.x, this.player.y], { near: true }), sleep(6000)]);
    const face = (a, b) => (b.x > a.x ? 'right' : b.x < a.x ? 'left' : b.y > a.y ? 'down' : 'up');
    n.dir = face(n, this.player); this.player.dir = face(this.player, n);
    this.scripted = false;
    this.hooks.talk(n, this);
  }
  // "This is you": a pulsing golden ring and a bouncing arrow over the player, fading out at the end.
  highlightPlayer(ms = 1500) { this.spotlight = { until: performance.now() + ms }; }
  drawSpotlight(now) {
    const { ctx, player: p } = this, left = this.spotlight.until - now;
    const a = Math.min(1, left / 900), cx = p.x * TILE + p.ox + 8, cy = p.y * TILE + p.oy + 6;
    const pulse = Math.sin(now / 150), bounce = Math.abs(Math.sin(now / 220)) * 3;
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = '#FFD134'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, 11 + pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#E65038'; ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 20 - bounce); ctx.lineTo(cx + 4, cy - 20 - bounce); ctx.lineTo(cx, cy - 15 - bounce); ctx.fill();
    ctx.font = '6px "Press Start 2P", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#054B64'; ctx.lineWidth = 2; ctx.strokeText('YOU', cx, cy - 21 - bounce); ctx.fillText('YOU', cx, cy - 21 - bounce);
    ctx.restore(); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  }
  // The screen in front of a frantic typer flickers with scrolling coloured lines; keystroke sparks fly.
  drawFrenzy(n) {
    const { ctx } = this, [dx, dy] = DIRS[n.dir], t = Math.floor(performance.now() / 70);
    const sx = (n.x + dx) * TILE, sy = (n.y + dy) * TILE;
    const COLS = ['#48BF86', '#E65038', '#FFD134', '#3EB1CC', '#FFFFFF'];
    for (let i = 0; i < 4; i++) { ctx.fillStyle = COLS[(t + i * 3) % COLS.length]; ctx.fillRect(sx + 5, sy + 5 + i * 2, 2 + ((t * 7 + i * 5) % 6), 1); }
    ctx.fillStyle = '#FFD134';
    for (let i = 0; i < 2; i++) ctx.fillRect(n.x * TILE + 4 + ((t * 5 + i * 7) % 9), n.y * TILE - 6 - ((t + i * 3) % 4), 1, 1);
  }
  // A sign spanning several tiles, text in Bree Serif.
  drawBanner(o) {
    const { ctx } = this, b = o.banner, x = o.x * TILE, y = o.y * TILE, w = b.w * TILE;
    ctx.fillStyle = '#054B64'; ctx.fillRect(x, y + 1, w, TILE - 2);
    ctx.fillStyle = b.bg || '#FFFFFF'; ctx.fillRect(x + 1, y + 2, w - 2, TILE - 4);
    ctx.fillStyle = b.fg || '#0A7DA0'; ctx.font = 'bold 9px "Bree Serif", serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(b.text, x + 4, y + TILE / 2 + 1, w - 7);
    ctx.textBaseline = 'top';
  }
  // Inventory corner: the one item the story hands out.
  drawHud() {
    const { ctx } = this, H = VH * SCALE;
    if (!this.hud.length) return;
    this.box(8, H - 16 - 36 * this.hud.length, 210, 8 + 36 * this.hud.length);
    this.hud.forEach((it, i) => {
      const y = H - 8 - 36 * (this.hud.length - i);
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(tile(it.tile), 18, y, 28, 28); ctx.restore();
      ctx.font = FONT; ctx.fillStyle = '#3A3A3A'; ctx.textBaseline = 'top'; pixelText(ctx, it.text, 54, y + 8);
    });
  }
  box(x, y, w, h) {
    const { ctx } = this;
    ctx.fillStyle = '#054B64'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#0A7DA0'; ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 6, y + 6, w - 12, h - 12);
  }
  drawDialog() {
    const { ctx } = this, d = this.dialog, W = VW * SCALE, H = VH * SCALE;
    this.box(8, H - 108, W - 16, 100);
    ctx.fillStyle = '#3A3A3A'; ctx.font = FONT; ctx.textBaseline = 'top';
    const page = d.pages[d.page].join('\n'), cut = [...page].slice(0, d.shown).join(''); // whole characters only
    const text = (d.shown >= page.length ? page : cut).split('\n');
    text.forEach((line, i) => pixelText(ctx, line, 28, H - 88 + i * 26));
    if (d.shown >= d.pages[d.page].join('\n').length && Math.floor(performance.now() / 400) % 2) {
      ctx.fillStyle = '#E65038'; ctx.beginPath(); ctx.moveTo(W - 44, H - 30); ctx.lineTo(W - 28, H - 30); ctx.lineTo(W - 36, H - 20); ctx.fill();
    }
  }
  drawMenu() {
    const { ctx } = this, m = this.menu, W = VW * SCALE, H = VH * SCALE;
    if (m.prompt) {
      this.box(8, H - 108, W - 16, 100);
      ctx.fillStyle = '#3A3A3A'; ctx.font = FONT; ctx.textBaseline = 'top';
      wrap(m.prompt, 40, 3)[0].forEach((line, i) => pixelText(ctx, line, 28, H - 88 + i * 26));
    }
    const w = 40 + Math.max(...m.options.map((o) => o.length)) * 14, h = 28 + m.options.length * 28;
    this.box(W - w - 8, 8, w, h);
    ctx.font = FONT; ctx.textBaseline = 'top';
    m.options.forEach((o, i) => { ctx.fillStyle = i === m.i ? '#E65038' : '#3A3A3A'; pixelText(ctx, (i === m.i ? '> ' : '  ') + o, W - w + 6, 22 + i * 28); });
  }
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// First direction of a shortest path from `from` to `to` over tiles where ok(x, y) holds (breadth-first).
// The target tile itself may be occupied, so a walker can head for a person. Null when there is no path.
export function findStep(from, to, ok, limit = 6000) {
  const key = (x, y) => x + ',' + y, prev = new Map([[key(...from), null]]), q = [from];
  while (q.length && prev.size < limit) {
    const [x, y] = q.shift();
    if (x === to[0] && y === to[1]) {
      let k = key(x, y), step = null;
      while (prev.get(k)) { const [px, py, d] = prev.get(k); step = d; k = key(px, py); }
      return step;
    }
    for (const [d, [dx, dy]] of Object.entries(DIRS)) {
      const nx = x + dx, ny = y + dy, k = key(nx, ny);
      if (prev.has(k) || !(ok(nx, ny) || (nx === to[0] && ny === to[1]))) continue;
      prev.set(k, [x, y, d]); q.push([nx, ny]);
    }
  }
  return null;
}

// Splits text into pages of `lines` lines, each at most `cols` chars; "\n" forces a page break.
export function wrap(text, cols, lines) {
  const pages = [];
  for (const para of [].concat(text).join('\n').split('\n')) {
    const out = []; let line = '';
    for (const w of para.split(' ')) {
      if ((line + ' ' + w).trim().length > cols) { out.push(line.trim()); line = ''; }
      line += ' ' + w;
    }
    out.push(line.trim());
    for (let i = 0; i < out.length; i += lines) pages.push(out.slice(i, i + lines));
  }
  return pages;
}
