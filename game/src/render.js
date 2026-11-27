// Everything the player sees, drawn with plain canvas shapes — the turkey, the
// farmer, the farmyard, the orchard and the kitchen, plus the HUD and the
// title and end screens. No image files: the art is the code.
import { GROUND_Y, TURKEY, VIEW } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';
export const SCREEN_ESCAPED = 'escaped';
export const SCREEN_PAUSED = 'paused';

const SKIES = [
  { top: '#8ec9e8', bottom: '#f6e3b4', hill: '#7fae5a', hillFar: '#a8c686' },
  { top: '#f2a65a', bottom: '#fbe3b0', hill: '#c97e2e', hillFar: '#e0a458' },
  { top: '#e8b48c', bottom: '#f7dcbb', hill: '#8a5a33', hillFar: '#b07a45' },
];

function skyGradient(ctx, zoneIndex) {
  const sky = SKIES[zoneIndex];
  const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  gradient.addColorStop(0, sky.top);
  gradient.addColorStop(1, sky.bottom);
  return gradient;
}

function drawCloud(ctx, x, y, scale) {
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.ellipse(x, y, 42 * scale, 18 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 30 * scale, y + 6 * scale, 30 * scale, 14 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 32 * scale, y + 7 * scale, 26 * scale, 12 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHills(ctx, zoneIndex, distance) {
  const sky = SKIES[zoneIndex];
  ctx.fillStyle = sky.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW.width; x += 40) {
    ctx.lineTo(x, GROUND_Y - 70 - Math.sin((x + distance * 0.4) / 260) * 26);
  }
  ctx.lineTo(VIEW.width, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = sky.hill;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW.width; x += 40) {
    ctx.lineTo(x, GROUND_Y - 34 - Math.sin((x + distance * 0.9) / 190 + 2) * 16);
  }
  ctx.lineTo(VIEW.width, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function drawGround(ctx, zoneIndex, distance) {
  const colours = ['#b98a4a', '#a5713a', '#7d4f2c'];
  ctx.fillStyle = colours[zoneIndex];
  ctx.fillRect(0, GROUND_Y, VIEW.width, VIEW.height - GROUND_Y);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  const offset = distance * 10 % 90;
  for (let x = -offset; x < VIEW.width; x += 90) {
    ctx.fillRect(x, GROUND_Y + 46, 46, 4);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(0, GROUND_Y, VIEW.width, 3);
}

function drawTree(ctx, x, y, scale) {
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(x - 5 * scale, y - 46 * scale, 10 * scale, 46 * scale);
  ctx.fillStyle = '#c96a1e';
  ctx.beginPath();
  ctx.arc(x, y - 62 * scale, 30 * scale, 0, Math.PI * 2);
  ctx.arc(x - 22 * scale, y - 46 * scale, 20 * scale, 0, Math.PI * 2);
  ctx.arc(x + 22 * scale, y - 46 * scale, 20 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8a33d';
  ctx.beginPath();
  ctx.arc(x - 10 * scale, y - 70 * scale, 8 * scale, 0, Math.PI * 2);
  ctx.arc(x + 14 * scale, y - 56 * scale, 7 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawHouse(ctx, x) {
  // The farmhouse the turkey is running away from, shrinking behind it.
  ctx.fillStyle = '#a34d2d';
  ctx.fillRect(x, GROUND_Y - 120, 150, 120);
  ctx.fillStyle = '#7d3a20';
  ctx.beginPath();
  ctx.moveTo(x - 12, GROUND_Y - 118);
  ctx.lineTo(x + 75, GROUND_Y - 172);
  ctx.lineTo(x + 162, GROUND_Y - 118);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(x + 22, GROUND_Y - 92, 26, 26);
  ctx.fillRect(x + 102, GROUND_Y - 92, 26, 26);
  ctx.fillStyle = '#5a2c14';
  ctx.fillRect(x + 62, GROUND_Y - 62, 28, 62);
}

function drawOven(ctx, item) {
  // The kitchen oven, door open and fire glowing: jump it, never touch it.
  const x = item.x;
  const width = item.width;
  ctx.fillStyle = '#3d3d3d';
  ctx.fillRect(x, GROUND_Y - 58, width, 58);
  ctx.fillStyle = '#ff7a1a';
  ctx.beginPath();
  ctx.moveTo(x + 8, GROUND_Y - 8);
  ctx.lineTo(x + width * 0.3, GROUND_Y - 44);
  ctx.lineTo(x + width * 0.5, GROUND_Y - 8);
  ctx.lineTo(x + width * 0.7, GROUND_Y - 44);
  ctx.lineTo(x + width - 8, GROUND_Y - 8);
  ctx.lineTo(x + width - 8, GROUND_Y - 44);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd23d';
  ctx.beginPath();
  ctx.arc(x + width / 2, GROUND_Y - 20, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.fillRect(x + 6, GROUND_Y - 58, width - 12, 8);
  ctx.fillStyle = '#e8e8e8';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOT!', x + width / 2, GROUND_Y - 64);
}

function drawFence(ctx, x, y, width, height) {
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = '#a5713a';
  ctx.fillRect(x - 6, y + 8, width + 12, 8);
  ctx.fillRect(x - 6, y + height - 20, width + 12, 8);
  ctx.fillStyle = '#6b4423';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width / 2, y - 10);
  ctx.lineTo(x + width, y);
  ctx.closePath();
  ctx.fill();
}

function drawKnife(ctx, knife) {
  const cx = knife.x + knife.width / 2;
  if (!knife.stuck) {
    // Still falling: a silver flash with a wooden handle.
    ctx.save();
    ctx.translate(cx, knife.y + knife.height / 2);
    ctx.rotate(0.35);
    ctx.fillStyle = '#c0c8d0';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(10, 8);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(-6, 8, 12, 14);
    ctx.restore();
    return;
  }
  // Stuck in the ground, blade up: jump it.
  ctx.fillStyle = '#c0c8d0';
  ctx.beginPath();
  ctx.moveTo(cx, knife.y);
  ctx.lineTo(cx + 7, knife.y + 30);
  ctx.lineTo(cx - 7, knife.y + 30);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(cx - 6, knife.y + 28, 12, 18);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(cx, GROUND_Y + 2, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHaystack(ctx, item) {
  ctx.fillStyle = '#e8c33d';
  ctx.beginPath();
  ctx.arc(item.x + item.width / 2, item.y + item.height, item.width / 2, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c9a11e';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(item.x + item.width / 2 + i * 14, item.y + 12);
    ctx.lineTo(item.x + item.width / 2 + i * 18, item.y + item.height - 4);
    ctx.stroke();
  }
  ctx.fillStyle = '#7d3a20';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HIDE!', item.x + item.width / 2, item.y - 8);
}

function drawCorn(ctx, item, time) {
  const bob = Math.sin(time * 3 + item.bob) * 4;
  const y = item.y + bob;
  ctx.fillStyle = item.kind === 'golden' ? '#ffd23d' : '#f2b705';
  ctx.beginPath();
  ctx.ellipse(item.x + 13, y + 15, 11, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,70,0,0.5)';
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(item.x + 13 + i * 6, y + 4);
    ctx.lineTo(item.x + 13 + i * 6, y + 26);
    ctx.stroke();
  }
  ctx.fillStyle = '#3f7d2c';
  ctx.beginPath();
  ctx.moveTo(item.x + 13, y);
  ctx.lineTo(item.x + 24, y - 12);
  ctx.lineTo(item.x + 16, y + 2);
  ctx.closePath();
  ctx.fill();
}

function drawMud(ctx, item) {
  ctx.fillStyle = '#5a3a1e';
  ctx.beginPath();
  ctx.ellipse(item.x + item.width / 2, GROUND_Y + 2, item.width / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(item.x + item.width / 2 - 20, GROUND_Y, 18, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTurkey(ctx, player, time, sliding) {
  const x = player.x;
  const y = player.y;
  const bob = player.grounded && !sliding ? Math.sin(time * 14) * 3 : 0;
  const blink = player.invincibleLeft > 0 && Math.floor(time * 12) % 2 === 0;
  ctx.save();
  if (blink) ctx.globalAlpha = 0.35;
  ctx.translate(x, y + bob);
  if (sliding) ctx.scale(1.25, 0.6);

  // Tail fan.
  ctx.fillStyle = '#8a5a2b';
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.rotate(i * 0.32);
    ctx.beginPath();
    ctx.ellipse(-22, -26, 7, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Body.
  ctx.fillStyle = '#a5713a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing, flapping while it runs.
  const flap = player.grounded ? Math.sin(time * 14) * 0.5 : -0.9;
  ctx.fillStyle = '#7d4f2c';
  ctx.save();
  ctx.translate(-4, -4);
  ctx.rotate(flap);
  ctx.beginPath();
  ctx.ellipse(-8, 0, 16, 9, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Neck and head.
  ctx.fillStyle = '#a5713a';
  ctx.fillRect(18, -34, 12, 22);
  ctx.fillStyle = '#e8b48c';
  ctx.beginPath();
  ctx.arc(26, -38, 11, 0, Math.PI * 2);
  ctx.fill();
  // Beak and wattle.
  ctx.fillStyle = '#f2a900';
  ctx.beginPath();
  ctx.moveTo(34, -40);
  ctx.lineTo(46, -36);
  ctx.lineTo(34, -32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d9381e';
  ctx.beginPath();
  ctx.ellipse(30, -28, 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eye.
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(29, -41, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Legs, running.
  const legSwing = player.grounded ? Math.sin(time * 14) * 10 : 6;
  ctx.strokeStyle = '#f2a900';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-8, 20);
  ctx.lineTo(-8 + legSwing, 34);
  ctx.moveTo(8, 20);
  ctx.lineTo(8 - legSwing, 34);
  ctx.stroke();
  ctx.restore();
}

function drawFarmer(ctx, player, farmerGap, time) {
  // The farmer gains on the turkey as the gap shrinks; he is always in frame,
  // far behind at a full gap and right on the turkey's tail at zero.
  const behind = 90 + farmerGap * 1.2;
  const x = player.x - behind;
  const run = Math.sin(time * 16) * 4;
  ctx.save();
  ctx.translate(x, GROUND_Y - TURKEY.height + run * 0.2);
  // Legs.
  ctx.strokeStyle = '#3a3a6b';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-6, -34);
  ctx.lineTo(-6 + run, 0);
  ctx.moveTo(6, -34);
  ctx.lineTo(6 - run, 0);
  ctx.stroke();
  // Overalls.
  ctx.fillStyle = '#3a5a8c';
  ctx.fillRect(-14, -78, 28, 46);
  // Shirt.
  ctx.fillStyle = '#c94f2e';
  ctx.fillRect(-16, -78, 32, 14);
  // Head and hat.
  ctx.fillStyle = '#e8b48c';
  ctx.beginPath();
  ctx.arc(0, -88, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2d38c';
  ctx.fillRect(-16, -100, 32, 6);
  ctx.fillRect(-10, -116, 20, 16);
  // Pitchfork, raised and ready.
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(14, -80);
  ctx.lineTo(30, -140);
  ctx.stroke();
  ctx.strokeStyle = '#c0c8d0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, -140);
  ctx.lineTo(24, -156);
  ctx.moveTo(30, -140);
  ctx.lineTo(30, -158);
  ctx.moveTo(30, -140);
  ctx.lineTo(36, -156);
  ctx.stroke();
  // Shout, dark-outlined so it reads against any sky.
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  const shoutX = Math.max(8, x + 24);
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 3;
  ctx.strokeText('COME BACK HERE!', shoutX, -120);
  ctx.fillStyle = '#fff';
  ctx.fillText('COME BACK HERE!', shoutX, -120);
  ctx.restore();
}

function drawHud(ctx, world) {
  ctx.fillStyle = 'rgba(20,16,8,0.55)';
  ctx.fillRect(0, 0, VIEW.width, 52);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${Math.floor(world.score)}`, 16, 33);
  ctx.fillText(`${Math.floor(world.distance)} m`, 220, 33);
  ctx.fillText(world.zoneName(), 380, 33);
  // Lives as hearts.
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < world.lives ? '#e63946' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(560 + i * 30, 26, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  // Farmer gap: how close the farmer is.
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('FARMER', 700, 22);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(790, 12, 200, 14);
  ctx.fillStyle = world.farmerGap < 30 ? '#e63946' : '#7bc96f';
  ctx.fillRect(790, 12, 200 * (world.farmerGap / 100), 14);
  ctx.fillStyle = '#fff';
  ctx.font = '13px sans-serif';
  ctx.fillText('ESCAPE 1500 m', 1010, 24);
  ctx.fillText(`CORN ${world.cornEaten}`, 1010, 42);
}

function panel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(20,14,6,0.72)';
  ctx.fillRect(290, 84, 700, 312);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(290, 84, 700, 312);
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 640, 150);
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  lines.forEach((line, index) => {
    ctx.fillText(line, 640, 192 + index * 28);
  });
}

export function drawWorld(ctx, world, screen, best) {
  const zoneIndex = world.zoneIndex;
  ctx.fillStyle = skyGradient(ctx, zoneIndex);
  ctx.fillRect(0, 0, VIEW.width, GROUND_Y);
  // Sun.
  ctx.fillStyle = '#ffd23d';
  ctx.beginPath();
  ctx.arc(1120, 70, 34, 0, Math.PI * 2);
  ctx.fill();
  drawCloud(ctx, 220 - (world.distance * 2 % 1400), 70, 1);
  drawCloud(ctx, 700 - (world.distance * 3 % 1400), 110, 0.8);
  drawCloud(ctx, 1050 - (world.distance * 1.5 % 1400), 50, 1.1);
  drawHills(ctx, zoneIndex, world.distance);
  drawHouse(ctx, 40 - world.distance * 10 % 1600);
  drawTree(ctx, 560 - (world.distance * 12 % 1500), GROUND_Y, 1);
  drawTree(ctx, 980 - (world.distance * 12 % 1500), GROUND_Y, 0.8);
  drawGround(ctx, zoneIndex, world.distance);

  // World items, far to near.
  for (const item of world.obstacles) {
    if (item.kind === 'fence') drawFence(ctx, item.x, item.y, item.width, item.height);
    if (item.kind === 'oven') drawOven(ctx, item);
    if (item.kind === 'haystack') drawHaystack(ctx, item);
    if (item.kind === 'mud') drawMud(ctx, item);
  }
  for (const knife of world.knives) drawKnife(ctx, knife);
  for (const item of world.pickups) drawCorn(ctx, item, world.time);

  // Hiding: the turkey ducks behind the haystack and the farmer searches.
  if (!world.player.hiding) {
    drawTurkey(ctx, world.player, world.time, world.player.sliding);
  } else {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDING…', world.player.x + 30, GROUND_Y - 120);
  }
  drawFarmer(ctx, world.player, world.farmerGap, world.time);

  if (world.stumbleFlash > 0) {
    ctx.fillStyle = `rgba(230,57,70,${0.25 * world.stumbleFlash})`;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }

  drawHud(ctx, world);

  if (screen === SCREEN_TITLE) {
    panel(ctx, 'GOBBLE RUN', [
      'The Great Thanksgiving Escape',
      '',
      'You are the turkey. The farmer wants dinner.',
      'Run 1500 m to the forest — jump fences and ovens,',
      'dodge the falling carving knives, hide in haystacks.',
      '',
      'SPACE jump · ← → steer · ↓ slide & hide · M mute',
      'Press SPACE or click to run!',
    ], '#f2a900');
  }
  if (screen === SCREEN_OVER) {
    panel(ctx, 'CAUGHT!', [
      `The farmer got you after ${Math.floor(world.distance)} m.`,
      `Score ${Math.floor(world.score)}  •  Corn ${world.cornEaten}  •  Best ${best}`,
      '',
      'Thanksgiving dinner is served… unless you run again.',
      '',
      'Press R or SPACE to try again',
    ], '#e63946');
  }
  if (screen === SCREEN_ESCAPED) {
    panel(ctx, 'ESCAPED!', [
      `You made it to the forest — ${Math.floor(world.distance)} m!`,
      `Score ${Math.floor(world.score)}  •  Corn ${world.cornEaten}  •  Best ${best}`,
      '',
      'No Thanksgiving dinner tonight. The turkey lives!',
      '',
      'Press R or SPACE to run again',
    ], '#7bc96f');
  }
  if (screen === SCREEN_PAUSED) {
    panel(ctx, 'PAUSED', ['', 'The turkey is catching its breath.', '', 'Press P to keep running'], '#8ec9e8');
  }
}
