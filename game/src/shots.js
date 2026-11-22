// Screenshot staging behind ?shot=start|play|action|end. Each scene resets
// the real world and places actors by hand (or steps the real rules), so a
// screenshot is always a genuine frame of this game's own simulation.
import { SCREEN_CAUGHT, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';

// Park the thief mid-vault with a guard cone and a camera cone crossing the
// frame, loot in view: the one frame that proves this is a heist game.
function stagePlayScene(world, alarm) {
  world.reset();
  const s = world.state;
  // Inside the first guard's cone, mid-crossing: the alarm is honestly rising.
  s.thief.x = 400;
  s.thief.y = 305;
  s.thief.angle = 0.5;
  s.guards[0].x = 300; s.guards[0].y = 250; s.guards[0].angle = 0.5; s.guards[0].pause = 99;
  s.guards[1].x = 800; s.guards[1].y = 180; s.guards[1].angle = 2.6; s.guards[1].pause = 99;
  s.guards[2].x = 620; s.guards[2].y = 470; s.guards[2].angle = -2.2; s.guards[2].pause = 99;
  s.cameras[0].angle = Math.PI / 2;
  s.alarm = alarm;
  s.elapsed = 47;
  // Recompute who actually sees the thief so cone colours are honest.
  for (let i = 0; i < 2; i += 1) world.step(1 / 60, { x: 0, y: 0 }, false);
  s.alarm = alarm;
  if (alarm > 0) s.spottedBy = 'A guard has eyes on you!';
  s.screen = SCREEN_PLAY;
}

export function stageShot(name, world) {
  const s = world.state;
  if (name === 'play') {
    stagePlayScene(world, 18);
    return SCREEN_PLAY;
  }
  if (name === 'action') {
    stagePlayScene(world, 64);
    s.loot[0].taken = true;
    s.loot[1].taken = true;
    s.lootTaken = 2;
    s.thief.x = 505;
    s.thief.y = 285;
    s.message = 'Gold Stack secured! 2/5';
    return SCREEN_PLAY;
  }
  if (name === 'end') {
    stagePlayScene(world, 24);
    s.screen = SCREEN_WIN;
    s.spottedBy = '';
    s.lootTaken = 4;
    s.elapsed = 96;
    return SCREEN_WIN;
  }
  if (name === 'caught') {
    stagePlayScene(world, 100);
    s.screen = SCREEN_CAUGHT;
    s.message = 'The alarm hit full — the vault locked down!';
    return SCREEN_CAUGHT;
  }
  world.reset();
  s.screen = SCREEN_TITLE;
  return SCREEN_TITLE;
}
