import { Game, TOUCH } from './engine.js';
import { MAPS } from './maps.js';
import { talk, onStep, onMap, useItem, mark, flags } from './story.js';
import * as music from './music.js';

const game = new Game(document.getElementById('game'), MAPS, { talk, onStep, onMap, useItem, mark, onKey: music.onKey });
game.start();
window.game = game; window.flags = flags; // handy for poking around in the console

// On-screen pad (index.html, touch screens only): holding a button is holding the key. Pointer capture keeps the
// press until the finger lifts, even if it slides off the button; a second finger can press A while walking.
for (const b of document.querySelectorAll('#pad [data-key]')) {
  const k = b.dataset.key;
  b.addEventListener('pointerdown', (e) => {
    e.preventDefault(); b.classList.add('down'); game.press(k);
    try { b.setPointerCapture(e.pointerId); } catch { /* pointer already gone: the press still counts */ }
  });
  const up = () => { b.classList.remove('down'); game.release(k); };
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(ev, up);
  b.addEventListener('contextmenu', (e) => e.preventDefault());
}


game.overlay = {
  key(k) {
    if (k !== 'A') return; game.overlay = null; flags.start = performance.now(); const s = MAPS.street.spawn; game.loadMap('street', s.x, s.y, s.dir); game.highlightPlayer(); },
  draw(ctx, W, H) {
    ctx.fillStyle = '#0A7DA0'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#054B64'; ctx.fillRect(0, H - 80, W, 80);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF'; ctx.font = '44px "Bree Serif", serif'; ctx.fillText('First Day at <company>', W / 2, H / 2 - 60);
    ctx.font = '16px "Open Sans", sans-serif'; ctx.fillStyle = '#E3F6FB'; ctx.fillText('a tiny DevEx onboarding adventure', W / 2, H / 2 - 20);
    ctx.font = '13px "Press Start 2P", monospace'; ctx.fillStyle = '#FFD134';
    if (Math.floor(performance.now() / 500) % 2) ctx.fillText(TOUCH ? 'TAP A' : 'PRESS SPACE', W / 2, H / 2 + 50);
    ctx.fillStyle = '#A9E6F4'; ctx.font = '12px "Open Sans", sans-serif';
    ctx.fillText(TOUCH ? 'Arrows move · A talk · B back · MAP · ITEMS · MUSIC' : 'Arrows move · Space talk · X back · Tab map · I items · M music', W / 2, H - 40);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  },
};
