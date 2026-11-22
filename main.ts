// MIDNIGHT VAULT — hand-in program (Node 22, standard library only).
//
// The game itself is the static site in game/ (open game/index.html in a
// browser, no build step, no network). This program is only the courier:
// it copies game/ and screenshots/ into the output directory and asks the
// vendored make.fun library to write dossier.json from exactly those files,
// so the dossier the judge reads is the one the scorer rebuilds and compares.
//
// Run it the way the grader does, or locally with an override:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });

mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// Caps mirror the scorer's gate: text_max_bytes shapes the dossier bytes,
// the rest make this program refuse anything the scorer would refuse anyway
// (over 4 screenshots, a screenshot over 256 KiB, over 993 game entries,
// over 48 MiB of game files, or a game path over 1000 bytes).
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`MIDNIGHT VAULT handed in: game/ + screenshots/ copied to ${outputDir}, dossier.json written (${dossier.length} bytes).`);
