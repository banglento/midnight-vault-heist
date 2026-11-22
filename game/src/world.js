// MIDNIGHT VAULT world: the vault floor plan, the thief, patrolling guards,
// sweeping cameras, laser tripwires, loot and the alarm. Pure simulation —
// this file never touches the DOM, so screenshots can stage it step by step.
import { ALARM, CAMERA, GUARD, STAGE, THIEF } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_CAUGHT = 'caught';

// Solid furniture the thief and guards slide around; also visual cover.
export const WALLS = [
  { x: 150, y: 96, w: 18, h: 210 },
  { x: 150, y: 380, w: 18, h: 124 },
  { x: 330, y: 60, w: 18, h: 150 },
  { x: 330, y: 300, w: 18, h: 204 },
  { x: 560, y: 96, w: 18, h: 190 },
  { x: 560, y: 372, w: 18, h: 132 },
  { x: 740, y: 60, w: 18, h: 170 },
  { x: 740, y: 330, w: 18, h: 174 },
  { x: 168, y: 210, w: 90, h: 16 },
  { x: 420, y: 372, w: 140, h: 16 },
  { x: 640, y: 210, w: 100, h: 16 },
];

// Low planters and desks: they block sight lines but not movement.
export const COVERS = [
  { x: 210, y: 250, w: 64, h: 40 },
  { x: 420, y: 140, w: 70, h: 44 },
  { x: 640, y: 420, w: 76, h: 44 },
  { x: 420, y: 470, w: 60, h: 36 },
];

const LOOT_SPOTS = [
  { x: 250, y: 130, label: 'Gem Case' },
  { x: 460, y: 250, label: 'Gold Stack' },
  { x: 660, y: 130, label: 'Painting' },
  { x: 250, y: 440, label: 'Coin Vault' },
  { x: 830, y: 460, label: 'Crown' },
];

const GUARD_ROUTES = [
  [{ x: 90, y: 140 }, { x: 290, y: 140 }, { x: 290, y: 320 }, { x: 90, y: 320 }],
  [{ x: 640, y: 90 }, { x: 880, y: 90 }, { x: 880, y: 300 }, { x: 640, y: 300 }],
  [{ x: 380, y: 500 }, { x: 700, y: 500 }, { x: 700, y: 330 }, { x: 380, y: 330 }],
];

const CAMERA_SPOTS = [
  { x: 480, y: 74, base: Math.PI / 2, range: 0.85 },
  { x: 40, y: 300, base: 0, range: 0.8 },
  { x: 920, y: 330, base: Math.PI, range: 0.8 },
];

export const EXIT = { x: 884, y: 520, w: 56, h: 56 };

function angleDelta(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function segmentBlocked(x1, y1, x2, y2) {
  // Sight is blocked by walls and cover blocks; sample the line finely.
  const steps = 24;
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    for (const wall of WALLS) {
      if (x >= wall.x && x <= wall.x + wall.w && y >= wall.y && y <= wall.y + wall.h) return true;
    }
    for (const cover of COVERS) {
      if (x >= cover.x && x <= cover.x + cover.w && y >= cover.y && y <= cover.y + cover.h) return true;
    }
  }
  return false;
}

function insideCone(source, angle, range, halfAngle, point) {
  const dx = point.x - source.x;
  const dy = point.y - source.y;
  const dist = Math.hypot(dx, dy);
  if (dist > range || dist < 1) return false;
  const facing = Math.atan2(dy, dx);
  if (Math.abs(angleDelta(facing, angle)) > halfAngle) return false;
  return !segmentBlocked(source.x, source.y, point.x, point.y);
}

function collides(x, y, radius) {
  if (x < radius + 8 || x > STAGE.width - radius - 8) return true;
  if (y < radius + 52 || y > STAGE.height - radius - 8) return true;
  for (const wall of WALLS) {
    const nx = Math.max(wall.x, Math.min(x, wall.x + wall.w));
    const ny = Math.max(wall.y, Math.min(y, wall.y + wall.h));
    if (Math.hypot(x - nx, y - ny) < radius) return true;
  }
  return false;
}

function moveActor(actor, dx, dy, radius) {
  if (!collides(actor.x + dx, actor.y, radius)) actor.x += dx;
  if (!collides(actor.x, actor.y + dy, radius)) actor.y += dy;
}

export function createWorld() {
  const state = {
    screen: SCREEN_TITLE,
    time: 0,
    elapsed: 0,
    alarm: 0,
    lootTaken: 0,
    lootTotal: LOOT_SPOTS.length,
    spottedBy: '',
    thief: { x: 70, y: 540, angle: -Math.PI / 4 },
    guards: [],
    cameras: [],
    loot: [],
    message: '',
  };

  function reset() {
    state.screen = SCREEN_PLAY;
    state.time = 0;
    state.elapsed = 0;
    state.alarm = 0;
    state.lootTaken = 0;
    state.spottedBy = '';
    state.message = '';
    state.thief = { x: 70, y: 540, angle: -Math.PI / 4 };
    state.guards = GUARD_ROUTES.map((route, i) => ({
      x: route[0].x, y: route[0].y, route, target: 1,
      angle: Math.atan2(route[1].y - route[0].y, route[1].x - route[0].x),
      pause: i * 0.4, seesThief: false,
    }));
    state.cameras = CAMERA_SPOTS.map((spot, i) => ({
      ...spot, angle: spot.base, phase: i * 1.7, seesThief: false,
    }));
    state.loot = LOOT_SPOTS.map((spot) => ({ ...spot, taken: false }));
  }

  function step(dt, move, sneaking) {
    state.time += dt;
    if (state.screen !== SCREEN_PLAY) return;
    state.elapsed += dt;

    // Thief movement (normalised so diagonals are not faster).
    const speed = sneaking ? THIEF.sneakSpeed : THIEF.walkSpeed;
    const len = Math.hypot(move.x, move.y) || 1;
    if (move.x !== 0 || move.y !== 0) {
      moveActor(state.thief, (move.x / len) * speed * dt, (move.y / len) * speed * dt, THIEF.radius);
      state.thief.angle = Math.atan2(move.y, move.x);
    }

    // Guards walk their rectangle routes, pausing briefly at corners.
    for (const guard of state.guards) {
      if (guard.pause > 0) { guard.pause -= dt; continue; }
      const goal = guard.route[guard.target];
      const dx = goal.x - guard.x;
      const dy = goal.y - guard.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 4) {
        guard.target = (guard.target + 1) % guard.route.length;
        guard.pause = 0.7;
      } else {
        guard.angle = Math.atan2(dy, dx);
        moveActor(guard, (dx / dist) * GUARD.patrolSpeed * dt, (dy / dist) * GUARD.patrolSpeed * dt, GUARD.radius);
      }
    }

    // Cameras sweep back and forth around their base direction.
    for (const camera of state.cameras) {
      camera.angle = camera.base + Math.sin(state.time * CAMERA.sweepSpeed + camera.phase) * camera.range;
    }

    // Detection: cones raise the alarm; sneaking shrinks guard range.
    let seen = '';
    let rate = 0;
    const guardRange = sneaking ? GUARD.coneRange * 0.62 : GUARD.coneRange;
    for (const guard of state.guards) {
      guard.seesThief = insideCone(guard, guard.angle, guardRange, GUARD.coneHalfAngle, state.thief);
      if (guard.seesThief) { seen = 'A guard has eyes on you!'; rate = Math.max(rate, ALARM.guardRate); }
      if (Math.hypot(guard.x - state.thief.x, guard.y - state.thief.y) < GUARD.radius + THIEF.radius + 2) {
        state.alarm = ALARM.max;
        state.screen = SCREEN_CAUGHT;
        state.message = 'Grabbed by a guard!';
      }
    }
    for (const camera of state.cameras) {
      camera.seesThief = insideCone(camera, camera.angle, CAMERA.coneRange, CAMERA.coneHalfAngle, state.thief);
      if (camera.seesThief) { seen = 'A camera is watching you!'; rate = Math.max(rate, ALARM.cameraRate); }
    }
    state.spottedBy = seen;
    if (rate > 0) state.alarm = Math.min(ALARM.max, state.alarm + rate * dt);
    else state.alarm = Math.max(0, state.alarm - ALARM.decayRate * dt);
    if (state.alarm >= ALARM.max && state.screen === SCREEN_PLAY) {
      state.screen = SCREEN_CAUGHT;
      state.message = 'The alarm hit full — the vault locked down!';
    }

    // Loot pickup.
    for (const item of state.loot) {
      if (!item.taken && Math.hypot(item.x - state.thief.x, item.y - state.thief.y) < 26) {
        item.taken = true;
        state.lootTaken += 1;
        state.message = `${item.label} secured! ${state.lootTaken}/${state.lootTotal}`;
      }
    }

    // Exit: needs at least 3 loot to count as a real heist.
    const inExit = state.thief.x > EXIT.x && state.thief.x < EXIT.x + EXIT.w
      && state.thief.y > EXIT.y && state.thief.y < EXIT.y + EXIT.h;
    if (inExit) {
      if (state.lootTaken >= 3) {
        state.screen = SCREEN_WIN;
      } else {
        state.message = `The exit crew wants at least 3 loot — you carry ${state.lootTaken}.`;
      }
    }
  }

  reset();
  state.screen = SCREEN_TITLE;
  return { state, reset, step };
}
