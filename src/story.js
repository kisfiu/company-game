import { MAPS } from './maps.js';
import { DIRS } from './engine.js';
import { TECH, NEWS, ask } from './quiz.js';

export const flags = { badge: false, puzzle: false, buzzed: false, checkedIn: false, laptop: null, devex: false, provisioned: false, working: false, gate: false, hr: null, trained: false, coffeeQuest: null, coffee: false, cigarette: null, spare: false, localTold: [], fm: null, fmFixed: [], serverOpen: false, name: 'New Dev', start: 0 };
const LAPTOPS = ['MacBook', 'Linux', 'Windows'];
const LAPTOP_INFO = [
  ['A shiny silver MacBook Pro with 64 GB RAM. Mostly it is just fancy.', 'But it runs the local dev cluster and everything else you need, just like the others. DevEx provisions it like any other laptop.'],
  ['A black ThinkPad with Ubuntu and 64 GB RAM. For people who want all the permissions over their own laptop.', 'Sticker on the lid: "Full-disk encryption: ON". DevEx has a provisioning script for it.'],
  ['A blue Windows laptop with 64 GB RAM. The convenient choice: everything just works, eventually.', 'Sticker on the lid: "WSL2 ready". DevEx has a provisioning script for it.'],
];
async function pickLaptop(g, i) {
  flags.laptop = LAPTOPS[i];
  give(g, ['floor+laptop', 'floor+laptopBlack', 'floor+laptopBlue'][i], flags.laptop);
  await g.say([`You received the ${flags.laptop}!`, 'IT: Blank as a whiteboard. DevEx sets it up: all the way north, past the kitchen and M2, top-left corner of the open office. Follow the typing noise.']);
}

// Gates that live in map data but depend on story state.
MAPS.elevators3.warps[0].when = () => flags.buzzed || 'The glass door is locked. There is a bell on the wall.';
for (const o of MAPS.lobby.objects.filter((o) => o.id === 'gate')) o.solid = () => !flags.gate;
MAPS.lobby.objects.find((o) => o.id === 'liftB').solid = () => !flags.puzzle;
// After HR training your badge opens the west glass door of the floor-3 lift lobby as well.
MAPS.elevators3.objects.find((o) => o.id === 'westDoor3').solid = () => !flags.trained;
MAPS.elevators3.warps[1].when = () => flags.trained || 'The west glass door does not open. Your badge only works here after the HR onboarding training.';

function give(g, tile, text) { g.hud.push({ tile, text }); g.hooks.onKey('solved'); }

// West-wing teams are heads-down until you have found DevEx; then they tell you what they build.
const busy = (after) => async (g, n) => (flags.devex ? (typeof after === 'function' ? after(g, n) : g.say(after)) : g.say('...mhm... *typing*... sprint review in five... can this wait?'));
const pinballTime = (g) => g.wait(1500);
const pick = (lines) => lines[Math.floor(Math.random() * lines.length)];

// How you "pronounce" the emojis in your name: one weird noise per emoji, the same noise every time.
const NOISES = ['FWOOSH', 'BLORP', 'MRRRP', 'ZZZT', 'PLINK', 'HOO-WAH', 'SKREEE', 'BWONK', 'PFFFT', 'WUB-WUB', 'DOOT', 'GLORK', 'BRRRING', 'NYOOM'];
export function emojiNoise(name) {
  const emojis = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(name)]
    .map((x) => x.segment).filter((c) => /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(c));
  if (!emojis.length) return '';
  const word = emojis.map((e) => NOISES[[...e].reduce((h, ch) => h * 31 + ch.codePointAt(0), 7) % NOISES.length]).join('-');
  const letters = name.replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}|\u200d|\ufe0f/gu, '').trim();
  return letters ? `${letters} *${word}*` : `*${word}*`;
}

// Plants wear name tags with IT tools. You read a random one each time you look, and each tool has its own joke.
const PLANT_TAGS = {
  Kubernetes: 'It restarts itself every night. Nobody knows why, but it reports healthy.',
  Docker: 'It came in a container and grows the same on every windowsill.',
  Maven: 'It downloads half the internet before it grows a single leaf.',
  Jenkins: 'It used to build everything. Now it has retired to a nice pot.',
  Ansible: 'It waters itself idempotently. Watering it twice is the same as once.',
  Grafana: 'Its growth has a dashboard. The line goes up and to the right.',
  Prometheus: 'It scrapes the sunlight every 15 seconds.',
  Kafka: 'Its leaves arrive in order. Eventually.',
  Redis: 'Lightning fast, but it forgets everything when the power goes out.',
  Nexus: 'It caches its own seeds, just in case the internet goes away.',
  GitLab: 'It has three open merge requests for new leaves, all waiting for review.',
  Telepresence: 'It swaps itself with a plant on your laptop. Spooky.',
  Helm: 'It comes with a values.yaml that says how much water it needs.',
  Terraform: 'Its pot is declared in code. Do not move it by hand, it will drift.',
  Bicep: 'Like Terraform, but with more Azure in the soil.',
  Playwright: 'It passes all its tests. On the third retry.',
  Bruno: 'It sends requests to the sun and keeps the responses in a collection.',
  'Node 22': 'Its pot is 90 percent node_modules.',
  'Java 21': 'Verbose, but rock solid. Virtual threads in every leaf.',
  PostgreSQL: 'Its roots are perfectly normalized.',
  Elasticsearch: 'You can find any leaf in milliseconds. It also eats all the RAM.',
  Azure: 'It grows in West Europe. Mostly.',
  Copilot: 'It suggests where the next leaf should go. Sometimes brilliant, sometimes a cactus.',
  Claude: 'It politely asks before growing in a new direction.',
  glab: 'It opens merge requests straight from the terminal. No browser needed.',
  Renovate: 'Every Monday it opens a merge request to update its own soil.',
  OWASP: 'Scanned for vulnerabilities daily. No known CVEs. Yet.',
  Selenium: 'Older than Playwright and still hanging in there.',
  nginx: 'It proxies the sunlight to the plants behind it.',
  WSL2: 'A Linux plant living happily inside a Windows pot.',
  kubectl: 'It talks to the Kubernetes plant. Mostly with typos.',
};
export function plantTag() {
  const name = pick(Object.keys(PLANT_TAGS));
  return `A plant with a name tag: "${name}". ${PLANT_TAGS[name]}`;
}

const random = (...lines) => (g) => g.say(pick(lines));

// Furniture without its own handler: keyed by tile id ("kitchen+coffee") or just the glyph/base.
// Walls, windows, glass and the facade stay silent on purpose.
const TILE_TALK = {
  monitor: ['Someone\'s desk. Three terminals, one Teams window, zero regrets.', 'A monitor shows a pipeline. It is green. Nobody touches it.', 'Sticky note on the screen: "ask DevEx before you sudo".'],
  desk: 'A desk. Cables organised with the enthusiasm of a Monday.',
  chair: 'A chair. Ergonomic, allegedly.',
  locker: 'Lockers. One of them smells faintly of gym.',
  board: ['A whiteboard: half a sequence diagram and the words "ask DevEx".', 'Whiteboard: "DONE is better than PERFECT, but TESTED is better than DONE."'],
  table: 'A kitchen table. Crumbs from this morning\'s pogácsa.',
  coffee: ['The coffee machine. It grinds, it hisses, it delivers.', 'Somebody taped a note to the machine: "double shot = double standup".'],
  fridge: 'The fridge. A yoghurt labelled "NOT YOURS". Fair.',
  sofa: 'A sofa. The best desk on this floor, according to the testers.',
  tv: ['A huge TV. Someone left the deployment dashboard on. All green.', 'The TV. On Fridays it shows the pinball high scores.'],
  cabinet: 'Kitchen counter. Mugs with team logos and a suspicious number of spoons.',
  toilet: 'A toilet. Spotless. Facilities is on top of things.',
  books: ['Bookshelf: "Clean Code", "The Phoenix Project", "Accelerate" and a well-thumbed "Team Topologies".', 'Bookshelf: "Designing Data-Intensive Applications", still in its plastic wrap. Very aspirational.', 'Bookshelf: a <company> manual from 2009, a Dutch-Hungarian dictionary and a board game with half the pieces missing.', 'Bookshelf: "Kubernetes Up and Running". Someone added a sticky note: "or one command, just saying".'],
  sink: 'A sink with the good soap. Somebody wrote "wash hands, then push" on the mirror.',
  massage: 'The massage table. There is a waiting list until next quarter.',
  server: 'The server room hums behind the wall. Blinking lights. Do not touch.',
  lift: 'The elevator core. You already had your ride for today.',
  laptopBlack: 'A black Linux laptop. Stickers optional, but expected.',
  laptopBlue: 'A blue Windows laptop. It is installing updates. It is always installing updates.',
  tree: 'A promenade tree. Freshly planted, like you.',
  bench: 'A bench. A pigeon has reserved it.',
  water: 'The fountain. Tiny fish, big ambitions.',
  panel: 'A call panel.',
};

export const TALK = {
  // ---- street --------------------------------------------------------------
  passerby: ['Passerby: <company>? Corvin Innovation Campus, this building, 3rd floor.', 'Walk through the front garden to the big glass doors at the back of the U.', 'Oh, and say hi to the fountain. Everyone does.'],
  entrance: 'MAIN ENTRANCE - Corvin Innovation Campus. This is the one.',
  signCompany: '<company> - 3rd floor. Welcome to your first day!',
  signMain: 'CORVIN INNOVATION CAMPUS - main entrance at the back of the U\nIBM Hungary: 5th floor\nTurbine: 2nd floor\n<company>: 3rd floor',
  // Hands you one spare for the bench smoker, once he has hinted at it.
  smoker1: async (g) => {
    if (flags.cigarette === 'given' && !flags.spare) {
      flags.spare = true; give(g, 'pave+cig', 'Cigarette');
      return g.say(['Smoker: Let me guess. The guy on the bench sent you? He owes me about eleven by now.', 'Smoker: Here, take one for him. Tell him it is the last one. It is never the last one.', 'You got a CIGARETTE!']);
    }
    return g.say(pick(['Smoker: *puff* First day? You can tell by the shoes. Too clean.', 'Smoker: The entrance is through the garden, the only door at the back of the U.', 'Smoker: I quit three times this year. Today is not one of those days.']));
  },
  // On the bench: asks for a cigarette. Give him one and he tells you about the neighbourhood; refuse and he sends you to work.
  // A second cigarette (a spare from the left-wing smoker) buys two more tips.
  benchSmoker: async (g) => {
    const tell = (n) => { const fresh = LOCAL.filter((f) => !flags.localTold.includes(f)).sort(() => Math.random() - 0.5).slice(0, n); flags.localTold.push(...fresh); return fresh; };
    const hasSpare = () => g.hud.some((h) => h.text === 'Cigarette');
    if (flags.cigarette === 'second') return g.say(`Smoker: ${pick(LOCAL)}`);
    if (flags.cigarette === 'given') {
      if (!hasSpare()) return g.say(['Smoker: Back already? More stories cost one more cigarette.', 'Smoker: *nods towards the left wing* Some people over there always carry a spare.']);
      if (await g.choose(['Here you go', 'Not yet'], 'Smoker: Is that... another cigarette?') === 1) return g.say('Smoker: Tease.');
      flags.cigarette = 'second'; g.hud = g.hud.filter((h) => h.text !== 'Cigarette');
      return g.say(['You hand over the second cigarette.', 'Smoker: Now we are friends. Listen.', ...tell(2), 'Smoker: That is everything I know. Well, everything I know for free.']);
    }
    if (await g.choose(['Here you go', 'Sorry, no'], 'Smoker: Hey, you. Got a cigarette?') === 1) {
      return g.say(['Smoker: No? Then what are you doing out here?', 'Smoker: *grumbles* Go to work, new kid. Third floor. Shoo.']);
    }
    flags.cigarette = 'given';
    await g.say(['You hand over the cigarette.', 'Smoker: Ah, a person of culture. Sit, sit. Let me tell you about the neighbourhood.', ...tell(2),
      'Smoker: If you happen to have one more, I can tell you more.', 'Smoker: *nods towards the left wing* Some people over there always carry a spare.']);
  },
  smoker2: (g) => g.say(pick(['Developer: Five minute break. Pipeline takes twelve. Maths.', 'Developer: <company> is on the third floor. Bring a badge, the guards love paperwork.'])),
  smoker3: (g) => g.say(pick(['Finance: Not smoking. Just standing near smokers. Social networking.', 'Finance: Rumour has it DevEx sets up a laptop in under ten minutes. I will believe it when I see it.'])),
  metro: 'M3 Klinikák. The metro you just came from. No turning back now.',

  // ---- lobby ---------------------------------------------------------------
  securityDesk: async (g) => {
    if (flags.badge) return g.say('Guard: The gate in the rails opens with your badge. Then use the call panel between the lifts.');
    await g.say('Guard (through the glass): Good morning! And who might you be?');
    flags.name = await g.ask('Guard: Your name, please?', 'New Dev');
    const noise = emojiNoise(flags.name);
    if (noise) {
      const sound = 'alien:' + noise; // same weird noise every time you or the guards say it
      await g.say(`Guard: ...${flags.name}. Right. And how do you pronounce that?`);
      g.hooks.onKey(sound); await g.say(`${flags.name}: *takes a deep breath* "${noise}"`);
      g.hooks.onKey(sound); await g.say(`Guard: Ah. Okay. Of course. Thanks, ${noise}.`);
      g.hooks.onKey(sound); await g.say(`Guard 2 (without looking up): ${noise}. Lovely name.`);
    }
    await g.say([`${flags.name}: Hi! It is my first day at <company>.`, `Guard: Welcome, ${flags.name}! The new developer, of course. One second... *printer noises*`]);
    flags.badge = true;
    give(g, 'floor+qr', 'QR badge');
    await g.say([`You got the QR BADGE! It says: ${flags.name}, <company>, 3rd floor.`, 'Guard: The lifts are behind me, to the left, past the rail. The rail has a glass gate with a QR reader: walk up to it and press Space to scan.']);
  },
  guard1: (g) => TALK.securityDesk(g),
  gate: async (g) => {
    if (flags.gate) return g.say('The gate is open.');
    if (!flags.badge) return g.say('The gate is closed and a red light blinks: BADGE REQUIRED. The security booth is in the corner.');
    g.hooks.onKey('ding');
    await g.say('You hold your QR badge to the reader... *BEEP*');
    flags.gate = true;
    for (const o of MAPS.lobby.objects) if (o.id === 'gate') o.tile = null;
    await g.say('The gate slides open. Next: the call panel on the top wall, between lift A and lift B.');
  },

  // ---- elevators, ground floor ---------------------------------------------
  liftA: (g) => g.say(flags.badge ? 'Elevator A. Closed. The call panel decides which elevator you get.' : 'Elevator A, behind the rails. You need a badge first.'),
  liftC: 'Elevator C. Closed. It is taking the IBM crowd to the 5th floor.',
  liftD: 'Elevator D. Closed. Out of order? No, just shy.',
  liftB: (g) => g.say(flags.puzzle ? 'Elevator B. The doors are open. Just walk in.' : 'Elevator B. Closed. Ask the call panel first.'),
};

// Walking into the open lift B takes you straight up to the 3rd floor.
async function rideUp(g) {
    await g.say('*ding* You step into elevator B and press nothing. It already knows.');
    await g.fade(true);
    g.hooks.onKey('ding');
    g.loadMap('elevators3', 5, 1, 'down');
    await g.wait(700);
    await g.fade(false);
    await g.say(['*ding* 3rd floor.', 'Same lifts, same panels. The glass door is on the east wall, with a bell next to it.']);
}
Object.assign(TALK, {
  panel: async (g) => {
    if (flags.puzzle) return g.say('Panel: ELEVATOR B assigned. It is waiting for you.');
    await g.say([
      'A call panel with nine floor buttons. To call a lift you must repeat a short code.',
      'HOW IT WORKS: the panel lights up 4 buttons, one after another. Remember the order.',
      'Then it is your turn: move the red frame with the ARROW keys and press Space on the buttons in the same order.',
      'The last button is always 3, your floor. Get one wrong and it simply shows the code again.',
    ]);
    g.hooks.onKey('puzzle');
    await simon(g);
    g.hooks.onKey('theme');
    flags.puzzle = true;
    await g.say('Panel: FLOOR 3 - ELEVATOR B. Something is coming down...');
    const r = MAPS.lobby.rows, { x: B, y: BY } = MAPS.lobby.objects.find((o) => o.id === 'liftB');
    const setB = (ch) => { r[BY] = r[BY].slice(0, B) + ch + r[BY].slice(B + 1); g.minimap = null; };
    for (let i = 0; i < 6; i++) { setB(i % 2 ? 'E' : 'e'); g.hooks.onKey(i % 2 ? 'blip' : 'ding'); await g.wait(260); }
    setB('e');
    await g.say('*DING* Elevator B blinks and its doors slide open.');
  },

  // ---- elevators, floor 3 --------------------------------------------------
  panel3: 'Panel: this floor only has one interesting direction: the glass door and the bell on the east wall.',
  rail: 'A rail. You could climb it, but the guards are watching. Use the gate with the QR reader.',
  westDoor3: (g) => g.say(flags.trained ? 'The west glass door. Your badge opens it now: walk through, it comes out by the chill room.' : 'A glass door on the west wall. Locked: your badge only opens it after the HR onboarding training.'),
  liftIdle: (g, o) => g.say(`Elevator ${o.label}. Going down? Not on your first day.`),
  bell: async (g) => {
    if (flags.buzzed) return g.say('*bzzzt* The door is already open.');
    g.hooks.onKey('ding');
    await g.say(['*riiing*', 'Receptionist (through the intercom): Hi! New developer? Come in, the door is open!']);
    flags.buzzed = true;
  },

  // ---- office --------------------------------------------------------------
  receptionDesk: async (g) => {
    if (flags.provisioned) return random('Receptionist: All set? You look like someone who has a working laptop now.', 'Receptionist: The kitchen fruit is free. The pogácsa goes fast.', 'Receptionist: Meeting rooms: L is large, S is small and M is... medium? Nobody remembers.')(g);
    if (flags.checkedIn && !flags.trained) return g.say(flags.hr === 'waiting' ? 'Receptionist: HR is waiting for you in S2, the training room. South, past the IT room.' : 'Receptionist: HR is on the way to pick you up. Have a look around, they will find you!');
    if (flags.checkedIn) return random('Receptionist: IT is south of here, the storage room right under the elevators. After that, DevEx!', 'Receptionist: Lost? Press Tab, there is a map. Just kidding. Well, actually, try it.', 'Receptionist: Your badge works on the lockers too, pick any free one.')(g);
    await g.say('Receptionist: Hi, welcome to <company>!');
    const i = await g.choose(['New developer', 'Pizza delivery'], 'Receptionist: And who are you? Why are you here today?');
    if (i === 1) await g.say(['Receptionist: ...with no pizza?', `${flags.name}: ...`, `Receptionist: Wait a second. The guards just called up about a new developer. You must be ${flags.name}!`]);
    else await g.say(`Receptionist: Of course! The guards just called up about you. You must be ${flags.name}!`);
    flags.checkedIn = true;
    await g.say(['Receptionist: Signed in! I have let HR know you are here. They will come and pick you up for your onboarding training.', 'Receptionist: It might take a few minutes. Look around, grab a coffee in the kitchen, HR will find you.']);
    hrPickup(g);
  },
  receptionist: (g) => TALK.receptionDesk(g),
  tourist: 'Tourist: Is this the way to the Corvin Plaza? ...the office building? Oh. Sorry.',
  itDesk: async (g) => {
    if (flags.laptop) return g.say(`IT: Take care of that ${flags.laptop}. And go find DevEx: north end of the open office, the corner with all the monitors.`);
    if (!flags.checkedIn) return g.say('IT: Did reception sign you in? Do that first, I need your name in the system.');
    if (!flags.trained) return g.say('IT: Training first, laptop second. HR will pick you up for your onboarding training. Rules are rules!');
    await g.say([`IT: ${flags.name}, the new developer! Pick your weapon. Choose wisely, you only get one.`, 'Three laptops on the desk: a shiny silver MacBook, a black Linux ThinkPad and a blue Windows one.']);
    const i = await g.choose([...LAPTOPS, 'Let me look first'], 'IT: Which one will it be?');
    if (i === LAPTOPS.length) return g.say('IT: Sure, take a look. Face a laptop on the desk and press Space to inspect it.');
    return pickLaptop(g, i);
  },
  laptop: async (g, o) => {
    await g.say(LAPTOP_INFO[o.which]);
    if (flags.laptop) return g.say(flags.laptop === LAPTOPS[o.which] ? 'IT: Your twin! Yours is already in your bag.' : `IT: You already have the ${flags.laptop}. No swapping, I have the paperwork.`);
  },
  it: (g) => TALK.itDesk(g),
  lockers: 'Lockers. One of them is yours now. You do not know which.',
  devexDesk: (g) => TALK.devex(g),
  devex: async (g) => {
    if (flags.provisioned) return random(
      'DevEx: Something broken? Run the provisioning script again, it realigns everything. Otherwise: go code!',
      'DevEx: Tip: one command gives you the whole product in a local cluster. Then Telepresence swaps a service for the one on your laptop.',
      'DevEx: Tip: glab is logged in already. Merge requests from the terminal, no browser tab needed.',
      'DevEx: Tip: the agent skills are installed too. Your AI assistant knows our frameworks and quality rules now.',
      'DevEx: Questions? There is a DevEx support channel in Teams. A bot triages it, a human answers. Usually me.',
      'DevEx: Everything that runs is on our deployment dashboard: team, description, and which version is on testing, acceptance and production.',
      'DevEx: Want to peek into the clusters? Headlamp and the Kubernetes Dashboard are ours.',
      'DevEx: We keep a test web app around to try new pipeline features and quality checks on ourselves first. We are our own guinea pigs.',
      'DevEx: Before you ask for a review, run the quality check on your repo. It saves everyone a round.',
      'DevEx: Renovate opens dependency updates for you. Merge them. Please. They get lonely.',
      'DevEx: The integration platform is ours too. Integrations are our love language.',
    )(g);
    if (!flags.laptop) return g.say('DevEx: *typing furiously* ...no laptop? IT is in the south wing. Come back with hardware.');
    await g.say([`DevEx: *typing* ...*typing*... oh! Hi! You must be ${flags.name}! Welcome.`, `A ${flags.laptop}. Let me show you how we provision these.`]);
    flags.devex = true;
    const how = {
      Windows: ['DevEx: Clone the Windows setup repo, put your tokens in the config file, then run the setup script.', 'Chocolatey pulls Git, Maven, Docker Desktop, Java 21, glab, kubectl and Bruno. It configures WSL2, Telepresence and the local dev cluster.', 'Rerun it monthly and you stay on the latest tools.'],
      Linux: ['DevEx: Ubuntu with full-disk encryption on? Good, you cannot add it afterwards.', 'Clone the Linux setup repo, put your tokens in the config file, then run the provisioning script.', 'Ansible installs Docker, Java, Maven, Git, glab, Node, Telepresence, Bruno and the local dev cluster. Rerun it any time to realign.'],
      MacBook: ['DevEx: A MacBook! Fancy. Same routine as every other laptop.', 'Clone the setup repo, put your tokens in the config file, run the script.', 'It installs Docker, Java, Maven, Git, glab, Node, Telepresence, Bruno and the local dev cluster. Rerun it any time to stay up to date.'],
    }[flags.laptop];
    await g.say(how);
    await g.wait(800);
    flags.provisioned = true;
    g.hooks.onKey('solved');
    await g.say(['DevEx: ...and done. That was fast, huh?', 'The dev cluster is up, Telepresence connects, glab is logged in.', 'Now find a free chair at a desk and walk onto it to sit down. The two seats opposite me are free!']);
  },
  chair: async (g) => {
    if (!flags.provisioned) return g.say(flags.laptop ? 'A free desk. Your laptop would not even reach GitLab yet. Find DevEx first.' : 'A free desk. No laptop, nothing to do here yet.');
    return g.say(flags.working ? 'Your desk for today. The build is green. Life is good.' : 'A free desk. Walk onto the chair to sit down and start working.');
  },
  serverDoor: (g) => g.say(flags.serverOpen ? 'The server room door stands open.' : 'The server room. Locked. A sign says AUTHORIZED PERSONNEL ONLY. Somebody on this floor must have a key...'),
  pinball: async (g) => {
    await g.say('You pull the plunger. *clack* *ding* *ding* *DING*');
    g.hooks.onKey('pinball');
    await pinballTime(g);
    await g.say(['TILT! 3,200,100 points.', 'You feel happy. Also slightly guilty.']);
  },
  coffeeMachine: async (g) => {
    if (flags.coffeeQuest !== 'asked' || flags.coffee) return g.say(pick(['The coffee machine. It grinds, it hisses, it delivers.', 'You feel caffeinated.']));
    g.hooks.onKey('pinball');
    await g.say(['You press the big button. *grind* *hiss* *drip* ...a double espresso for your thirsty finance colleague.', 'You carry it very carefully.']);
    flags.coffee = true;
    give(g, 'floor+cup', 'Coffee');
  },
  server: 'The server room hums behind the wall. Blinking lights. Do not touch.',
  board: 'A whiteboard. Half a sequence diagram and the words "ask DevEx".',
  coreLift: 'The elevator core. You already had your ride for today.',
  massageTable: 'The massage room. There is a waiting list until next quarter.',
  sign: (g, o) => g.say(o.name),
  tile: (g, o) => {
    if (/plant|fern/.test(o.tile)) return g.say(plantTag());
    const [base, obj] = o.tile.split('+'); const l = TILE_TALK[o.tile] || TILE_TALK[obj] || TILE_TALK[base]; return l ? g.say(pick([].concat(l))) : undefined; },

  // chatter
  gamer: random('Developer: Pinball high score is mine. Try it if you dare.', 'Developer: Chill room rule: no laptops. Unless there is an incident. There is always an incident.'),
  massage: 'Colleague: Waiting for my massage slot. Been here since March.',
  bloom: busy('Colleague: S3 is for retros. Bring snacks, leave honest.'),
  westCoffee: busy('Developer: This coffee machine is the secret good one. Tell no one.'),
});

// ---- office chatter: corporate lingo, AI hype, local clusters, asset management, reporting ----
const R = (...lines) => random(...lines);
Object.assign(TALK, {
  // Pod 8: recruiters next to DevEx
  // Pod 7: developers and HR
  pod7: R(
    'Developer: We sit next to DevEx, so our builds stay green out of fear.',
    'Developer: I asked the AI assistant to write my unit tests. It asked me what the code is supposed to do. Fair question, honestly.',
    'Developer: We replaced our standup with an AI summary of our standup. Now we have a standup about the summary.',
  ),
  hr1: R(
    'HR: Welcome! Your onboarding checklist has 47 items. You have done 3. That is a great start!',
    'HR: Reminder: the wellbeing survey closes Friday. Please be honest. Anonymously honest.',
    'HR: We are launching an AI buddy for new joiners. It is great, but it keeps recommending the massage room.',
  ),
  hr2: R(
    'HR: Do not forget to fill in your skills matrix. "Pinball" is not a recognised competency. Yet.',
    'HR: Our core values are on the wall. And on the mugs. And now in the system prompt of our AI assistant.',
    'HR: Learning budget! Yes, you can spend it on an AI course. Everyone does. Some even finish one.',
  ),
  hr3: R(
    'HR: I am waiting for a candidate. The recruiters promised them a tour by "the person who sets up laptops in five minutes".',
    'HR: Team building next month: an escape room. The developers want to automate the puzzles.',
  ),
  // Pod 6: finance
  finance1: R(
    'Finance: We manage our own invoices in <company>. Asset management too. Did you know your laptop already has an asset tag?',
    'Finance: Every laptop is an asset, every asset has a lifecycle, every lifecycle ends in a spreadsheet. Here.',
  ),
  finance2: R(
    'Finance: Someone asked for a reporting dashboard on the cost of reporting dashboards. We built it. It is expensive.',
    'Finance: Our AI forecast said Q4 looks great. Our spreadsheet said "let us not get carried away".',
  ),
  finance3: R(
    'Finance manager: Cloud costs, licence costs, AI token costs. I dream in invoices now.',
    'Finance manager: Every team wants AI. Nobody wants the AI invoice. That is where I come in.',
    'Finance manager: Good morning! Is it morning? It feels like a fiscal year. How are you? Good? Good. Budget-neutral good.',
    'Finance manager: Lovely weather, right? Reminds me of our cash flow: sunny, with a chance of cost review.',
    'Finance manager: Plans for the weekend? I am reconciling my holiday photos against the travel policy.',
  ),
  // Side quest: a coffee for Pod 6 earns you the famous expense-refund spreadsheet.
  finance4: async (g) => {
    if (flags.coffeeQuest === 'done') return g.say(pick([
      'Finance: How is the spreadsheet treating you? Submit a refund, it lands in my inbox before you close the tab.',
      'Finance: Remember: the spreadsheet is between us. If everyone had it, I would have to automate the automation.',
      'Finance: Best coffee I had all week. Granted, it is Monday.',
    ]));
    if (flags.coffee) {
      await g.say(['Finance: Is that... for me? You absolute legend.', '*slurp* ...okay. A deal is a deal. Here is something cool.']);
      g.hud = g.hud.filter((h) => h.text !== 'Coffee'); flags.coffee = false; flags.coffeeQuest = 'done';
      give(g, 'floor+sheet', 'Refund sheet');
      await g.say([
        'You got the EXPENSE REFUND SPREADSHEET!',
        'Finance: Fully automated. Paste the receipt, it reads the amount, picks the cost centre, files the request in <company> and pings the approver.',
        'Finance: Nicely done, if I say so myself. Not many people have access. Now you do. Do not tell HR.',
      ]);
      return;
    }
    if (flags.coffeeQuest === 'asked') return g.say('Finance: Still waiting for that coffee. Any machine will do: the kitchen has two, the west wing has the secret good one.');
    await g.say(['Finance: Hey, new one! Do me a favour? Bring me a coffee from the kitchen and I will give you something cool.', 'Finance: Something very cool. Finance cool. Trust me.']);
    flags.coffeeQuest = 'asked';
  },
  // Facility management
  facility2: R(
    'Facility: The restrooms have sensors now. Do not ask what they measure. Asset management asked the same.',
    'Facility: Every chair, desk and plant on this floor is an asset in <company>. The ferns have serial numbers.',
  ),
  facility3: async (g) => {
    if (flags.serverOpen) return g.say('Facility: Enjoy the hum. Touch nothing with a blinking light. Or without one.');
    if (flags.fm === 'done') { openServerRoom(g); return g.say(['Facility: My colleague told me you put the whole floor back in order. Respect.', '*click* Facility: The server room is open for you. Look, do not touch.']); }
    return g.say(flags.provisioned
      ? 'Facility: The server room? Locked. I have the key, but you will have to earn it. Ask my colleague with the to-do list, she always needs help.'
      : 'Facility: Mind the door, it is the server room. Locked. Only a few people have the key. I am one of them. *jingles keys*');
  },
  // Kitchen
  coffee1: R(
    'Developer: First coffee of the day. The build is red anyway.',
    'Developer: We should circle back on that offline. Also, what does "offline" mean when we are in the kitchen?',
    'Developer: Is this coffee AI-powered? Asking for a pitch deck.',
  ),
  coffee2: R(
    'Tester: I found a bug before breakfast. It was in my own code.',
    'Tester: The AI assistant suggested a test case I never thought of. Then it suggested the same one 40 more times.',
  ),
  chat1: R(
    'Colleague: ...and then the pipeline passed on the third retry. Classic.',
    'Colleague: Did you see the customer event demo? The AI part got applause. The dark mode got a standing ovation.',
    'Colleague: Our team OKR is "leverage AI synergies". Nobody knows what it means, but it is green.',
  ),
  chat2: R(
    'Developer: We moved to one-command local environments. A whole <company> runs on your laptop now.',
    'Developer: With Telepresence you swap one service in the local cluster for the one on your laptop. It feels like cheating. It is allowed.',
  ),
  chat3: R(
    'Tester: Playwright tests run against the local cluster now. Flaky became fast. Fast became flaky-ish. Progress!',
    'Tester: I asked the AI assistant if my test was flaky. It said "it depends". It is ready for management.',
  ),
  kitchenWander: R('HR: I am only here for the fruit basket. And for informal feedback. Mostly the fruit.', 'HR: Is anyone using the big kitchen for the AI lunch-and-learn? I booked it twice by accident.'),
  sofa: R(
    'Tester: After lunch this sofa turns into the scroll zone. Instagram, TikTok, cat videos. Join us tomorrow, 12:45, bring your thumbs.',
    'Tester: Post-lunch scroll session, every day. We call it "market research". You are invited, obviously.',
    'Tester: I am not resting, I am doing exploratory testing of the sofa.',
  ),
  // Corridors and lobby
  intern: R(
    'Intern: Second week! I still get lost between the elevator core and the kitchen.',
    'Intern: I asked the AI assistant to explain our architecture. It drew a box labelled "magic". Honestly? Accurate.',
    'Intern: DevEx told me to run the provisioning monthly. I set a reminder. Then I snoozed it.',
  ),
  eastWalker: R(
    'Manager: Hiii! How was your weekend? ...Great, great. Mine was very productive. I synergised the garden.',
    'Manager: Busy week, right? Super busy. Crazy busy. Anyway, let us not boil the ocean on a Tuesday.',
    'Manager: Weather is lovely today, is it not? Very sunny. Very high-visibility. Like our Q4 roadmap.',
    'Manager: Walking meeting. Alone. It still counts. My smartwatch thinks I am a stakeholder.',
    'Manager: Coffee? Coffee. Ha. Coffee! ...Okay, let us take this offline.',
    'Manager: Long time no see! Since the standup. Feels like ages. Let us catch up properly. Next quarter.',
  ),
  southWalker: R('Tester: Found the bug. It was in the test. Classic.', 'Tester: Manager rooms are at the end. Knock twice, enter once, bring data.'),
  meeting2: R('Colleague: L3. Best view on the floor. Also the best meeting room.', 'Colleague: Reporting review. We are reporting on the reports. Meta-reporting. Very senior.'),
  // Pods 2, 3 and 5
  pod2a: R('Developer: We sit right behind reception, so we always know who is visiting.', 'Developer: Our sprint goal: "the AI answers tickets before the customer finishes typing". We are at 40 percent.'),
  pod2c: R('Developer: I work on reporting. Every customer wants one more column. We are at column 212.', 'Developer: Dashboards are like plants. Somebody has to water them, or they die quietly.'),
  pod2d: R(
    'Team lead: Let us align on the alignment meeting. I will send an invite.',
    'Team lead: Quick sync? It will take five minutes. *it will not take five minutes*',
    'Team lead: Hey hey! First day? Exciting! So exciting. Super exciting. Anyway, how is your bandwidth?',
    'Team lead: Did you see the game last night? Me neither. Let us circle back on it.',
    'Team lead: Ugh, Mondays, am I right? Ha. Haha. Anyway, the sprint goal will not deliver itself.',
    'Team lead: How are you settling in? Great! Love that. Let us put a pin in your feelings and revisit at the retro.',
  ),
  tester1: R('Tester: We test everything twice. Once for real, once for luck.', 'Tester: AI wrote the tests, AI reviewed the tests, I am here to blame.'),
  pod3c: R('Developer: We own the reports. All of them. Send help.', 'Developer: Someone asked for "AI-powered reporting". I added a sparkle emoji to the export button.'),
  dev1: R('Developer: We ship and we test. We are a system. A small one.', 'Developer: Asset management integration is done. We can now track the laptop that tracks the assets.'),
  tester2: (g) => g.say(flags.provisioned ? 'Tester: Provisioned! Now you can break things properly. In the local cluster first, please.' : 'Tester: Found DevEx yet? Far north, top-left corner of the open office, next to the recruiters.'),
  pod5b: R('Developer: We just shipped. You can tell by the silence.', 'Developer: We are "AI-first" now. That means the AI goes first, and then we fix it.'),
  manager1: R(
    'Manager: My door is always open. Metaphorically. It is glass. Please knock.',
    'Manager: Let us take a step back and look at the big picture. The big picture is a roadmap. With AI on it.',
    'Manager: Before we deep-dive, let us level-set on the north star, so we are all rowing in the same direction.',
    'Manager: Love the energy! Can you take that offline, socialise it with the stakeholders and circle back by EOD?',
    'Manager: This is a great learning opportunity. By which I mean: it is on fire, and it is now yours.',
    'Manager: We need to move the needle on the KPIs that drive the OKRs that support the strategy that enables the vision.',
    'Manager: Let us not boil the ocean. Let us find the low-hanging fruit, pluck it, and put it in the parking lot for Q3.',
    'Manager: I have a hard stop in five, but quick win: let us double-click on that and unpack the learnings.',
    'Manager: Going forward, let us be more proactive about being reactive. Synergy-wise, I think we are aligned.',
    'Manager: Welcome aboard! Your 30-60-90 plan is in my drafts. Think of it as a living document. It is very much alive.',
  ),
  manager2: R(
    'Manager: One-on-one in five minutes! Not you. Not yet.',
    'Manager: I asked the AI assistant to write my performance reviews. HR asked me not to. The AI agreed with HR.',
    'Manager: Do we have bandwidth for this? Let us run a quick capacity check against the holistic resourcing matrix.',
    'Manager: I am not saying no. I am saying not now, in a way that sounds like yes, pending alignment.',
    'Manager: Let us put a pin in it, add it to the backlog of the backlog, and revisit at the next quarterly offsite.',
    'Manager: From a 30,000-foot view, this is a value-add. From 3 feet, it is a spreadsheet. Both are valid perspectives.',
    'Manager: I want us to be customer-obsessed, data-driven, AI-first and people-centric. Ideally by Thursday.',
    'Manager: Per my last email, as per our previous sync, as discussed in the pre-meeting for this meeting...',
    'Manager: We are not a family, we are a team. A high-performing, cross-functional, psychologically safe team.',
    'Manager: Quick reminder: my calendar is the source of truth. If it is not in there, it did not happen. Neither did lunch.',
  ),
});

// ---- lunch talk, ice cream politics, snacks, recruiters with real vacancies ----
const LUNCH = [
  'Colleague: Garázs again? Daily menu, good quality, and yes, I will have the rántott sajt. Again.',
  'Developer: Garázs is a proper kifőzde. Soup, main, done in 25 minutes. The deep-fried cheese is a team ritual.',
  'Colleague: Dagoba today? Healthy bowls, a veggie option and chicken on everything. I need the salad after yesterday.',
  'Tester: Dagoba has salad with every dish. Even the salad comes with salad.',
  'Developer: The Chinese buffet round the corner: cheap, huge portions, and an afternoon nap included.',
  'Colleague: Feeling low? Lidl ready meals. They do not taste of much, but they are fast and cheap. Like a hotfix.',
  'Developer: Lunch decision protocol: Garázs if it is Friday, Dagoba if you want something healthy, the Chinese buffet if you are starving.',
  'Manager: We spent 20 minutes deciding where to eat. That is longer than our sprint planning.',
];
const ICE = [
  'Colleague: Is there ice cream in the freezer? ...no. Ice cream is a summer-season benefit. It is October.',
  'Developer: I filed a ticket: "No ice cream in office". Facility closed it as "works as designed - summer only".',
  'Tester: The freezer is empty until summer. I check every day. For regression testing.',
];
const lunchTalk = (...extra) => R(...LUNCH, ...extra);
Object.assign(TALK, {
  lunch1: lunchTalk('Colleague: Lunch at 11:30 is not early. It is strategic.'),
  lunch2: lunchTalk('Developer: ...so the pipeline cleaner deleted 4000 stale pipelines last night. And nobody noticed. That is the dream.'),
  lunch3: R(...ICE, 'Tester: The west wing kitchenette has the good coffee machine. You did not hear it from me.'),
  terrace1: lunchTalk('Colleague: Terrace meeting. Fresh air, no projector, best decisions.'),
  fridge: R('The fridge. A yoghurt labelled "NOT YOURS". Fair.', 'The freezer drawer is empty. A note says: "Ice cream returns in summer. Stay strong."'),
  // What is really in the cabinet: vaníliás karika, Pilóta keksz, Mese keksz, chips, tortilla chips, ropi,
  // peanuts, pistachios and other nuts, healthy snacks and sugar-free snacks.
  snacks: R(
    'The snack cabinet! Vaníliás karika, Pilóta keksz, Mese keksz, chips, tortilla chips, ropi, peanuts, pistachios and other nuts, healthy snacks and a sugar-free shelf.',
    'You take a handful of pistachios. Now you need somewhere to put the shells. The plant looks tempting. Do not.',
    'Salted peanuts: the snack you eat one of, and then forty more.',
    'A jar of mixed nuts: almonds, cashews, hazelnuts. The cashews are always gone first.',
    'You take a few vaníliás karika. Vanilla rings: the official fuel of code reviews.',
    'Pilóta keksz! The jam-filled biscuit every Hungarian colleague grew up with. You take two. Okay, three.',
    'Mese keksz, the biscuit with fairy tale pictures. You read the story on yours before eating it.',
    'You grab a handful of ropi. Salty sticks, perfect for thinking about a bug.',
    'Chips or tortilla chips? You take both. It has been a long first day.',
    'The healthy shelf: rice crackers, dried fruit, seeds. You look at it, nod respectfully, and take the chips.',
    'The sugar-free shelf. Somebody wrote "it still counts as a snack" on a sticky note.',
    'A sign on the cabinet: "Snacks are for everyone. Yes, that includes the people who sit closest."',
  ),
  facility1: R(
    'Facility: The coffee machine reports its own incidents in <company> now. It filed three this morning. All about descaling.',
    'Facility: No, there is no ice cream. Summer season only. I get asked this 40 times a day. Even in October.',
    'Facility: The snack cabinet is refilled on Mondays. By Monday afternoon it is a museum.',
  ),
  recruiter1: R(
    'Recruiter: We are hiring a Senior Software Engineer and an Engineering Manager, both here in Budapest. Know anyone? Referral bonus!',
    'Recruiter: Open now: a Principal Cloud Engineer for Azure. If you know someone who speaks fluent Bicep, send them my way.',
    'Recruiter: Our referral bonus is real. Tell your friends that DevEx sets up laptops in five minutes. Best selling point we have.',
    'Recruiter: I sit next to DevEx so candidates can see all the monitors. Very impressive in a video call background.',
  ),
  recruiter3: R(
    'Recruiter: I am the newest recruiter. I recruited myself. Very efficient process.',
    'Recruiter: Three recruiters next to DevEx? We are hiring recruiters too. It is recruiters all the way down.',
    'Recruiter: Fun fact: DevEx only wears black. We put "dress code: whatever DevEx is not wearing" in the job ads.',
    'Recruiter: Our interview has a live coding part. Candidates who use the five-minute laptop setup get bonus points.',
  ),
  recruiter2: R(
    'Recruiter: My favourite opening: Senior Agentic Quality Engineer. Testing AI with AI. The future is weird and I love it.',
    'Recruiter: We also need a Senior UX Researcher who speaks German, and an Account Manager for 12 months in Sales.',
    'Recruiter: Everything is on our careers page, under vacancies. Share it, like it, refer your cousin.',
    'Recruiter: Candidates always ask about the tech stack. I say "Jakarta EE" and they think it is a holiday destination.',
  ),
  // Busy people: they do not stop for you
  phoneWalker: R(
    '*on the phone* "...no, the OTHER Kubernetes cluster..." They walk right past you.',
    '*on the phone* "...can you hear me now? ...and now? ...I will call you from the terrace." They wave you away.',
    '*on the phone* "...yes, the customer wants AI. Which AI? All of it." They do not even look at you.',
  ),
  typer: R(
    '*clack clack clack clack* The screen is scrolling faster than you can read. They do not notice you.',
    '*CLACKCLACKCLACK* "...prod... incident... why is it always Friday..." Better not disturb.',
    '*furious typing* A log file flies by in red. You back away slowly.',
  ),
});

// ---- lobby buffet, the closed courtyard and the construction noise ----
const NOISE = [
  '*BRRRRRRT* ...sorry, what? The courtyard construction started again.',
  'They are drilling in the courtyard again. My noise-cancelling headphones filed a complaint.',
  'Every time I start a meeting, the jackhammer starts too. I think it is subscribed to my calendar.',
  'Construction noise level today: "deploying on a Friday".',
];
const BUFFET = [
  ['Coffee', 'Barista: One flat white, 690 Ft. *hiss* You feel ready for anything. Even a standup.'],
  ['Pogácsa', 'Barista: Túrós pogácsa, still warm, 390 Ft. Crumbs are free of charge.'],
  ['Croissant', 'Barista: Butter croissant, 590 Ft. Flaky, like the integration tests.'],
];
Object.assign(TALK, {
  barista: (g) => TALK.buffet(g),
  buffet: async (g) => {
    await g.say('Barista: Hi! Coffee, pastries, snacks. What will it be?');
    const i = await g.choose([...BUFFET.map(([n]) => n), 'Nothing, thanks']);
    if (i === BUFFET.length) return g.say('Barista: No problem. I am here until four. The pogácsa is usually gone by ten.');
    g.hooks.onKey('blip');
    await g.say(BUFFET[i][1]);
  },
  otherLift: (g, o) => g.say(`Elevator ${o.label}. For the other tenants only: IBM, Turbine and friends. Your badge does nothing here.`),
  otherPanel: 'A call panel for floors 2 and 4 to 9. Floor 3 is not even on it. Rude.',
  otherGate: (g) => g.say(flags.badge
    ? ['You hold your QR badge to the reader... *BZZT* Red light.', 'ACCESS DENIED: wrong tenant. <company> lifts are on the west side, behind the security booth.']
    : 'A gate with a red QR reader. Other tenants only.'),
  otherSign: 'TENANT LIFTS E-F: floors 2, 4-9. <company> (floor 3): use lifts A-D on the west side.',
  tenant: R(
    'Tenant: I work upstairs on the 5th. These lifts are ours. Yours are on the other side, behind the guards.',
    'Tenant: Every morning someone from <company> tries our gate. It beeps red. Every morning.',
    'Tenant: Your floor has the pinball machine, right? We have heard it through the ceiling. We are jealous.',
  ),
  buffetSign: 'BÜFÉ - coffee, pastries, snacks. Card payment only.',
  courtyardDoor: (g) => g.say(['A big glass door to the inner courtyard garden. It is closed: yellow and black tape, and a sign.', '"CLOSED FOR CONSTRUCTION. We are making the garden even greener. Sorry for the noise!"', '*BRRRRRT* ...right on cue.']),
  grumpy: R(...NOISE.map((l) => 'Developer: ' + l), 'Developer: I came down for a quiet coffee. The courtyard had other plans.'),
  visitor: R('Visitor: I am here for a demo. Service management, they said.', 'Visitor: Do you work here? ...oh, first day. Then we are both lost.', 'Visitor: Is that drilling part of the demo? Very immersive.'),
  guard2: R('Guard 2 (behind the glass): *sips coffee* ...first days, huh. The desk is round the front.', 'Guard 2: The courtyard? Closed. Construction. I have heard that drill for three weeks. I hear it in my sleep.'),
  // Only speaks Hungarian. Translations: good day, sorry, no English / careful, construction, the entrance is
  // that way / we drill Monday to Friday, sorry for the noise / coffee? no thanks, I already had three.
  worker: (g) => g.say([pick([
    'Munkás: Jó napot! Bocsánat, nem beszélek angolul.',
    'Munkás: Vigyázzon, itt építkezés van! A bejárat arra van, a kert végén.',
    'Munkás: Hétfőtől péntekig fúrunk. Bocsi a zajért!',
    'Munkás: Kávé? Nem, köszönöm, már ittam hármat.',
  ]), 'You nod politely. You understood exactly zero words.']),
  // Fixing the courtyard door; Hungarian only. Translations: this door is not right yet, ready by tomorrow, maybe /
  // not this way, the courtyard is closed, construction / where is the screwdriver? ...it is not you, is it? /
  // one moment, I am just adjusting the hinge.
  doorWorker: (g) => { g.hooks.onKey('pinball'); return g.say([pick([
    'Munkás: Ez az ajtó még nem jó. Holnapra kész lesz. Talán.',
    'Munkás: Ne erre! Az udvar zárva van, építkezés.',
    'Munkás: Hol a csavarhúzó? ...Nem maga az, ugye?',
    'Munkás: Pillanat, csak beállítom a zsanért.',
  ]), pick(['You smile and nod. He goes back to the hinge.', 'You nod politely. You understood exactly zero words.'])]); },
  gardener: 'Colleague: The real inner garden is behind the lobby, 3000 square metres. Closed for construction right now. This front garden will have to do.',
  terrace2: R(
    'Manager: I came out here for a phone call. That was forty minutes ago.',
    'Manager: Nice view, huh? Very... horizon. Very north star. Speaking of which, have you seen our vision deck?',
    'Manager: Fresh air! Great for ideation. I have had three ideas and scheduled meetings about all of them.',
    'Manager: *BRRRT* Ah, the courtyard drill. It really drills down, ha. Drill down! ...Nobody laughs at that one either.',
    'Manager: So! Settling in? Lunch plans? Long-term career goals? Okay, too soon, let us parking-lot that.',
    ...NOISE.map((l) => 'Manager: ' + l),
  ),
  pod2b: R('Tester: We test the self-service portal. If you can break it, lunch is on me.', 'Tester: Accessibility first. Even the error messages are polite here.', 'Tester: I wrote a test that fails whenever the courtyard drill starts. It is the most reliable test we have.'),
});

// ---- M2: booked all day ----
Object.assign(TALK, {
  m2Door: (g) => g.say(['M2. The door is closed. A small screen next to it says:', 'BOOKED - all day, 08:00 to 18:00.', 'Through the glass you see someone on a call, laptop open, headset on. Better not knock.']),
  water: R('A water dispenser. Cold, sparkling or room temperature. You pick sparkling and feel fancy.', 'The water dispenser gurgles. Hydration is a core value. Unofficially.'),
  m2Light: 'A little red light: the room is booked. It has been red since 8 this morning.',
  m2Caller: '*through the door* "...yes, I can see your screen... no, the other one... can we take this offline? I have the next call in two minutes."',
  wanderer1: R(
    'Developer: *walks with a laptop* Standup moved to the kitchen. Again.',
    'Developer: From DevEx to the kitchen is exactly 73 steps. I asked the AI assistant to optimise the route. It suggested working from home.',
    'Developer: M2 is booked again, the whole day. Someone is in there on back-to-back calls. I think they live in there now.',
  ),
});

// Local tips from the bench smoker on the street.
const LOCAL = [
  'The metro stop is called Klinikák because of the Semmelweis University clinics all around. Half the street wears scrubs.',
  'Corvin Plaza is two minutes away: shops, a food court, and a cinema upstairs.',
  'The Füvészkert botanical garden is round the corner. Oldest in Hungary, and much quieter than this building site.',
  'This whole area was rebuilt as the Corvin Promenade. Twenty years ago it was all crumbling old courtyards.',
  'Corvin köz and the Corvin cinema are just over there. 1956, history on every corner.',
  'Ferenc körút is a short walk west: trams 4 and 6, all night long.',
];

// ---- West wing: the dev teams (fictional, for the playtest edition) ----
const TEAMS = {
  otter: [
    'Developer: Team Otter. Search: if you typed it, we find it. If you misspelled it, we find it anyway.',
    'Developer: Our newest toy: search that understands "that ticket from last Tuesday about the printer".',
    'Developer: Ranking is an art. Someone always says the result they wanted is on page two.',
  ],
  heron: [
    'Developer: Team Heron: reporting. Dashboards, charts and exports for the spreadsheet lovers.',
    'Developer: Someone always wants one more column. We have an export for that.',
    'Developer: If it has a number, Heron draws a chart of it. If it has two, we draw a trend line.',
  ],
  kite: [
    'Developer: Team Kite. We build the customer portal: the frame, the navigation, the first thing customers see.',
    'Developer: Pixel makes the portal look good, we make it work. Teamwork, bird style.',
    'Developer: Our standup is a world tour of accents. Great for learning greetings in five languages.',
  ],
  spark: [
    'Developer: Spark is about two of us and a lot of API keys. All the AI plumbing runs through us.',
    'Developer: Every AI request goes through our gateway: one door for all the models.',
    'Developer: Ask me about embeddings. Actually, do not, I will not stop.',
  ],
  spark2: [
    'Developer: Our assistant drafts the reply. A human still presses send. Humans in the loop.',
    'Developer: Two people, sixteen services. Do not tell the recruiters, they will make it a job ad.',
  ],
  relay: [
    'Developer: Team Relay. We connect the AI to the rest of the product, so it can actually do things.',
    'Developer: Spark builds the AI parts, Kite builds the screens, we wire them together. The relay team.',
  ],
  relay2: [
    'Developer: People ask if Relay is short for something. It is not. We just pass things on, but smarter.',
    'Developer: Lunch decisions are quick here: soup place, unless someone says burgers first.',
  ],
  badger: [
    'Developer: Team Badger. We build the mobile app. Your tickets, in your pocket.',
    'Developer: Our backend-for-frontend sits between the app and the rest, so the app only gets what it needs.',
    'Developer: Everyone gets their own task overview. Your cards stay where you put them.',
  ],
  pixel: [
    'Designer: Team Pixel: the design system. Every button, colour and spacing you see comes from us.',
    'Designer: Brand blue is not just a blue. It is THE blue. Please never put #0000FF in a merge request.',
    'Designer: Other teams build features, we build the bricks. If two buttons look different, someone skipped Pixel.',
  ],
};
Object.assign(TALK, Object.fromEntries(Object.entries(TEAMS).map(([id, lines]) => [id, busy(R(...lines))])));
Object.assign(TALK, {
  reader: 'Colleague (whispering): Every morning before nine, the chill room is a silent book club. No talking, just reading. Join us.',
});

// ---- L2: the product teams' big team week and planning ----
Object.assign(TALK, {
  facilitator: R(
    'Facilitator: Welcome to team week! Product people from all over <company>, one room, three days, a thousand sticky notes.',
    'Facilitator: Planning rule number one: if it does not fit on a sticky note, it does not fit in the quarter.',
    'Facilitator: Next up: the dependency board. Red strings mean two teams need each other. It looks like a crime show.',
  ),
  meeting: R('Product owner: I came all the way from headquarters for this planning. The flight was shorter than our backlog refinement.', 'Product owner: My roadmap has three lanes: now, next, and "after we finally fix that one bug".'),
  guest: R('Product manager: Team week is the best week. Everyone in one room, no video lag, real whiteboards.', 'Product manager: We are aligning the roadmap across all product teams. Aligning is a big word for "moving sticky notes".'),
  product1: R('UX designer: Over from Belgium for team week. I have already drawn four user journeys on the window.', 'UX designer: Customer interviews say one thing loud and clear: fewer clicks. We are counting every click this week.'),
  product2: R('Architect: I am here from the Netherlands to keep everyone honest about dependencies. That makes me very popular.', 'Architect: Every plan looks great until someone asks "and who owns that API?". That is my job.'),
  product3: R('Product owner: Germany, reporting for duty. We brought chocolate, the Budapest team brought pogácsa. Diplomacy works.', 'Product owner: Our sprint goal for the quarter fits on one sticky note. A very small font, but one sticky note.'),
  product4: R('Product owner: Flew in this morning. Our support colleagues already use AI every day, so I am here to make sure the roadmap keeps up.', 'Product owner: Big room planning is like Tetris: every team brings a piece, and the lines only clear if they fit.'),
  product5: R('Product manager: Team week means we finally put faces to the Teams avatars. You look exactly like your profile picture, by the way.', 'Product manager: Tonight is the team dinner. Lángos was voted down, again. Democracy is hard.'),
  product6: R('Product owner: Budapest is hosting this time, so I only had to walk from the west wing. Lucky me.', 'Product owner: We vote on priorities with dot stickers. I have three left and twelve favourite features.'),
});

// ---- Spotters: colleagues who notice you and come over (see `spot` in maps.js) ----
const BUDAPEST_FACTS = [
  // Budapest
  'The M1 metro under Andrássy út opened in 1896. It is the oldest underground line on the European mainland.',
  'Budapest was born in 1873, when Buda, Óbuda and Pest merged into one city.',
  'Corvin köz, right around the corner, was a centre of the 1956 revolution. The Corvin cinema is still there.',
  'The city sits on more than a hundred thermal springs. Széchenyi is one of the biggest bath complexes in Europe.',
  'The M3 line you came on runs north-south for about 17 kilometres. Klinikák is one of its stops.',
  'The Chain Bridge opened in 1849. It was the first permanent bridge across the Danube in Budapest.',
  'The Parliament building is the largest building in Hungary. It was finished in 1904.',
  'Margaret Island has almost no car traffic, and a running track of about 5 kilometres goes all the way around it.',
  'The Great Market Hall opened in 1897. Go upstairs for lángos, downstairs for paprika.',
  'Trams 4 and 6 on the Grand Boulevard are among the busiest tram lines in the world.',
  'The Danube banks, the Buda Castle Quarter and Andrássy út are a UNESCO World Heritage site.',
  'Gellért Hill is named after Saint Gerard, a bishop who, according to legend, was thrown off it.',
  'Heroes\' Square was built for the 1896 millennium celebrations of the Hungarian state.',
  'Vajdahunyad Castle in City Park mixes styles from all over Hungary. Its first version was made of wood and cardboard.',
  'Budapest Zoo opened in 1866, which makes it one of the oldest zoos in the world.',
  'The Children\'s Railway in the Buda hills is run mostly by kids aged 10 to 14, apart from the driver.',
  'The Dohány Street Synagogue is the largest synagogue in Europe.',
  'Liberty Bridge opened in 1896. It was first named after Emperor Franz Joseph.',
  'The M2 and M4 metro lines run under the Danube.',
  'Buda hides a whole cave system. You can climb through Pál-völgyi cave with a guide.',
  'The Danube flows through ten countries and four capitals: Vienna, Bratislava, Budapest and Belgrade.',
  'Formula 1 has raced at the Hungaroring near Budapest since 1986, the first Grand Prix behind the Iron Curtain.',
  'The national stadium is named after Ferenc Puskás, one of the greatest footballers ever.',
  'The Semmelweis University clinics all around here are named after Ignác Semmelweis, who pushed doctors to wash their hands.',
  // People
  'The Rubik\'s Cube was invented in Budapest, in 1974, by Ernő Rubik.',
  'László Bíró, the inventor of the ballpoint pen, was born in Budapest.',
  'John von Neumann, one of the fathers of modern computing, was born in Budapest in 1903.',
  'Dennis Gabor, who invented holography, was born in Budapest. He got the Nobel Prize for it in 1971.',
  'Harry Houdini was born in Budapest, as Erik Weisz.',
  // Language
  'Hungarian is not related to its neighbours\' languages. Its distant cousins are Finnish and Estonian.',
  'Hungarians write the family name first. Rubik Ernő, not Ernő Rubik.',
  'Hungarian has 14 vowels. Ö and ő, ü and ű are all different letters.',
  '"Szia" means both hello and goodbye. Very efficient.',
  'Cheers in Hungarian is "egészségedre". Practice it before the team dinner.',
  'Hungarians celebrate name days, sometimes almost as much as birthdays. There is a calendar for it.',
  // Food and habits
  'Traditionally Hungarians do not clink beer glasses. The legend goes back to 1849.',
  'Paprika is a national treasure. Szeged and Kalocsa compete over who makes the best.',
  'Túró Rudi is a sweet curd-cheese bar in chocolate. Hungarians abroad smuggle it home.',
  'Unicum is a bitter herbal liqueur made by the Zwack family since 1790. It is an acquired taste.',
  'Lángos is deep-fried dough with sour cream and cheese. Diet starts tomorrow.',
  'Kürtőskalács is the chimney cake: dough wrapped around a spit, roasted and rolled in sugar.',
  'Pálinka is a strong fruit brandy. Apricot and plum are the classics.',
  // Hungary
  'Lake Balaton is the largest lake in Central Europe. In summer half of Budapest moves there.',
  'The vizsla, the golden hunting dog, is a Hungarian breed.',
  'Hungary has won more Olympic gold medals in water polo than any other country.',
];
// 16x16 cats. B body, W white, E eye, k pupil, P nose; one palette per cat.
const CAT = [
  '................', '...B.......B....', '...BB.....BB....', '...BBBBBBBBB....', '..BBBBBBBBBBB...', '..BBEkBBBEkBB...',
  '..BBBBBBBBBBB...', '..BBBBBPBBBBB...', '...BBBBBBBBB....', '....BBBBBBB.....', '...BBWWWWWBB....', '..BBBWWWWWBBB...',
  '..BBBWWWWWBBB..B', '..BBBBBBBBBBB.BB', '..BB.BBB.BBBBBB.', '...WWWW.WWWW....',
];
const CATS = [
  [{ B: '#F9A35C', W: '#FFFFFF', E: '#48BF86', k: '#1E2A33', P: '#F4A6B8' }, 'This is Paprika. She reviews my merge requests by sitting on the keyboard.'],
  [{ B: '#A8ADB3', W: '#FFFFFF', E: '#3EB1CC', k: '#1E2A33', P: '#F4A6B8' }, 'Pogácsa. Sleeps on the warm laptop charger. Every. Single. Day.'],
  [{ B: '#1E2A33', W: '#3A3A3A', E: '#FFD134', k: '#1E2A33', P: '#C24530' }, 'Shadow. Runs Kubernetes at night. Probably. Never seen him sleep.'],
];
function catPictures(g) {
  return new Promise((res) => {
    let i = 0;
    g.overlay = {
      key(k) { if (k !== 'A' && k !== 'B') return; g.hooks.onKey('blip'); if (++i >= CATS.length) { g.overlay = null; res(); } },
      draw(ctx, W, H) {
        const [pal, caption] = CATS[i], S = 12, x0 = W / 2 - 8 * S, y0 = 40;
        g.box(W / 2 - 220, 16, 440, H - 32);
        ctx.fillStyle = '#E3F6FB'; ctx.fillRect(x0 - 8, y0 - 8, 16 * S + 16, 16 * S + 16);
        CAT.forEach((row, y) => [...row].forEach((c, x) => { if (pal[c]) { ctx.fillStyle = pal[c]; ctx.fillRect(x0 + x * S, y0 + y * S, S, S); } }));
        ctx.font = '11px "Press Start 2P", monospace'; ctx.fillStyle = '#3A3A3A'; ctx.textBaseline = 'top'; ctx.textAlign = 'center';
        wrapLines(caption, 34).forEach((l, n) => ctx.fillText(l, W / 2, y0 + 16 * S + 24 + n * 18));
        ctx.fillStyle = '#E65038'; ctx.fillText(`${i + 1}/${CATS.length}   Space: next`, W / 2, H - 52);
        ctx.textAlign = 'left';
      },
    };
  });
}
const wrapLines = (t, n) => t.split(' ').reduce((ls, w) => ((ls.at(-1) + ' ' + w).trim().length > n ? ls.push(w) : (ls[ls.length - 1] = (ls.at(-1) + ' ' + w).trim()), ls), ['']);

Object.assign(TALK, {
  // Quizzes you, then needs 30 s to "write the next question"; after that he notices you again (spotAgainAt).
  // No question repeats until all have been asked.
  quizzer: async (g, n) => {
    if (n.spotAgainAt && performance.now() < n.spotAgainAt) return g.say('Colleague: Give me a moment, I am writing the next question. Stick around!');
    n.asked ||= [];
    const fresh = (pool) => pool.filter((x) => !n.asked.includes(x.q));
    if (!fresh([...NEWS, ...TECH]).length) n.asked = [];
    const news = fresh(NEWS).length && (!fresh(TECH).length || Math.random() < 0.6); // mostly fresh office news
    const item = pick(fresh(news ? NEWS : TECH));
    n.asked.push(item.q);
    const { q, options, right, explain } = ask(item);
    await g.say(n.met ? `Colleague: ${flags.name}, you are still here! Ready for another one?` : `Colleague: Hey, ${flags.name}! You are new, right? Then you have to take my quiz. Everyone does.`);
    n.met = true;
    if (news) await g.say('Colleague: This one is from the intranet news. Reading it is part of the job. Officially.');
    const i = await g.choose(options, 'Colleague: Pop quiz! ' + q);
    g.hooks.onKey(i === right ? 'solved' : 'blip');
    await g.say(i === right ? `Colleague: Correct! ${explain}` : `Colleague: Nope! ${explain} You will get the next one.`);
    n.spotAgainAt = performance.now() + 30000;
  },
  // Tells facts in random order and never repeats one until all have been told; then starts over.
  budapestFan: async (g, n) => {
    n.told ||= [];
    let lap = '';
    const next = () => {
      let fresh = BUDAPEST_FACTS.filter((f) => !n.told.includes(f));
      if (!fresh.length) { n.told = []; fresh = [...BUDAPEST_FACTS]; lap = 'Colleague: You have heard every single one! Impressive. Back to the top, then.'; }
      const f = pick(fresh); n.told.push(f); return f;
    };
    if (n.met) { const f = next(); return g.say([lap, `Colleague: Fun fact: ${f}`].filter(Boolean)); }
    n.met = true;
    await g.say([`Colleague: Welcome to Budapest, ${flags.name}! Did you know?`, next(), 'And also:', next(), `Colleague: Ask me again any time. I have ${BUDAPEST_FACTS.length - 2} more.`]);
  },
  catLover: async (g, n) => {
    if (n.met) return g.say('Colleague: Want to see them again? ...okay, maybe later. I have 2,000 more on my phone.');
    n.met = true;
    await g.say(['Colleague: Oh! New person! Do you like cats? Of course you do. Everyone likes cats.', 'Colleague: Look, look, look.']);
    await catPictures(g);
    await g.say(['Colleague: Aren\'t they the cutest? I have a whole Teams channel for them. You are now subscribed.']);
  },
});

// ---- The facility manager: roams the floor putting things back; her to-do list opens the server room ----
export const FIXER_ROUTE = [[56, 13], [46, 12], [46, 30], [33, 33], [52, 48], [58, 30]];
const FM_TASKS = [
  { tile: 'pave+cup', find: 'a dirty mug on the terrace', fix: 'You carry the mug back to the kitchen and put it in the dishwasher.' },
  { tile: 'floor+chair', find: 'a meeting-room chair in the west corridor', fix: 'You roll the chair back into M2. Wait, M2 is booked. You leave it politely by the door.' },
  { tile: 'floor+plant', find: 'a plant somebody moved into the men\'s restroom', fix: 'You carry the plant back out to the corridor. It looks relieved.' },
  { tile: 'chill+book', find: 'a book from the reception shelf, abandoned in the chill room', fix: 'You put the book back on the reception shelf. Chapter 3, by the bookmark.' },
  { tile: 'kitchen+laptopBlack', find: 'a forgotten laptop on a kitchen table', fix: 'You bring the laptop to IT for the lost and found. Its owner will be very grateful.' },
];
let roaming = false;
export function onMap(name, g) {
  if (name !== 'office' || roaming || !g?.walkNpc) return;
  roaming = true;
  const fixer = MAPS.office.npcs.find((n) => n.id === 'fixer');
  (async () => {
    for (let i = 0; ; i = (i + 1) % FIXER_ROUTE.length) {
      await g.walkNpc(MAPS.office, fixer, FIXER_ROUTE[i]);
      await wait(2500); // fixing something at each stop
    }
  })();
}
function fmTodo(g) {
  const item = g.hud.find((h) => h.text.startsWith('To-do'));
  if (item) item.text = `To-do ${flags.fmFixed.length}/${FM_TASKS.length}`;
}
function openServerRoom(g) {
  flags.serverOpen = true;
  const r = MAPS.office.rows; r[21] = r[21].slice(0, 45) + '.' + r[21].slice(46); // the door swings open
  MAPS.office.objects.find((o) => o.id === 'serverDoor').solid = false;
  if (g) g.minimap = null;
}
Object.assign(TALK, {
  fixer: async (g) => {
    if (flags.fm === 'done') return g.say(pick(['Facility: Thanks again for the help! The floor has never looked this tidy. For about ten minutes.', 'Facility: If you see a chair where it should not be, you know who to call.']));
    if (flags.fm === 'active') {
      if (flags.fmFixed.length < FM_TASKS.length) {
        const left = FM_TASKS.filter((_, i) => !flags.fmFixed.includes(i)).map((t) => t.find);
        return g.say([`Facility: ${left.length} to go! Still out there:`, ...left.map((t) => `- ${t}`)]);
      }
      flags.fm = 'done';
      g.hud = g.hud.filter((h) => !h.text.startsWith('To-do')); g.hooks.onKey('solved');
      return g.say([
        'Facility: All five? You are a natural! Here is a little secret as a thank-you.',
        'Facility: The server room: my colleague standing at its door has the key. Tell him I sent you and he will let you in.',
        'Facility: And the IT storage room? Ask IT nicely. They have a key for everything, they just pretend they do not.',
      ]);
    }
    await g.say(['Facility: Oh, hi! Sorry, busy busy. People keep putting things in the wrong place.', 'Facility: Mugs on the terrace, chairs in corridors, plants in the restroom. Every. Single. Day.']);
    if (await g.choose(['I can help', 'Maybe later'], 'Facility: Want to help me put things back?') === 1) return g.say('Facility: No worries. I will be walking around, as always.');
    flags.fm = 'active';
    MAPS.office.objects.filter((o) => o.id === 'misplaced').forEach((o) => { o.tile = FM_TASKS[o.task].tile; });
    g.hud.push({ tile: 'floor+board', text: `To-do 0/${FM_TASKS.length}` });
    await g.say(['Facility: You are a lifesaver! Here is my list:', ...FM_TASKS.map((t) => `- ${t.find}`), 'Facility: Find them, walk over them or press Space next to them, then come and find me.']);
  },
  misplaced: async (g, o) => {
    if (flags.fm !== 'active' || flags.fmFixed.includes(o.task)) return;
    flags.fmFixed.push(o.task); o.tile = null; fmTodo(g); g.hooks.onKey('blip');
    await g.say([FM_TASKS[o.task].fix, flags.fmFixed.length === FM_TASKS.length ? 'That was the last one! Time to tell the facility manager.' : `${FM_TASKS.length - flags.fmFixed.length} left on the list.`]);
  },
});

// NPCs with a "!" over their head: someone the story wants you to talk to next.
export const mark = (n) => n.id === 'receptionist' && !flags.checkedIn;

// ---- Looking at an item picked from the I menu ----
export function useItem(item, g) {
  if (item.text.startsWith('To-do')) {
    const left = FM_TASKS.filter((_, i) => !flags.fmFixed.includes(i)).map((t) => `- ${t.find}`);
    return g.say(left.length ? ['Facility to-do list, still to put back:', ...left] : ['Facility to-do list: all done! Go and tell the facility manager.']);
  }
  const laptopState = flags.provisioned ? 'Provisioned and ready to code.' : 'Still blank. DevEx sets it up, north end of the open office.';
  const about = {
    'QR badge': 'A temporary QR badge from the guards downstairs. It opens the gate in the rail by the lifts.',
    Badge: `Your <company> badge: ${flags.name}, photo and all. It opens both doors of the lift lobby on the 3rd floor.`,
    Training: 'Your onboarding training: done. Values, wellbeing and a perfect phishing instinct.',
    MacBook: `Your shiny silver MacBook. ${laptopState}`,
    Linux: `Your black Linux ThinkPad. ${laptopState}`,
    Windows: `Your blue Windows laptop. ${laptopState}`,
    Coffee: 'A double espresso for the finance colleague in the open office. Still warm. Do not drink it.',
    'Refund sheet': 'The famous automated expense refund spreadsheet. Paste a receipt, it does the rest. Very exclusive.',
    Cigarette: 'A spare cigarette for the smoker on the bench outside. He will be thrilled.',
  }[item.text];
  return g.say(about || item.text);
}

// ---- HR pickup and onboarding training ----
// After check-in an HR colleague walks over from Pod 7, finds you wherever you are on the floor and leads
// you to S2 (the training room, south of the IT room), leaving a golden trail. Talking to them there starts the training; IT waits for it.
const S2_SPOT = [41, 51]; // in S2, next to its table
export const timing = { hrPickup: 7000 }; // ms of floor time before HR sets off; tests set it to 0
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export async function hrPickup(g) {
  for (let t = 0; t < timing.hrPickup / 100;) { await wait(100); if (g.mapName === 'office' && !g.dialog && !g.menu && !g.overlay) t++; }
  const hr = { id: 'hrGuide', x: 56, y: 9, look: 'hrGuide', dir: 'down', speed: 1.5 }; // a bit slower than you, easy to follow
  g.addNpc('office', hr);
  flags.hr = 'coming';
  // Running away from HR: once she is within 4 tiles, every step that takes you further away counts; after three
  // the stopwatch shows. Nobody else may stop you with a conversation while she is coming (noSpotters).
  const dist = () => Math.abs(hr.x - g.player.x) + Math.abs(hr.y - g.player.y);
  let last = dist(), fled = 0, chaseFrom = 0;
  g.noSpotters = true;
  await g.walkNpc(g.maps.office, hr, () => {
    const d = dist();
    if (d > last && (chaseFrom || last <= 4)) { fled++; chaseFrom ||= performance.now(); }
    last = d;
    if (fled >= 3 && !g.timer) g.timer = { label: 'HR chase', from: chaseFrom };
    return [g.player.x, g.player.y];
  }, { near: true });
  g.noSpotters = false; g.timer = null;
  const chase = ((performance.now() - chaseFrom) / 1000).toFixed(1);
  // Wait until the player is free: no dialog, not mid-step, not in a busy pause (pinball, fade) and on this floor.
  while (g.dialog || g.menu || g.overlay || g.entry || g.busy || g.player.ox || g.player.oy || g.mapName !== 'office') await wait(100);
  const toward = (a, b) => (b.x > a.x ? 'right' : b.x < a.x ? 'left' : b.y > a.y ? 'down' : 'up');
  hr.dir = toward(hr, g.player); g.player.dir = toward(g.player, hr);
  if (fled >= 3) {
    flags.hrChase = chase;
    await g.say([`HR: *panting* ${chase} seconds! Were you running away from me?`, 'HR: Twelve years in HR. Nobody escapes onboarding. Nobody.']);
  }
  await g.say([
    `HR: There you are, ${flags.name}! I am your HR buddy. Sorry it took a while, my previous meeting ran over.`,
    'HR: Before IT gives you a laptop, we do your onboarding training. Follow me to S2, the training room: south, past the IT room. Just follow the golden sparkles!',
  ]);
  flags.hr = 'leading';
  await g.walkNpc(g.maps.office, hr, S2_SPOT, { trail: true });
  hr.dir = 'left';
  flags.hr = 'waiting';
}

const QUIZ = [
  ['An email says "Your password expires today, click here". What do you do?', ['Report it as phishing', 'Click it, quickly', 'Forward it to the team'], 0,
    'Exactly. Report it with the button in Outlook. Security loves you already.', 'Hmm, no. That one is phishing: report it with the button in Outlook.'],
  ['Your desk chair is broken. Where do you report it?', ['In <company>, of course', 'Shout across the office', 'Fix it with tape'], 0,
    'Of course! We eat our own dog food. Facility gets it right away.', 'Close, but we have a tool for that. It is literally our product: <company>.'],
  ['You find a USB stick in the kitchen. What now?', ['Hand it to IT', 'Plug it in to see whose it is', 'Keep it, free storage'], 0,
    'Perfect. Never plug in unknown sticks. IT will deal with it.', 'Please never plug in unknown sticks! Hand it to IT instead.'],
];
async function training(g) {
  g.trail = []; // you made it: clear the rest of the golden trail
  await g.say([
    `HR: Welcome to your onboarding training, ${flags.name}! Take a seat. This will be quick, I promise.`,
    'HR: Our values: be curious, take ownership, share knowledge. And be nice to the coffee machine, it reports its own incidents.',
    'HR: Your manager will plan a first-week check-in. Your learning budget is in the HR portal. Wellbeing: the massage room exists, the waiting list too.',
    'HR: Now a mini quiz on security. Three questions, no pressure.',
  ]);
  let score = 0;
  for (const [q, options, right, yes, no] of QUIZ) {
    const i = await g.choose(options, 'HR: ' + q);
    if (i === right) score++;
    await g.say('HR: ' + (i === right ? yes : no));
  }
  flags.trained = true;
  give(g, 'floor+board', 'Training');
  await g.say(`HR: ${score} out of 3! ${score === 3 ? 'Flawless.' : 'Good enough, and now you know the rest.'} Your training is done.`);
  // The temporary QR badge from the guards is swapped for a real one.
  g.hud = g.hud.filter((h) => h.text !== 'QR badge');
  give(g, 'floor+badge', 'Badge');
  await g.say([
    'HR: And this is for you: your real <company> badge, photo and all. The temporary QR one comes back to me.',
    `You got your BADGE! It says ${flags.name}, and it opens both doors of the lift lobby on this floor.`,
    'HR: Now you are officially ready for a laptop. IT is south of reception, the storage room under the elevators.',
  ]);
}
Object.assign(TALK, {
  hrGuide: (g) => {
    if (flags.trained) return g.say('HR: Training done! IT is waiting for you: south of reception, the storage room under the elevators.');
    if (flags.hr !== 'waiting') return g.say('HR: This way! Follow me to S2, the training room. Follow the golden sparkles!');
    return training(g);
  },
});

// Sitting down: once provisioned, walking onto a free chair next to a screen or desk starts your first task.
export async function onStep(g) {
  if (g.scripted) return; // a scripted walk (spotter) moves the player, not the player's own step
  const lost = g.mapName === 'office' && flags.fm === 'active' && g.map.objects.find((o) => o.id === 'misplaced' && o.x === g.player.x && o.y === g.player.y && !flags.fmFixed.includes(o.task));
  if (lost) return TALK.misplaced(g, lost); // walking over it picks it up too
  const b = g.mapName === 'lobby' && g.map.objects.find((o) => o.id === 'liftB');
  if (b && flags.puzzle && g.player.x === b.x && g.player.y === b.y) return rideUp(g);
  if (!flags.provisioned || flags.working || g.mapName !== 'office') return;
  const { x, y } = g.player, rows = g.map.rows;
  if (rows[y][x] !== 'h') return;
  const dir = Object.keys(DIRS).find((d) => 'md'.includes(rows[y + DIRS[d][1]]?.[x + DIRS[d][0]] || '.'));
  if (!dir) return;
  g.player.dir = dir;
  flags.working = true;
  const laptop = { MacBook: 'MacBook', Linux: 'Linux laptop', Windows: 'Windows laptop' }[flags.laptop] || 'laptop';
  await g.say([
    `You sit down, plug the ${laptop} into the screen and open your IDE.`,
    'git clone ... mvn verify ... *fans spinning* ... BUILD SUCCESS.',
    'You fix a typo in a README and open your first merge request.',
    'Within a minute, somebody leaves a review comment: "nit: missing full stop". Welcome to the team.',
  ]);
  g.hooks.onKey('solved');
  const secs = Math.round((performance.now() - flags.start) / 1000);
  await new Promise((res) => {
    g.overlay = {
      key(k) { if (k === 'A' || k === 'B') { g.overlay = null; res(); } },
      draw(ctx, W, H) {
        g.box(W / 2 - 250, H / 2 - 150, 500, 300);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#0A7DA0'; ctx.font = '34px "Bree Serif", serif'; ctx.fillText('Day one: done!', W / 2, H / 2 - 95);
        ctx.fillStyle = '#3A3A3A'; ctx.font = '22px "Bree Serif", serif'; // the pixel font lacks accented capitals
        ctx.fillText(`Welcome to <company>, ${flags.name}!`, W / 2, H / 2 - 40);
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.fillText(`Laptop: ${flags.laptop}`, W / 2, H / 2);
        ctx.fillText(`Time: ${Math.floor(secs / 60)}m ${secs % 60}s`, W / 2, H / 2 + 28);
        if (flags.hrChase) ctx.fillText(`Ran from HR for ${flags.hrChase}s`, W / 2, H / 2 + 54);
        ctx.fillStyle = '#E65038'; ctx.fillText('Space: keep exploring   F5: start over', W / 2, H / 2 + 90);
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      },
    };
  });
}

export async function talk(entity, g) {
  const h = TALK[entity.id];
  if (!h) return;
  if (typeof h === 'function') return h(g, entity);
  return g.say(h);
}

// Memory game on a 3x3 floor keypad: press Space to start, watch the code (it always ends on 3), then repeat it.
export function simon(g) {
  return new Promise((res) => {
    const seq = [...Array(3)].map(() => 1 + Math.floor(Math.random() * 9)).concat(3);
    const STEP = 900, ON = 600;
    let mode = 'ready', t0 = 0, cur = 4, typed = [], flash = null, wrong = false;
    const show = () => { mode = 'show'; t0 = performance.now() + 400; typed = []; };
    g.overlay = {
      seq, // readable from the console, handy for testing
      key(k) {
        if (mode === 'ready') { if (k === 'A') { wrong = false; show(); } return; }
        if (mode !== 'input') return;
        if (k === 'left' && cur % 3) cur--; if (k === 'right' && cur % 3 < 2) cur++;
        if (k === 'up' && cur > 2) cur -= 3; if (k === 'down' && cur < 6) cur += 3;
        if (k !== 'A') return;
        flash = { n: cur + 1, until: performance.now() + 250 };
        g.hooks.onKey('blip');
        typed.push(cur + 1);
        if (cur + 1 !== seq[typed.length - 1]) { wrong = true; mode = 'ready'; return; }
        if (typed.length === seq.length) { g.hooks.onKey('solved'); g.overlay = null; res(); }
      },
      draw(ctx, W, H) {
        const now = performance.now();
        let lit = flash && now < flash.until ? flash.n : 0, step = -1;
        if (mode === 'show') {
          step = Math.floor((now - t0) / STEP);
          if (step >= 0 && step < seq.length && (now - t0) % STEP < ON) lit = seq[step];
          if (step >= seq.length) mode = 'input';
        }
        g.box(W / 2 - 230, H / 2 - 170, 460, 340);
        ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
        ctx.font = '13px "Press Start 2P", monospace';
        const [title, hint, col] = {
          ready: [wrong ? 'WRONG BUTTON!' : 'CALL PANEL', wrong ? 'Press Space to see the code again' : 'Press Space to show the code', wrong ? '#E65038' : '#054B64'],
          show: ['WATCH...', `Remember the order (${Math.min(step + 1, seq.length)}/${seq.length})`, '#054B64'],
          input: ['YOUR TURN', 'Arrows move the red frame, Space presses', '#48BF86'],
        }[mode];
        ctx.fillStyle = col; ctx.fillText(title, W / 2, H / 2 - 145);
        ctx.font = '10px "Press Start 2P", monospace'; ctx.fillStyle = '#3A3A3A'; ctx.fillText(hint, W / 2, H / 2 - 120);
        for (let n = 0; n < 9; n++) {
          const x = W / 2 - 70 + (n % 3) * 70, y = H / 2 - 65 + Math.floor(n / 3) * 62;
          ctx.fillStyle = lit === n + 1 ? '#FFD134' : '#C9CDD1'; ctx.fillRect(x - 26, y - 23, 52, 46);
          if (mode === 'input' && n === cur) { ctx.strokeStyle = '#E65038'; ctx.lineWidth = 4; ctx.strokeRect(x - 29, y - 26, 58, 52); }
          ctx.font = '13px "Press Start 2P", monospace'; ctx.fillStyle = '#054B64'; ctx.fillText(String(n + 1), x, y + 1);
        }
        // code slots: what you have entered so far
        ctx.font = '13px "Press Start 2P", monospace';
        seq.forEach((_, i) => {
          const x = W / 2 - 75 + i * 50, y = H / 2 + 140;
          ctx.fillStyle = '#E3F6FB'; ctx.fillRect(x - 18, y - 16, 36, 32);
          ctx.fillStyle = '#054B64'; ctx.fillText(mode === 'input' && typed[i] ? String(typed[i]) : '_', x, y + 1);
        });
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      },
    };
  });
}
