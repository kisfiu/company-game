# First Day at &lt;company&gt;

A tiny Pokémon-style browser game about your first day as a developer at a software company in
Budapest. Get your badge, ride the lift, survive HR's training quiz, pick a laptop and find the
DevEx team before lunch. About five minutes.

**Playtest edition.** Everything is made up: the company, the teams, the news.

## Play

Open the GitHub Pages site, or serve this folder with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/. Opening `index.html` straight from disk doesn't work, because
browsers block ES modules on `file://`.

| Key | Action |
|---|---|
| Arrows / WASD | move; two at once (e.g. up + left) go diagonally |
| Space / Enter | talk, confirm |
| X / Esc | next line |
| I | items |
| Tab | map |
| M | music on/off |

On a phone or tablet an on-screen pad appears: a joystick to walk in eight directions (drag and hold), **A** to talk and confirm (also your
name), **B** back, and ITEMS, MAP and MUSIC buttons. Portrait and landscape both work. Tap the name box
to bring up the keyboard.

## Feedback

Stuck somewhere, found a bug, or a joke that didn't land? Tell me where you were (press **G** for
tile coordinates) and what happened.

## Credits

All art and music are drawn and composed in code: no image or audio files. The fonts are
[Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P),
[Bree Serif](https://fonts.google.com/specimen/Bree+Serif) and
[Open Sans](https://fonts.google.com/specimen/Open+Sans), all under the SIL Open Font License (see
`fonts/`).
