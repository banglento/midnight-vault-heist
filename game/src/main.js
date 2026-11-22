// MIDNIGHT VAULT entry point: wires input, world and renderer together,
// runs a fixed-step loop, and honours ?shot= staging for screenshots.
import { STAGE, STEP } from './config.js';
import { createInput } from './input.js';
import { createWorld, SCREEN_CAUGHT, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';
import { drawGame } from './render.js';
import { stageShot } from './shots.js';
import { soundCaught, soundClick, soundLoot, soundSpotted, soundWin } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
canvas.width = STAGE.width;
canvas.height = STAGE.height;

const world = createWorld();
const input = createInput(canvas);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot !== null) stageShot(shot, world);

let lastLoot = 0;
let lastScreen = world.state.screen;
let wasSpotted = false;

function announce() {
  const s = world.state;
  status.textContent = `Alarm ${Math.round(s.alarm)} percent. Loot ${s.lootTaken} of ${s.lootTotal}. ${s.spottedBy || s.message}`;
}

function frame() {
  const s = world.state;
  if (s.screen === SCREEN_TITLE || s.screen === SCREEN_WIN || s.screen === SCREEN_CAUGHT) {
    if (input.confirmPressed()) {
      soundClick();
      world.reset();
      input.consumeClick();
    }
  } else if (s.screen === SCREEN_PLAY) {
    world.step(STEP, input.axis(), input.sneaking());
  }
  if (s.lootTaken > lastLoot) soundLoot();
  if (s.spottedBy && !wasSpotted) soundSpotted();
  if (s.screen !== lastScreen && s.screen === SCREEN_WIN) soundWin();
  if (s.screen !== lastScreen && s.screen === SCREEN_CAUGHT) soundCaught();
  lastLoot = s.lootTaken;
  lastScreen = s.screen;
  wasSpotted = Boolean(s.spottedBy);
  drawGame(ctx, s);
  announce();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
