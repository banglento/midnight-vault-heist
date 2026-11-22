// MIDNIGHT VAULT tuning: every size, speed and colour lives here so the rest
// of the game never hard-codes a number. The vault is a fixed 960x600 stage;
// the renderer letterboxes it into whatever window Chrome gives it.

export const STAGE = { width: 960, height: 600 };
export const STEP = 1 / 60;

export const THIEF = { radius: 13, walkSpeed: 168, sneakSpeed: 92 };
export const GUARD = { radius: 14, patrolSpeed: 70, coneRange: 152, coneHalfAngle: 0.46 };
export const CAMERA = { coneRange: 132, coneHalfAngle: 0.34, sweepSpeed: 0.55 };

export const ALARM = {
  max: 100,
  guardRate: 34,
  cameraRate: 22,
  decayRate: 9,
  laserRate: 55,
};

export const COLOURS = {
  floor: '#1b2436',
  floorAlt: '#202b42',
  wall: '#3d4c6e',
  wallEdge: '#6f87b8',
  cover: '#2e4a3a',
  coverEdge: '#57a773',
  thief: '#ffd23f',
  thiefCoat: '#2b2d42',
  guard: '#ef476f',
  guardDark: '#8f1d3f',
  camera: '#c77dff',
  loot: '#ffd60a',
  lootDark: '#9c7a00',
  exit: '#06d6a0',
  guardCone: 'rgba(239, 71, 111, 0.20)',
  guardConeHot: 'rgba(239, 71, 111, 0.42)',
  cameraCone: 'rgba(199, 125, 255, 0.18)',
  cameraConeHot: 'rgba(199, 125, 255, 0.40)',
  laser: '#ff3355',
  text: '#f4f6fb',
  muted: '#9fb0cc',
};
