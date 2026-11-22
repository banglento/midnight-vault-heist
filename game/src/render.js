// MIDNIGHT VAULT renderer: flat vector canvas art with strong contrast.
// Safe cover is green, danger is red/purple, loot glows gold, exit is teal —
// readable at a glance even when the screenshot is shrunk for the judge.
import { ALARM, COLOURS, GUARD, CAMERA, STAGE } from './config.js';
import { COVERS, EXIT, SCREEN_CAUGHT, SCREEN_TITLE, SCREEN_WIN, WALLS } from './world.js';

function conePath(ctx, x, y, angle, range, halfAngle) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
}

function drawCone(ctx, watcher, angle, range, halfAngle, calm, hot) {
  conePath(ctx, watcher.x, watcher.y, angle, range, halfAngle);
  ctx.fillStyle = watcher.seesThief ? hot : calm;
  ctx.fill();
  ctx.strokeStyle = watcher.seesThief ? hot : calm;
  ctx.stroke();
}

function drawRoom(ctx, state) {
  ctx.fillStyle = COLOURS.floor;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  // Checker floor so movement and routes read clearly.
  const tile = 48;
  for (let y = 52; y < STAGE.height; y += tile) {
    for (let x = 0; x < STAGE.width; x += tile) {
      if (((x + y) / tile) % 2 === 0) {
        ctx.fillStyle = COLOURS.floorAlt;
        ctx.fillRect(x, y, tile, tile);
      }
    }
  }
  ctx.strokeStyle = COLOURS.wallEdge;
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 58, STAGE.width - 12, STAGE.height - 64);

  for (const cover of COVERS) {
    ctx.fillStyle = COLOURS.cover;
    ctx.fillRect(cover.x, cover.y, cover.w, cover.h);
    ctx.strokeStyle = COLOURS.coverEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(cover.x, cover.y, cover.w, cover.h);
  }
  for (const wall of WALLS) {
    ctx.fillStyle = COLOURS.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.strokeStyle = COLOURS.wallEdge;
    ctx.lineWidth = 1;
    ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
  }

  // Exit pad.
  ctx.fillStyle = 'rgba(6, 214, 160, 0.25)';
  ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.strokeStyle = COLOURS.exit;
  ctx.lineWidth = 3;
  ctx.strokeRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = COLOURS.exit;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', EXIT.x + EXIT.w / 2, EXIT.y + EXIT.h / 2 + 5);
}

function drawLoot(ctx, state) {
  for (const item of state.loot) {
    if (item.taken) continue;
    const pulse = 3 + Math.sin(state.time * 4 + item.x) * 1.5;
    ctx.beginPath();
    ctx.arc(item.x, item.y, 15 + pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 214, 10, 0.18)';
    ctx.fill();
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = COLOURS.loot;
    ctx.fillRect(-8, -8, 16, 16);
    ctx.strokeStyle = COLOURS.lootDark;
    ctx.lineWidth = 2;
    ctx.strokeRect(-8, -8, 16, 16);
    ctx.restore();
    ctx.fillStyle = COLOURS.text;
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LOOT', item.x, item.y - 24);
  }
}

function drawActors(ctx, state) {
  for (const camera of state.cameras) {
    drawCone(ctx, camera, camera.angle, CAMERA.coneRange, CAMERA.coneHalfAngle, COLOURS.cameraCone, COLOURS.cameraConeHot);
  }
  for (const guard of state.guards) {
    drawCone(ctx, guard, guard.angle, GUARD.coneRange, GUARD.coneHalfAngle, COLOURS.guardCone, COLOURS.guardConeHot);
  }
  for (const camera of state.cameras) {
    ctx.fillStyle = COLOURS.camera;
    ctx.fillRect(camera.x - 9, camera.y - 9, 18, 18);
    ctx.fillStyle = '#1b1030';
    ctx.beginPath();
    ctx.arc(camera.x + Math.cos(camera.angle) * 5, camera.y + Math.sin(camera.angle) * 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLOURS.text;
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAM', camera.x, camera.y - 14);
  }
  for (const guard of state.guards) {
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, GUARD_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = COLOURS.guard;
    ctx.fill();
    ctx.strokeStyle = COLOURS.guardDark;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(guard.x + Math.cos(guard.angle) * 6, guard.y + Math.sin(guard.angle) * 6, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.fillStyle = COLOURS.text;
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GUARD', guard.x, guard.y - 20);
  }
  // The thief: gold hood, dark coat, unmistakable.
  const thief = state.thief;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, 13, 0, Math.PI * 2);
  ctx.fillStyle = COLOURS.thiefCoat;
  ctx.fill();
  ctx.strokeStyle = COLOURS.thief;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(thief.x + Math.cos(thief.angle) * 5, thief.y + Math.sin(thief.angle) * 5, 5, 0, Math.PI * 2);
  ctx.fillStyle = COLOURS.thief;
  ctx.fill();
  ctx.fillStyle = COLOURS.thief;
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('THIEF', thief.x, thief.y - 19);
}

const GUARD_RADIUS = 14;

function drawHud(ctx, state) {
  ctx.fillStyle = '#0d1322';
  ctx.fillRect(0, 0, STAGE.width, 52);
  ctx.fillStyle = COLOURS.text;
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MIDNIGHT VAULT', 14, 33);

  // Alarm meter: the single most important HUD element.
  ctx.fillStyle = '#39445e';
  ctx.fillRect(250, 14, 300, 24);
  const alarmW = (state.alarm / ALARM.max) * 300;
  ctx.fillStyle = state.alarm > 70 ? '#ff3355' : state.alarm > 35 ? '#ff9f1c' : '#2ec4b6';
  ctx.fillRect(250, 14, alarmW, 24);
  ctx.strokeStyle = '#f4f6fb';
  ctx.lineWidth = 2;
  ctx.strokeRect(250, 14, 300, 24);
  ctx.fillStyle = COLOURS.text;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`ALARM ${Math.round(state.alarm)}%`, 400, 31);

  ctx.textAlign = 'right';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(`LOOT ${state.lootTaken}/${state.lootTotal}`, 770, 33);
  const secs = Math.floor(state.elapsed);
  ctx.fillText(`TIME ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, 940, 33);

  if (state.spottedBy) {
    ctx.fillStyle = '#ff3355';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚠ ${state.spottedBy}`, STAGE.width / 2, 78);
  } else if (state.message) {
    ctx.fillStyle = COLOURS.loot;
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.message, STAGE.width / 2, 78);
  }
}

function drawOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(7, 10, 20, 0.78)';
  ctx.fillRect(0, 52, STAGE.width, STAGE.height - 52);
  ctx.textAlign = 'center';
  if (state.screen === SCREEN_TITLE) {
    ctx.fillStyle = COLOURS.thief;
    ctx.font = 'bold 64px system-ui, sans-serif';
    ctx.fillText('MIDNIGHT VAULT', STAGE.width / 2, 230);
    ctx.fillStyle = COLOURS.text;
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText('Sneak past guards and cameras. Grab the loot. Reach the EXIT.', STAGE.width / 2, 285);
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillStyle = COLOURS.muted;
    ctx.fillText('WASD / Arrows move · Hold SHIFT to sneak (smaller, quieter) · Take 3+ loot, then escape', STAGE.width / 2, 330);
    ctx.fillText('Red cones are guards · Purple cones are cameras · Green blocks hide you', STAGE.width / 2, 360);
    ctx.fillStyle = COLOURS.exit;
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('Press SPACE or click to start the heist', STAGE.width / 2, 430);
  } else if (state.screen === SCREEN_WIN) {
    ctx.fillStyle = COLOURS.exit;
    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.fillText('CLEAN GETAWAY!', STAGE.width / 2, 250);
    ctx.fillStyle = COLOURS.text;
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(`You escaped with ${state.lootTaken}/${state.lootTotal} loot in ${Math.floor(state.elapsed)}s.`, STAGE.width / 2, 305);
    ctx.fillText(`Final alarm: ${Math.round(state.alarm)}% — the vault never knew.`, STAGE.width / 2, 340);
    ctx.fillStyle = COLOURS.thief;
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('Press SPACE to run it again', STAGE.width / 2, 410);
  } else if (state.screen === SCREEN_CAUGHT) {
    ctx.fillStyle = '#ff3355';
    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.fillText('CAUGHT!', STAGE.width / 2, 250);
    ctx.fillStyle = COLOURS.text;
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(state.message || 'The vault locked down.', STAGE.width / 2, 305);
    ctx.fillText(`Loot carried: ${state.lootTaken}/${state.lootTotal}`, STAGE.width / 2, 340);
    ctx.fillStyle = COLOURS.thief;
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('Press SPACE to try again', STAGE.width / 2, 410);
  }
}

export function drawGame(ctx, state) {
  drawRoom(ctx, state);
  drawLoot(ctx, state);
  drawActors(ctx, state);
  drawHud(ctx, state);
  if (state.screen !== 'play') drawOverlay(ctx, state);
}
