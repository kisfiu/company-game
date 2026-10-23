// Code-drawn pixel art. One calm blue palette, plus yellow, green, orange and red accents.
export const PAL = {
  '.': null,
  w: '#FFFFFF', k: '#3A3A3A', K: '#1E2A33',
  L: '#E3F6FB', l: '#A9E6F4', c: '#3EB1CC', b: '#0A7DA0', B: '#054B64',
  y: '#FFD134', g: '#48BF86', o: '#F9A35C', r: '#E65038', R: '#C24530',
  G: '#8A8F94', d: '#C9CDD1', D: '#5B6166', A: '#4A4D52',
  s: '#F2D3B3', h: '#5A3A1E', n: '#A8763E', N: '#6E4A22', t: '#2E7D4F', e: '#CFC3A8', p: '#D7C7E8',
};
export const TILE = 16;

// 8x8 glyphs scaled x2 to 16x16 (chunky GB look). '.' = transparent over the base floor.
const G8 = {
  desk:     ['nnnnnnnn','nNNNNNNn','nNNNNNNn','nnnnnnnn','.n....n.','.n....n.','.n....n.','........'],
  monitor:  ['.kkkkkk.','.kllllk.','.klbblk.','.kllllk.','.kkkkkk.','...kk...','..kkkk..','........'],
  chair:    ['..bbbb..','..bBBb..','..bBBb..','.bbbbbb.','.bBBBBb.','..k..k..','..k..k..','........'],
  plant:    ['...gg...','..gtgg..','.gtggtg.','..ggtg..','...nn...','..nnnn..','..nNNn..','..nnnn..'],
  coffee:   ['.kkkkkk.','.kDDDDk.','.kDrrDk.','.kk.wkk.','nnnnnnnn','nNNNNNNn','nNNNNNNn','nnnnnnnn'],
  fridge:   ['dddddddd','dLLLLLLd','dLLLLkLd','dddddddd','dLLLLkLd','dLLLLLLd','dLLLLLLd','dddddddd'],
  sofa:     ['........','.cccccc.','cbbbbbbc','cbbbbbbc','cccccccc','cbbbbbbc','c......c','........'],
  pinball:  ['.rrrrrr.','.ryyyyr.','.ryKKyr.','.ryyyyr.','.rwwwwr.','.rwbbwr.','.rrrrrr.','.k....k.'],
  locker:   ['GGGGGGGG','GddGddGG','GddGddGG','GdkGdkGG','GddGddGG','GddGddGG','GddGddGG','GGGGGGGG'],
  board:    ['dddddddd','dwwwwwwd','dwbbwbwd','dwwwwwwd','dwbwbbwd','dwwwwwwd','dddddddd','...dd...'],
  table:    ['........','.nnnnnn.','.nNNNNn.','.nNNNNn.','.nnnnnn.','.n....n.','.n....n.','........'],
  sign:     ['.bbbbbb.','.bwwwwb.','.bwbbwb.','.bwwwwb.','.bbbbbb.','...kk...','...kk...','...kk...'],
  tree:     ['...tt...','..tgtt..','.tggttg.','.tgtgtt.','..tttt..','...nn...','...nn...','...nn...'],
  bench:    ['........','........','nnnnnnnn','nNNNNNNn','n......n','n......n','........','........'],
  panel:    ['.dddddd.','.dkkkkd.','.dkggkd.','.dkkkkd.','.dddddd.','........','........','........'],
  turn:     ['G......G','GGGGGGGG','G.ddd..G','G.ddd..G','G......G','G......G','GGGGGGGG','G......G'],
  bell:     ['........','...yy...','..yyyy..','..yyyy..','.yyyyyy.','...kk...','........','........'],
  server:   ['kkkkkkkk','kgkgkgkk','kkkkkkkk','krkgkgkk','kkkkkkkk','kgkgkrkk','kkkkkkkk','kkkkkkkk'],
  laptop:   ['........','.dddddd.','.dwwwwd.','.dwlLwd.','.dwwwwd.','.dddddd.','wddddddw','........'],
  qr:       ['wwwwwwww','wkkwkwkw','wkwwwkkw','wkkwkwww','wwwkwkkw','wkkwwkww','wkwkwkkw','wwwwwwww'],
  recdesk:  ['nnnnnnnn','nNNNNNNn','nNNNNNNn','nnnnnnnn','bbbbbbbb','bBccBBBb','bBBBBBBb','bbbbbbbb'],
  lamp:     ['...kk...','..kyyk..','..kyyk..','...kk...','...k....','...k....','..kkk...','........'],
  massage:  ['........','pppppppp','pwwwwwwp','pppppppp','p......p','p......p','........','........'],
  plate:    ['........','.bbbbbb.','.bwwwwb.','.bwkkwb.','.bwwwwb.','.bbbbbb.','........','........'],
  tv:       ['kkkkkkkk','kKKKKKKk','kKggKKKk','kKKKKKKk','kkkkkkkk','...kk...','..kkkk..','........'],
  cabinet:  ['dddddddd','dLLLLLLd','dddddddd','nNNnNNnn','nNNnNNnn','nnnnnnnn','nNNnNNnn','nnnnnnnn'],
  window:   ['........','.llllll.','.lwllwl.','.llllll.','.llllll.','.lwllwl.','.llllll.','........'],
  fern:     ['..g.gg..','.gtg.gt.','..tgtg..','.gtgtg..','...tt...','..pppp..','..pPPp..','..pppp..'],
  laptopBlack: ['........','.KKKKKK.','.KkkkkK.','.KkbbkK.','.KkkkkK.','.KKKKKK.','KKKKKKKK','........'],
  laptopBlue:  ['........','.bbbbbb.','.bBBBBb.','.bBllBb.','.bBBBBb.','.bbbbbb.','bbbbbbbb','........'],
  rail:     ['........','........','GGGGGGGG','dddddddd','.G....G.','.G....G.','.G....G.','........'],
  snacks:   ['BBBBBBBB','ByyyyyyB','BlrBBogB','BllkkllB','BddBBddB','BoyBBrgB','BllBBllB','BBBBBBBB'], // glass-door snack cabinet, yellow label on top
  railV:    ['...G....','...Gd...','..GGd...','...Gd...','...Gd...','...Gd...','..GGd...','...Gd...'],
  gateV:    ['...cl...','...cl...','..kkl...','..kgl...','...cl...','...cl...','...cl...','...cl...'],
  barrier:  ['........','yyKKyyKK','KyyKKyyK','........','.k....k.','yyKKyyKK','KyyKKyyK','.k....k.'],
  pastry:   ['dddddddd','dlllllld','dloylold','dlllllld','nnnnnnnn','nNNNNNNn','nNNNNNNn','nnnnnnnn'],
  redlight: ['........','..kkkk..','.krrrrk.','.krwrrk.','.krrrrk.','..kkkk..','........','........'],
  water:    ['..llll..','..lccl..','..llll..','.dddddd.','.dwwwwd.','.dkddkd.','.dddddd.','.d....d.'],
  gateRed:  ['...cl...','...cl...','..kkl...','..krl...','...cl...','...cl...','...cl...','...cl...'],
  books:    ['nnnnnnnn','nrbgyrcn','nrbgyrcn','nnnnnnnn','nbyrcgbn','nbyrcgbn','nnnnnnnn','n......n'],
  cup:      ['..w.w...','.w.w.w..','........','.wwwwwww','.wwwwwww','.wwwww..','..wwww..','..dddd..'],
  sheet:    ['wwwwwwww','wggggggw','wgwgwgww','wggggggw','wgwgwgww','wggggggw','wgwgwgww','wwwwwwww'],
  cig:      ['........','........','.......y','wwwwwwor','wwwwwwor','.......k','........','........'],
  badge:    ['...kk...','.bbbbbb.','.bwwwwb.','.bwsswb.','.bwhhwb.','.bwwwwb.','.bryyrb.','.bbbbbb.'],
  toilet:   ['........','..dddd..','.dwwwwd.','.dwwwwd.','..dwwd..','..dwwd..','..dddd..','........'],
  sink:     ['........','.dddddd.','.dwwwwd.','.dwkkwd.','.dwwwwd.','.dddddd.','...dd...','........'],
};

// Base (full) tiles, procedurally painted. ctx is the 16x16 tile context.
const BASE = {
  floor:  (c) => { fill(c, 'L'); dots(c, 'l'); },
  carpet: (c) => { fill(c, 'd'); c.fillStyle = PAL.G; c.fillRect(0, 0, 1, 16); c.fillRect(0, 0, 16, 1); },
  kitchen:(c) => { fill(c, 'e'); grid(c, 'd', 8); },
  chill:  (c) => { fill(c, 'p'); dots(c, 'w'); },
  wall:   (c) => { fill(c, 'B'); c.fillStyle = PAL.b; c.fillRect(0, 0, 16, 4); c.fillStyle = PAL.c; c.fillRect(0, 0, 16, 1); },
  glass:  (c) => { fill(c, 'l'); c.fillStyle = PAL.w; c.fillRect(2, 0, 2, 16); c.fillRect(9, 0, 1, 16); },
  door:   (c) => { fill(c, 'n'); c.fillStyle = PAL.N; c.fillRect(0, 0, 1, 16); c.fillRect(15, 0, 1, 16); c.fillStyle = PAL.y; c.fillRect(11, 8, 2, 2); },
  gdoor:  (c) => { fill(c, 'l'); c.fillStyle = PAL.b; c.fillRect(0, 0, 1, 16); c.fillRect(15, 0, 1, 16); c.fillRect(7, 0, 2, 16); c.fillStyle = PAL.w; c.fillRect(2, 0, 2, 16); },
  lift:   (c) => { fill(c, 'G'); c.fillStyle = PAL.d; c.fillRect(1, 1, 6, 14); c.fillRect(9, 1, 6, 14); c.fillStyle = PAL.k; c.fillRect(7, 1, 2, 14); },
  liftOpen:(c) => { fill(c, 'G'); c.fillStyle = PAL.K; c.fillRect(2, 1, 12, 14); c.fillStyle = PAL.y; c.fillRect(6, 4, 4, 2); },
  street: (c) => { fill(c, 'A'); c.fillStyle = PAL.y; c.fillRect(0, 7, 6, 2); },
  road:   (c) => { fill(c, 'A'); },
  pave:   (c) => { fill(c, 'e'); grid(c, 'd', 8); },
  grass:  (c) => { fill(c, 'g'); c.fillStyle = PAL.t; c.fillRect(3, 4, 1, 3); c.fillRect(11, 9, 1, 3); c.fillRect(7, 13, 1, 2); },
  facade: (c) => { fill(c, 'L'); c.fillStyle = PAL.d; c.fillRect(0, 0, 16, 2); c.fillStyle = PAL.G; for (let x = 1; x < 16; x += 4) c.fillRect(x, 3, 1, 12); c.fillStyle = PAL.l; for (let x = 2; x < 16; x += 4) c.fillRect(x, 4, 2, 10); },
  facadeTop:(c) => { fill(c, 'G'); c.fillStyle = PAL.d; c.fillRect(0, 12, 16, 4); c.fillStyle = PAL.D; c.fillRect(0, 0, 16, 2); },
  ground: (c) => { fill(c, 'l'); c.fillStyle = PAL.B; c.fillRect(0, 0, 16, 2); c.fillStyle = PAL.w; for (let x = 0; x < 16; x += 5) c.fillRect(x, 2, 1, 14); },
  water:  (c) => { fill(c, 'c'); c.fillStyle = PAL.l; c.fillRect(2, 5, 5, 1); c.fillRect(9, 11, 5, 1); },
  black:  (c) => { fill(c, 'K'); },
};

function fill(c, k) { c.fillStyle = PAL[k]; c.fillRect(0, 0, 16, 16); }
function dots(c, k) { c.fillStyle = PAL[k]; c.fillRect(4, 4, 1, 1); c.fillRect(12, 12, 1, 1); }
function grid(c, k, n) { c.fillStyle = PAL[k]; c.fillRect(0, 0, 16, 1); c.fillRect(0, 0, 1, 16); c.fillRect(0, n, 16, 1); c.fillRect(n, 0, 1, 16); }

// 12x16 people, facing down / up / right (left is mirrored). Chars: S shirt, H hair, s skin, P pants.
const BODY = {
  down: [
    ['....HHHH....','...HHHHHH...','...HssssH...','...Hs.s.H...','...ssssss...','....ssss....','...SSSSSS...','..sSSSSSSs..','..sSSSSSSs..','...SSSSSS...','...PPPPPP...','...PP..PP...','...PP..PP...','...kk..kk...','............','............'],
    ['....HHHH....','...HHHHHH...','...HssssH...','...Hs.s.H...','...ssssss...','....ssss....','...SSSSSS...','..sSSSSSSs..','..sSSSSSSs..','...SSSSSS...','...PPPPPP...','...PP..PP...','...kk..PP...','.......kk...','............','............'],
  ],
  up: [
    ['....HHHH....','...HHHHHH...','...HHHHHH...','...HHHHHH...','....HHHH....','....ssss....','...SSSSSS...','..sSSSSSSs..','..sSSSSSSs..','...SSSSSS...','...PPPPPP...','...PP..PP...','...PP..PP...','...kk..kk...','............','............'],
    ['....HHHH....','...HHHHHH...','...HHHHHH...','...HHHHHH...','....HHHH....','....ssss....','...SSSSSS...','..sSSSSSSs..','..sSSSSSSs..','...SSSSSS...','...PPPPPP...','...PP..PP...','...PP..kk...','...kk.......','............','............'],
  ],
  right: [
    ['....HHHH....','...HHHHHH...','...HHHsss...','...HHHs.s...','....ssss....','....sss.....','...SSSSS....','...SSSSSs...','...SSSSSs...','...SSSSS....','...PPPPP....','...PP.PP....','...PP.PP....','...kk.kk....','............','............'],
    ['....HHHH....','...HHHHHH...','...HHHsss...','...HHHs.s...','....ssss....','....sss.....','...SSSSS....','...SSSSSs...','...SSSSSs...','...SSSSS....','...PPPPP....','....PPP.....','...PP.PP....','..kk...kk...','............','............'],
  ],
};

const cache = new Map();
function canvasOf(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function paintGlyph(ctx, rows, scale, pal) {
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    const col = pal[ch] ?? PAL[ch];
    if (col) { ctx.fillStyle = col; ctx.fillRect(x * scale, y * scale, scale, scale); }
  }));
}

// Returns a cached 16x16 canvas for a tile id ("floor", or "floor+desk" for an object on a base).
export function tile(id) {
  if (cache.has(id)) return cache.get(id);
  const [base, obj] = id.split('+');
  const c = canvasOf(16, 16), ctx = c.getContext('2d');
  (BASE[base] || BASE.black)(ctx);
  if (obj) { if (G8[obj]) paintGlyph(ctx, G8[obj], 2, {}); else console.warn('unknown glyph', obj); } // never let one bad id stop the game loop
  cache.set(id, c);
  return c;
}

// pal: {S: shirt colour, H: hair colour, P: pants colour}
export function person(dir, frame, pal) {
  const key = `p:${dir}:${frame}:${pal.S}${pal.H}${pal.P}${pal.long ? 'L' : ''}`;
  if (cache.has(key)) return cache.get(key);
  const c = canvasOf(12, 16), ctx = c.getContext('2d');
  const d = dir === 'left' ? 'right' : dir;
  if (dir === 'left') { ctx.translate(12, 0); ctx.scale(-1, 1); }
  paintGlyph(ctx, BODY[d][frame], 1, pal);
  if (pal.long) { // shoulder-length hair: strands beside the face, or a full back of hair seen from behind
    ctx.fillStyle = pal.H;
    const px = { down: [[2, 2], [2, 3], [2, 4], [2, 5], [9, 2], [9, 3], [9, 4], [9, 5]], up: [[3, 4], [4, 5], [5, 5], [6, 5], [7, 5], [8, 4], [2, 3], [9, 3]], right: [[2, 2], [2, 3], [2, 4], [2, 5], [3, 4], [3, 5], [4, 5]] }[d];
    for (const [x, y] of px) ctx.fillRect(x, y, 1, 1);
  }
  cache.set(key, c);
  return c;
}

export const OUTFITS = {
  player: { S: PAL.b, H: PAL.h, P: PAL.K },
  guard:  { S: PAL.K, H: PAL.k, P: PAL.K },
  reception: { S: PAL.c, H: PAL.o, P: PAL.D },
  it:     { S: PAL.g, H: PAL.k, P: PAL.D },
  devex:  { S: '#141414', H: PAL.h, P: '#141414' }, // all black, always
  dev:    { S: PAL.D, H: PAL.h, P: PAL.K },
  tester: { S: PAL.y, H: PAL.k, P: PAL.D },
  finance:{ S: PAL.w, H: PAL.N, P: PAL.D },
  manager:{ S: PAL.B, H: PAL.G, P: PAL.k },
  coffee: { S: PAL.o, H: PAL.h, P: PAL.D },
  chat:   { S: PAL.p, H: PAL.y, P: PAL.D },
  street: { S: PAL.G, H: PAL.k, P: PAL.D },
  hr:     { S: PAL.R, H: PAL.N, P: PAL.D },
  facility: { S: PAL.t, H: PAL.k, P: PAL.B },
  fixer:  { S: PAL.t, H: PAL.y, P: PAL.B, long: true }, // the blonde facility manager who puts things back
  recruiter: { S: PAL.p, H: PAL.o, P: PAL.k },
  recruiter2: { S: PAL.g, H: PAL.h, P: PAL.B },
  recruiter3: { S: '#7B5CA8', H: PAL.y, P: PAL.D, long: true },
  m2Caller: { S: PAL.R, H: PAL.N, P: PAL.k, long: true },
  worker: { S: '#F28C28', H: PAL.y, P: PAL.B }, // hi-vis vest, yellow hard hat
  hrGuide: { S: PAL.c, H: '#D9DDE2', P: PAL.B, long: true }, // the silver-haired HR buddy
};
