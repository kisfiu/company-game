// Questions for the quiz colleague (the spotter in the east corridor). TECH: evergreen. NEWS: fictional
// office news for the public playtest edition. Write `a` as the right answer; options are shuffled when asked.

export const NEWS_CHECKED = '2026-10-23'; // date of the newest news item below

export const TECH = [
  { q: 'The build is red. What do you do first?', a: 'Read the log', wrong: ['Blame the intern', 'Restart the coffee machine'], explain: 'Read the log. The answer is in the first line of the stack trace. Or line 400.' },
  { q: 'What runs a whole copy of the product on your own laptop here?', a: 'A local dev cluster', wrong: ['Excel', 'The pinball machine'], explain: 'A local dev cluster. One command, the whole product. Magic.' },
  { q: 'What is a code review for?', a: 'Sharing knowledge and catching bugs', wrong: ['Collecting thumbs-up emojis', 'Delaying Friday deploys'], explain: 'Both! The emojis are a nice bonus.' },
  { q: 'What does LLM stand for?', a: 'Large Language Model', wrong: ['Low Latency Mode', 'Long Lunch Meeting'], explain: 'Large Language Model. Although Long Lunch Meeting is also popular here.' },
  { q: 'A test that passes and fails without any code change is...', a: 'Flaky', wrong: ['Crispy', 'Agile'], explain: 'Flaky. We hunt them like Pokémon.' },
  { q: 'What does <company> make?', a: 'Software', wrong: ['Standing desks', 'Pizza ovens'], explain: 'Software. The desks are just a bonus.' },
];

// date = when the (made-up) news item appeared, source = its headline on the intranet.
export const NEWS = [
  { date: '2026-10-20', source: 'New coffee machines in every kitchen',
    q: 'What is new in every office kitchen this month?', a: 'Bean-to-cup coffee machines', wrong: ['A slushie machine', 'A hammock corner'],
    explain: 'Bean-to-cup machines. The queue is now 30 percent shorter and 100 percent more opinionated.' },
  { date: '2026-10-09', source: 'And the hackathon winners are...',
    q: 'What did this year\'s hackathon winners build?', a: 'A bot that books meeting rooms', wrong: ['A faster pinball machine', 'A robot that waters the plants'],
    explain: 'A meeting-room bot. M2 is still booked all day, though.' },
  { date: '2026-09-22', source: 'Bike to work month: the results',
    q: 'What did bike-to-work month reward?', a: 'The most kilometres per team', wrong: ['The loudest bell', 'The muddiest jacket'],
    explain: 'Kilometres per team. The winners cycled to the moon and halfway back, on paper.' },
  { date: '2026-09-05', source: 'Save the date: the customer event is coming',
    q: 'Where is the customer event this year?', a: 'In an old factory hall', wrong: ['On a boat', 'In the server room'],
    explain: 'An old factory hall. Great acoustics, questionable heating.' },
];

// A question with its options shuffled; `right` is the index of the correct one.
export function ask(item, rnd = Math.random) {
  const options = [item.a, ...item.wrong].map((o) => [rnd(), o]).sort((x, y) => x[0] - y[0]).map(([, o]) => o);
  return { q: item.q, options, right: options.indexOf(item.a), explain: item.explain };
}
