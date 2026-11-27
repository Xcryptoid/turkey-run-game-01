# Gobble Run — The Great Thanksgiving Escape

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![make.fun · turkey-run-game-01 · Xcryptoid/turkey-run-game-01 · rank](https://make.fun/badge/turkey-run-game-01/Xcryptoid/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![make.fun · turkey-run-game-01 · Xcryptoid/turkey-run-game-01 · reward](https://make.fun/badge/turkey-run-game-01/Xcryptoid/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Thanksgiving is coming and the farmer has his eye on you. **Gobble Run** is a
complete, original 2D turkey escape game that plays offline in a desktop
browser from static files: you are the turkey, running 1500 metres from the
farmyard gate to the safety of the forest while the farmer chases you with a
pitchfork.

## How it plays

- **Run** — the turkey runs on its own; steer left and right to dodge what
  falls from the sky.
- **Jump** (SPACE / ↑ / click) over fences, ovens and knives stuck in the
  ground. **Slide** (↓) under swinging danger — and slide into a haystack to
  hide while the farmer searches and loses the trail.
- **Dodge the carving knives** that drop from the sky and stick where they
  land. **Collect corn** (golden corn is worth 50) and watch the distance:
  1500 m is the forest and freedom.
- **Three zones** that grow harder: the farmyard, the orchard, the kitchen.
  The farmer closes in every time you stumble; three lives, and if he catches
  you, Thanksgiving dinner is served.
- Title screen, a HUD of score, distance, lives, corn and the farmer gap, and
  end screens for caught and escaped, with restart. Synthesised WebAudio
  sounds (gobble, jump, corn, caught, escaped) — M mutes.

## Play it

```sh
node serve.ts        # serves game/ on http://localhost:8080
```

Open http://localhost:8080 in desktop Chrome. No build step, no network.

## Layout

- `game/` — the playable game (`index.html`, `style.css`, `src/` split by job:
  `config.js`, `random.js`, `audio.js`, `world.js`, `render.js`, `input.js`,
  `shots.js`, `main.js`)
- `screenshots/` — 4 real renders of the game's own code (title, mid-run,
  kitchen zone, caught end screen)
- `main.ts` — copies `game/` and `screenshots/` to the output directory and
  writes `dossier.json` with the vendored make.fun library
- `vendor/makefun-game.ts` — the kit's copy, unchanged
- `shots.json` — the screenshot scenes (`?shot=start|play|kitchen|end`)

## License

MIT — see [LICENSE](LICENSE).
