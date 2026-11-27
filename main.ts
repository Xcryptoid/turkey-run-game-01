// Gobble Run's hand-in program (Node 22, standard library only). The game is
// this repository's game/ folder — plain static files a desktop browser loads
// offline — and the screenshots are the renders in screenshots/. This program
// copies both into the output directory and writes dossier.json with the
// vendored make.fun library, which is the summary the judge reads. It runs
// twice in the grader and both runs must write the same bytes, so it does
// nothing but copy files and write the dossier.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

// How the game is tuned to be fair: the turkey's jump rises high enough to
// clear a fence and a hot oven, and the falling knives are aimed well ahead
// of the bird and stick low, so every obstacle can be jumped once the player
// sees it. The farmer only catches the turkey after three stumbles, and
// hiding in a haystack buys the gap back — a careful player reaches the
// forest at 1500 m, a careless one is dinner.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The same caps the sealed scorer checks: at most 4 screenshots, each at most
// 256 KiB; game/ at most 993 files and 48 MiB, no path over 1000 bytes; the
// dossier text at most 160 KiB. An entry over any of them is refused, so the
// program refuses first, with the same numbers.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
