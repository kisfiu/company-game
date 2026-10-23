// Pure data: ASCII maps, legend, warps, NPCs and objects. Talk handlers live in story.js keyed by id.
import { OFFICE, OFFICE_PLATES } from './office-map.js';
const T = (t, solid) => ({ t, solid: !!solid });
export const LEGEND = {
  ' ': T('black', 1), '.': T('floor'), 'k': T('kitchen'), 'c': T('chill'),
  '#': T('wall', 1), '=': T('glass', 1), 'g': T('gdoor'), 'E': T('lift', 1), 'e': T('liftOpen'), // an open lift: walk in to ride
  'r': T('road'), '-': T('street'), '_': T('pave'), '"': T('grass'), 'F': T('facade', 1), 'f': T('facadeTop', 1), 'G': T('ground', 1), '~': T('water', 1),
  'd': T('floor+desk', 1), 'm': T('floor+monitor', 1), 'h': T('floor+chair'), 'p': T('floor+plant', 1), 'L': T('floor+locker', 1),
  'W': T('floor+board', 1), 'n': T('floor+panel', 1), 'v': T('floor+server', 1), 'q': T('floor+recdesk', 1),
  'M': T('floor+massage', 1), 'A': T('floor+laptop', 1), 'B': T('wall+bell', 1),
  'C': T('kitchen+coffee', 1), 'R': T('kitchen+fridge', 1), 'T': T('kitchen+table', 1), 'K': T('kitchen+chair'), 'I': T('floor+rail', 1), 'X': T('door', 1), '^': T('floor+books', 1), '&': T('kitchen+water', 1), '!': T('wall+redlight', 1), '|': T('floor+railV', 1), 'H': T('gdoor+barrier', 1), '%': T('floor+pastry', 1), 'O': T('kitchen+snacks', 1), 'o': T('floor+toilet', 1), 'i': T('floor+sink', 1), 'w': T('wall+window', 1), 'j': T('chill+fern', 1), 'J': T('pave+plant', 1), 'N': T('floor+laptopBlack', 1), 'U': T('floor+laptopBlue', 1),
  'S': T('chill+sofa', 1), 'P': T('chill+pinball', 1), 'Q': T('chill+table', 1), 'Y': T('floor+table', 1), 'Z': T('floor+sofa', 1), 'V': T('chill+tv', 1), 'a': T('kitchen+cabinet', 1),
  's': T('pave+sign', 1), 't': T('grass+tree', 1), 'b': T('pave+bench', 1), 'u': T('grass+bench', 1),
};

// ---- small maps, hand drawn ------------------------------------------------
// Street: the U-shaped Corvin Innovation Campus seen from above, open to Szigony utca,
// inner garden in the courtyard, a single entrance in the base of the U.
const streetRows = (() => {
  const W = 40, wing = (mid) => 'F'.repeat(9) + mid + 'F'.repeat(9);
  const garden = [
    '"t""""""""__"""""""""t"',
    '""u"""""""__"""""""u""',
    '"""""~~"""__""""""""""',
    '"""""~~"""__"""""t""""',
    '"t"""""u""__""u"""""""t',
    '""""""""""__""""""""""',
  ].map((r) => { const c = r.slice(0, 22).padEnd(22, '"').split(''); c[9] = c[10] = c[11] = '_'; return c.join(''); });
  const base = 'G'.repeat(22).split(''); base[9] = base[10] = base[11] = 'g'; // three-door entrance
  return [
    'f'.repeat(W), 'F'.repeat(W), 'F'.repeat(W), 'F'.repeat(W),
    wing(base.join('')),
    ...garden.slice(0, 5).map(wing),
    'G'.repeat(9) + garden[5] + 'G'.repeat(9),
    '_'.repeat(21) + 's' + '_'.repeat(18),
    '_'.repeat(W),
    'r'.repeat(W), '-'.repeat(W), 'r'.repeat(W),
    '_'.repeat(W),
    '"t'.repeat(W / 2),
  ];
})();
const street = {
  rows: streetRows,
  spawn: { x: 38, y: 12, dir: 'left' }, // off the M3 at the right end of the street, facing the building
  warps: [18, 19, 20].map((x) => ({ x, y: 4, to: 'lobby', tx: 17, ty: 8, dir: 'up' })),
  npcs: [
    { id: 'smoker1', x: 7, y: 11, look: 'street', dir: 'right' },
    { id: 'smoker2', x: 8, y: 12, look: 'dev', dir: 'up' },
    { id: 'smoker3', x: 32, y: 11, look: 'finance', dir: 'left' },
    { id: 'worker', x: 35, y: 11, look: 'worker', dir: 'down' },
    { id: 'benchSmoker', x: 28, y: 6, look: 'street', dir: 'down' }, // sitting on the bench in the front garden
    { id: 'passerby', x: 14, y: 12, look: 'chat', dir: 'down', wander: 2 },
    { id: 'gardener', x: 25, y: 7, look: 'tester', dir: 'left', wander: 2 },
    { id: 'tourist', x: 28, y: 16, look: 'manager', dir: 'up', wander: 2 },
  ],
  objects: [
    { id: 'signMain', x: 21, y: 11 },
    { id: 'entrance', x: 18, y: 3, banner: { w: 3, text: 'ENTRANCE', bg: '#FFD134', fg: '#054B64' } },
    { id: 'signCompany', x: 21, y: 4, banner: { w: 4, text: '<company>' } },
    { id: 'metro', x: 39, y: 12, tile: 'pave+sign' },
  ],
};

// Ground floor, built in code: one screen tall, so from the entrance you see the courtyard door ahead and
// the security booth on the left. Our lift hall (A-D) is behind the booth past a rail with a QR gate; the
// BÜFÉ is in the south-east corner and the other tenants' lifts (E, F) are on the east wall behind a rail.
const lobbyRows = (() => {
  const W = 32, H = 10, g = Array.from({ length: H }, () => Array(W).fill(' '));
  const put = (x, y, c) => { g[y][x] = c; };
  for (let y = 0; y < H; y++) for (let x = 10; x < W; x++) g[y][x] = y === 0 || y === H - 1 || x === 10 || x === W - 1 ? '#' : '.';
  // our lift hall: A, B on the top wall, C, D on the bottom wall
  for (let y = 2; y <= 7; y++) for (let x = 0; x <= 10; x++) g[y][x] = y === 2 || y === 7 || x === 0 ? '#' : '.';
  put(2, 2, 'E'); put(3, 2, 'n'); put(4, 2, 'E'); put(2, 7, 'E'); put(3, 7, 'n'); put(4, 7, 'E');
  put(10, 3, '|'); put(10, 6, '|');                                  // rail; the gate is at y 4-5
  // security booth: guards inside, counter facing east
  for (let x = 11; x <= 13; x++) put(x, 6, '=');
  put(11, 7, '='); put(11, 8, '='); put(13, 7, 'q'); put(13, 8, 'q');
  put(17, 9, 'g'); put(18, 9, 'g');                                   // entrance
  for (let x = 16; x <= 19; x++) put(x, 0, 'H');                     // courtyard door, closed for construction
  // BÜFÉ: L-shaped counter in the south-east corner
  for (let y = 6; y <= 8; y++) put(26, y, '%');
  for (let x = 26; x <= 30; x++) put(x, 6, '%');
  // other tenants' lifts E and F, closed off by a rail
  put(31, 2, 'E'); put(31, 3, 'n'); put(31, 4, 'E');
  put(29, 2, '|'); put(29, 4, '|'); put(29, 1, 'I'); put(30, 1, 'I'); put(29, 5, 'I'); put(30, 5, 'I');
  put(11, 1, 'p'); put(25, 8, 'p');
  return g.map((r) => r.join(''));
})();
const lobby = {
  rows: lobbyRows,
  warps: [
    { x: 17, y: 9, to: 'street', tx: 19, ty: 5, dir: 'down' },
    { x: 18, y: 9, to: 'street', tx: 19, ty: 5, dir: 'down' },
  ],
  npcs: [
    { id: 'guard1', x: 12, y: 8, look: 'guard', dir: 'right' },
    { id: 'guard2', x: 12, y: 7, look: 'guard', dir: 'right' },
    { id: 'barista', x: 28, y: 7, look: 'coffee', dir: 'up' },
    { id: 'visitor', x: 21, y: 6, look: 'chat', dir: 'up', wander: 2 },
    { id: 'grumpy', x: 16, y: 2, look: 'dev', dir: 'up' },
    { id: 'doorWorker', x: 18, y: 1, look: 'worker', dir: 'up', busy: true }, // fixing the courtyard door, back to you
    { id: 'tenant', x: 27, y: 3, look: 'manager', dir: 'right' },
  ],
  objects: [
    { id: 'securityDesk', x: 13, y: 7 }, { id: 'securityDesk', x: 13, y: 8 },
    { id: 'gate', x: 10, y: 4, tile: 'floor+gateV' }, { id: 'gate', x: 10, y: 5, tile: 'floor+gateV' },
    { id: 'rail', x: 10, y: 3 }, { id: 'rail', x: 10, y: 6 },
    { id: 'liftA', x: 2, y: 2, label: 'A' }, { id: 'liftB', x: 4, y: 2, label: 'B' }, { id: 'liftC', x: 2, y: 7, label: 'C' }, { id: 'liftD', x: 4, y: 7, label: 'D' },
    { id: 'panel', x: 3, y: 2 }, { id: 'panel', x: 3, y: 7 },
    ...[6, 7, 8].map((y) => ({ id: 'buffet', x: 26, y })), ...[27, 28, 29, 30].map((x) => ({ id: 'buffet', x, y: 6 })),
    { id: 'buffetSign', x: 27, y: 9, banner: { w: 3, text: 'BÜFÉ', bg: '#FFD134', fg: '#054B64' } },
    ...[16, 17, 18, 19].map((x) => ({ id: 'courtyardDoor', x, y: 0 })),
    { id: 'otherLift', x: 31, y: 2, label: 'E' }, { id: 'otherLift', x: 31, y: 4, label: 'F' }, { id: 'otherPanel', x: 31, y: 3 },
    { id: 'otherGate', x: 29, y: 3, tile: 'floor+gateRed' },
    { id: 'otherSign', x: 27, y: 0, banner: { w: 4, text: 'Tenants only', bg: '#E3F6FB', fg: '#5B6166' } },
  ],
};

// Floor 3 lift hall, turned like the one downstairs: lifts on the top and bottom walls, the glass door
// and the bell on the east wall towards the office.
const elevators3 = {
  rows: [
    '###EnE####',
    '#........#',
    'g........g',
    '#........B',
    '#........#',
    '###EnE####',
  ],
  warps: [
    { x: 9, y: 2, to: 'office', tx: 55, ty: 28, dir: 'right', when: 'buzzed' },
    { x: 0, y: 2, to: 'office', tx: 47, ty: 22, dir: 'left', when: 'trained' }, // west door: your badge opens it after HR training
  ],
  npcs: [],
  objects: [
    { id: 'liftIdle', x: 3, y: 0, label: 'A' }, { id: 'liftIdle', x: 5, y: 0, label: 'B' }, { id: 'liftIdle', x: 3, y: 5, label: 'C' }, { id: 'liftIdle', x: 5, y: 5, label: 'D' },
    { id: 'panel3', x: 4, y: 0 }, { id: 'panel3', x: 4, y: 5 }, { id: 'bell', x: 9, y: 3 },
    { id: 'westDoor3', x: 0, y: 2 },
  ],
};

// ---- office floor 3 --------------------------------------------------------
const officeRows = OFFICE.split('\n').slice(1, -1);
const office = {
  rows: officeRows,
  warps: [
    { x: 55, y: 28, to: 'elevators3', tx: 8, ty: 2, dir: 'left' },
    { x: 48, y: 22, to: 'elevators3', tx: 1, ty: 2, dir: 'right' },
  ],
  npcs: [
    { id: 'receptionist', x: 60, y: 32, look: 'reception', dir: 'up' },
    { id: 'intern', x: 62, y: 29, look: 'chat', dir: 'down', wander: 2 }, // away from the lift exit so it never boxes you in
    { id: 'hr3', x: 66, y: 31, look: 'hr', dir: 'left' },
    { id: 'eastWalker', x: 56, y: 20, look: 'manager', dir: 'down', wander: 1 },
    { id: 'facility2', x: 57, y: 23, look: 'facility', dir: 'right' },
    { id: 'meeting', x: 70, y: 20, look: 'dev', dir: 'down' },
    { id: 'guest', x: 73, y: 22, look: 'manager', dir: 'up' },
    // L2: product team week, colleagues from all over the company
    { id: 'product1', x: 72, y: 20, look: 'hr', dir: 'down' },
    { id: 'product2', x: 74, y: 20, look: 'dev', dir: 'down' },
    { id: 'product3', x: 76, y: 20, look: 'recruiter2', dir: 'down' },
    { id: 'product4', x: 70, y: 22, look: 'finance', dir: 'up' },
    { id: 'product5', x: 75, y: 22, look: 'recruiter3', dir: 'up' },
    { id: 'product6', x: 76, y: 22, look: 'tester', dir: 'up' },
    { id: 'facilitator', x: 78, y: 21, look: 'coffee', dir: 'left' },
    { id: 'meeting2', x: 72, y: 28, look: 'chat', dir: 'down' },
    { id: 'it', x: 49, y: 37, look: 'it', dir: 'down' }, // at the end of the laptop counter,
    // Pod 8: DevEx and three recruiters; the two lower seats on the right stay free for you
    { id: 'devex', x: 42, y: 2, look: 'devex', dir: 'right', frenzy: true },
    { id: 'recruiter1', x: 42, y: 3, look: 'recruiter', dir: 'right' },
    { id: 'recruiter2', x: 42, y: 4, look: 'recruiter2', dir: 'right' },
    { id: 'recruiter3', x: 45, y: 2, look: 'recruiter3', dir: 'left' },
    // Pod 7: developers and HR; Pod 6: finance
    { id: 'pod7', x: 50, y: 2, look: 'dev', dir: 'right' },
    { id: 'hr1', x: 53, y: 3, look: 'hr', dir: 'left' },
    { id: 'hr2', x: 50, y: 4, look: 'hr', dir: 'right' },
    { id: 'finance1', x: 57, y: 2, look: 'finance', dir: 'right' },
    { id: 'finance2', x: 57, y: 3, look: 'finance', dir: 'right' },
    { id: 'finance3', x: 60, y: 2, look: 'manager', dir: 'left' },
    { id: 'finance4', x: 60, y: 4, look: 'finance', dir: 'left' },
    { id: 'wanderer1', x: 47, y: 12, look: 'dev', dir: 'down', wander: 3 },
    { id: 'massage', x: 44, y: 9, look: 'coffee', dir: 'left' },
    { id: 'm2Caller', x: 44, y: 13, look: 'm2Caller', dir: 'left', busy: true }, // someone in M2 all day, behind a closed door
    { id: 'facility3', x: 46, y: 22, look: 'facility', dir: 'up' },
    { id: 'fixer', x: 56, y: 13, look: 'fixer', dir: 'down' }, // roams the floor (see FIXER_ROUTE in story.js)
    { id: 'coffee1', x: 41, y: 29, look: 'coffee', dir: 'right' },
    { id: 'coffee2', x: 43, y: 31, look: 'coffee', dir: 'left', wander: 1 },
    { id: 'facility1', x: 41, y: 31, look: 'facility', dir: 'right' },
    { id: 'chat1', x: 30, y: 27, look: 'chat', dir: 'up' },
    { id: 'chat2', x: 34, y: 31, look: 'dev', dir: 'up' },
    { id: 'chat3', x: 40, y: 27, look: 'tester', dir: 'down' },
    { id: 'lunch1', x: 30, y: 33, look: 'coffee', dir: 'right' },
    { id: 'lunch2', x: 36, y: 29, look: 'dev', dir: 'down' },
    { id: 'lunch3', x: 37, y: 33, look: 'tester', dir: 'right' },
    { id: 'kitchenWander', x: 39, y: 30, look: 'hr', dir: 'down', wander: 1 },
    { id: 'gamer', x: 30, y: 23, look: 'dev', dir: 'left' },
    { id: 'terrace1', x: 29, y: 37, look: 'chat', dir: 'down', wander: 2 },
    { id: 'terrace2', x: 34, y: 38, look: 'manager', dir: 'up' },
    { id: 'sofa', x: 32, y: 20, look: 'tester', dir: 'left' },
    { id: 'reader', x: 36, y: 23, look: 'hr', dir: 'up' },
    // Pod 2: developers behind the reception
    { id: 'pod2a', x: 59, y: 35, look: 'dev', dir: 'down' },
    { id: 'pod2b', x: 61, y: 35, look: 'tester', dir: 'down' },
    { id: 'pod2c', x: 60, y: 44, look: 'dev', dir: 'up' },
    { id: 'pod2d', x: 58, y: 40, look: 'manager', dir: 'right', wander: 1 },
    // Too busy to talk: one walks around on the phone, one types like the building is on fire
    { id: 'phoneWalker', x: 47, y: 40, look: 'manager', dir: 'down', wander: 5, busy: true },
    { id: 'typer', x: 59, y: 41, look: 'dev', dir: 'down', busy: true, frenzy: true },
    { id: 'tester1', x: 40, y: 37, look: 'tester', dir: 'down' },
    { id: 'pod3c', x: 42, y: 37, look: 'dev', dir: 'down' },
    { id: 'dev1', x: 41, y: 46, look: 'dev', dir: 'up' },
    { id: 'tester2', x: 44, y: 43, look: 'tester', dir: 'up', wander: 1 },
    { id: 'pod5b', x: 41, y: 57, look: 'dev', dir: 'down' },
    { id: 'manager1', x: 59, y: 51, look: 'manager', dir: 'down' },
    { id: 'manager2', x: 51, y: 51, look: 'manager', dir: 'down' },
    { id: 'southWalker', x: 50, y: 47, look: 'tester', dir: 'left', wander: 3 },
    // West wing: the dev teams (fictional: Otter, Heron, Kite, Badger, Spark, Relay, Pixel)
    { id: 'otter', x: 22, y: 36, look: 'dev', dir: 'down' },
    { id: 'heron', x: 23, y: 39, look: 'dev', dir: 'up' },
    { id: 'kite', x: 22, y: 42, look: 'tester', dir: 'down' },
    { id: 'badger', x: 24, y: 45, look: 'coffee', dir: 'up' },
    { id: 'spark', x: 23, y: 56, look: 'dev', dir: 'up' },
    { id: 'spark2', x: 22, y: 56, look: 'chat', dir: 'up' },
    { id: 'relay', x: 17, y: 53, look: 'dev', dir: 'down' },
    { id: 'relay2', x: 16, y: 56, look: 'tester', dir: 'up' },
    { id: 'pixel', x: 18, y: 45, look: 'recruiter3', dir: 'left', wander: 2 },
    { id: 'bloom', x: 22, y: 47, look: 'chat', dir: 'down' },
    { id: 'westCoffee', x: 9, y: 57, look: 'coffee', dir: 'down' },
    // Spotters: they notice you when you walk into their view and come over to talk (once).
    { id: 'quizzer', x: 57, y: 9, look: 'tester', dir: 'down', spot: 6 },
    { id: 'budapestFan', x: 46, y: 9, look: 'chat', dir: 'down', spot: 6 },
    { id: 'catLover', x: 45, y: 55, look: 'recruiter3', dir: 'up', spot: 6 }, // watches the S2 door: you meet her on the way in
  ],
  objects: [
    { id: 'receptionDesk', x: 58, y: 31 }, { id: 'receptionDesk', x: 59, y: 31 }, { id: 'receptionDesk', x: 60, y: 31 }, { id: 'receptionDesk', x: 61, y: 31 }, { id: 'receptionDesk', x: 62, y: 31 }, { id: 'receptionDesk', x: 63, y: 31 },
    { id: 'laptop', which: 0, x: 50, y: 37 }, { id: 'laptop', which: 1, x: 51, y: 37 }, { id: 'laptop', which: 2, x: 52, y: 37 },
    { id: 'pinball', x: 29, y: 23 },
    { id: 'coffeeMachine', x: 42, y: 29 }, { id: 'coffeeMachine', x: 42, y: 31 }, { id: 'coffeeMachine', x: 9, y: 58 }, { id: 'coffeeMachine', x: 54, y: 35 },
 { id: 'fridge', x: 10, y: 58 },
    { id: 'server', x: 41, y: 20 }, { id: 'server', x: 42, y: 20 }, { id: 'server', x: 43, y: 20 }, { id: 'server', x: 44, y: 20 },
    { id: 'water', x: 48, y: 27 }, { id: 'fridge', x: 48, y: 28 }, { id: 'fridge', x: 48, y: 29 },
    { id: 'lockers', x: 49, y: 35 }, { id: 'lockers', x: 50, y: 35 }, { id: 'lockers', x: 51, y: 35 }, { id: 'lockers', x: 52, y: 35 },
    { id: 'devexDesk', x: 43, y: 2 },
    { id: 'serverDoor', x: 45, y: 21 },
    // Things people left in the wrong place: invisible until the facility manager's to-do list starts.
    { id: 'misplaced', task: 0, x: 30, y: 37, solid: false }, { id: 'misplaced', task: 1, x: 47, y: 15, solid: false },
    { id: 'misplaced', task: 2, x: 60, y: 21, solid: false }, { id: 'misplaced', task: 3, x: 36, y: 24, solid: false },
    { id: 'misplaced', task: 4, x: 40, y: 33, solid: false },
    { id: 'm2Door', x: 45, y: 17 }, { id: 'm2Light', x: 45, y: 18 },
    { id: 'snacks', x: 45, y: 32 }, { id: 'snacks', x: 45, y: 33 },
    { id: 'board', x: 41, y: 7 }, { id: 'board', x: 24, y: 41 },
    { id: 'massageTable', x: 41, y: 9 }, { id: 'massageTable', x: 42, y: 9 },
    { id: 'coreLift', x: 55, y: 26 }, { id: 'coreLift', x: 55, y: 27 }, { id: 'coreLift', x: 55, y: 29 }, { id: 'coreLift', x: 55, y: 30 },
    ...OFFICE_PLATES.map((p) => ({ id: 'sign', ...p })),
  ],
};
// Every free desk chair is a place to sit down at the end.
officeRows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'h' && !office.npcs.some((n) => n.x === x && n.y === y)) office.objects.push({ id: 'chair', x, y, solid: false }); }));

export const MAPS = { street, lobby, elevators3, office };
for (const m of Object.values(MAPS)) {
  m.legend = LEGEND;
  const w = Math.max(...m.rows.map((r) => r.length));
  m.rows = m.rows.map((r) => r.padEnd(w, ' '));
  for (const n of m.npcs) n.home = [n.x, n.y];
  for (const o of m.objects) if (o.id === 'sign' && !o.tile) o.solid = false;
}
