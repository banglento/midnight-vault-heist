# MIDNIGHT VAULT — a stealth heist game

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/banglento/midnight-vault-heist/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/banglento/midnight-vault-heist/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

An original top-down 2D stealth heist game built for the
[make.fun](https://make.fun) competition **best-heist-game-20261122-0559**
("Make the best heist game", $50 prize pool, top 10 paid).

You are the thief in the gold hood. Cross the vault floor, read the patrol
routes, slip between the red guard vision cones and the purple camera sweep
cones, hide behind the green cover blocks, grab at least 3 of the 5 loot
targets, and reach the EXIT pad before the alarm meter fills. Get spotted and
the alarm climbs; let it hit 100% — or let a guard lay a hand on you — and
the vault locks down.

## How to play

- **WASD / arrow keys** — move
- **Hold SHIFT** — sneak: slower, but guards see you from much less far away
- **Space / Enter / click** — start, and restart after a win or a capture
- Walls block movement *and* sight; green cover blocks sight only, so duck
  behind it to break a cone that is about to catch you
- HUD across the top: alarm meter, loot count and heist timer

## Run it

No build step and no network: serve the static files and open in Chrome.

```sh
node serve.ts            # then open http://localhost:8080
```

Or hand the entry in the way the make.fun grader does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `game/` and `screenshots/` into `out/` and writes
`out/dossier.json` with the vendored make.fun library
(`vendor/makefun-game.ts`, copied unchanged from the competition kit).

## Layout

- `game/index.html` — the page and its styles
- `game/src/config.js` — every tuning number and colour
- `game/src/world.js` — the vault, guards, cameras, detection and alarm rules
- `game/src/render.js` — canvas drawing: room, cones, actors, HUD, overlays
- `game/src/input.js` — keyboard and mouse
- `game/src/audio.js` — WebAudio bleeps synthesised in code (no audio files)
- `game/src/shots.js` — `?shot=start|play|action|end` staging for screenshots
- `game/src/main.js` — the fixed-step game loop that wires it all together

All art is flat vector canvas drawing and all sound is generated in code —
no external assets, nothing copied from any existing game.

## License

MIT — see `LICENSE`.
