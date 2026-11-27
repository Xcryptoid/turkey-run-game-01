// The screenshot scenes behind ?shot=start|play|kitchen|end. Each one plays the
// real rules forward from a fresh world for a fixed number of steps, steered by
// a simple autopilot (jump the fence or oven ahead, step away from a knife
// falling on the turkey, slide into a haystack when the farmer is close), so
// the frame is what a short game really looks like and the same seed always
// gives the same frame.
import { EVENT_ESCAPED, EVENT_OVER, KIND_FENCE, KIND_HAYSTACK, KIND_OVEN } from './world.js';
import { GROUND_Y } from './config.js';
import { SCREEN_ESCAPED, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 4;
const PLAY_SECONDS = 22;
const KITCHEN_SECONDS = 62;
const END_LIMIT_SECONDS = 600;
const SAMPLE = 1 / 30;

/** The nearest solid obstacle ahead of the turkey, or null. */
function nextSolid(world) {
  let best = null;
  for (const item of [...world.obstacles, ...world.knives]) {
    if (!item.active) continue;
    if (item.kind !== KIND_FENCE && item.kind !== KIND_OVEN && item.kind !== 'knife') continue;
    if (item.kind === 'knife' && !item.stuck) continue;
    if (item.x + item.width < world.player.x) continue;
    if (best === null || item.x < best.x) best = item;
  }
  return best;
}

/** A knife still falling whose landing spot is on the turkey. The knife hangs
 * at its screen position while it falls, so its landing spot is its x. Only
 * steer when there is still time to step away. */
function fallingOnTurkey(world) {
  for (const knife of world.knives) {
    if (!knife.active || knife.stuck) continue;
    const fallDistance = (GROUND_Y - knife.height) - knife.y;
    if (fallDistance <= 0) continue;
    const fallTime = (Math.sqrt(knife.vy * knife.vy + 2 * 2400 * fallDistance) - knife.vy) / 2400;
    if (fallTime < 0.15) continue;
    const landingX = knife.x;
    const turkey = world.player;
    if (landingX + knife.width > turkey.x - 10 && landingX < turkey.x + 74) return { knife, landingX };
  }
  return null;
}

/** The nearest haystack the turkey could slide into, or null. */
function haystackAhead(world) {
  for (const item of world.obstacles) {
    if (!item.active || item.kind !== KIND_HAYSTACK) continue;
    const gap = item.x - world.player.x;
    if (gap > -40 && gap < 260) return item;
  }
  return null;
}

/** Steer, jump and slide like a careful player would. */
function autopilot(world) {
  const player = world.player;
  let move = 0;
  let jump = false;
  let slide = false;

  const threat = fallingOnTurkey(world);
  if (threat !== null) {
    // Step away from where the knife is going to land — in the air too, since
    // steering works while jumping.
    move = threat.landingX + 7 < player.x + 32 ? 1 : -1;
  }

  const solid = nextSolid(world);
  if (solid !== null && player.grounded) {
    const distance = solid.x - (player.x + 64);
    // Take off so the jump clears the obstacle's whole width: the turkey is
    // high enough from about 28 px of travel after takeoff until about 0.68 s
    // in, so the takeoff must be late enough to be high when it arrives and
    // early enough that its tail clears the far edge before it comes down.
    // A wide oven needs an earlier takeoff than a narrow fence.
    const latest = 0.68 * world.speed - solid.width - 52 - 8;
    if (distance < latest && distance > 27) jump = true;
  }

  // Slide into a haystack when the farmer is breathing down the turkey's neck.
  if (world.farmerGap < 55 && player.grounded) {
    const hay = haystackAhead(world);
    if (hay !== null) slide = true;
  }
  return { move, jump, slide };
}

/**
 * Set `world` to the named scene and return the screen to draw over it and the
 * best score to show. Any other name is the title scene.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'kitchen' && name !== 'end') {
    for (let index = 0; index < START_SECONDS / (1 / 60); index += 1) {
      world.step(1 / 60, 0, false, false);
    }
    // The title screen shows a fresh run: the staging steps are only so the
    // background has scrolled, so the lives and farmer gap are restored.
    world.lives = 3;
    world.farmerGap = 100;
    world.stumbleFlash = 0;
    return { screen: SCREEN_TITLE, best: 0 };
  }
  const limit = name === 'end' ? END_LIMIT_SECONDS : name === 'kitchen' ? KITCHEN_SECONDS : PLAY_SECONDS;
  let result = 0;
  for (let index = 0; index < limit / (1 / 60); index += 1) {
    const control = autopilot(world);
    result = world.step(1 / 60, control.move, control.jump, control.slide);
    if (result & EVENT_OVER || result & EVENT_ESCAPED) break;
  }
  if (name === 'end') {
    // The end shot wants the caught screen: start fresh and play carelessly —
    // no jumps, no steering — until the farmer catches the turkey. The step
    // cap keeps this bounded even if the run somehow survives.
    world.reset();
    result = 0;
    let steps = 0;
    while (!(result & EVENT_OVER) && steps < 600 * 60) {
      result = world.step(1 / 60, 0, false, false);
      steps += 1;
    }
    return { screen: SCREEN_OVER, best: Math.floor(world.score) };
  }
  if (result & EVENT_ESCAPED) return { screen: SCREEN_ESCAPED, best: Math.floor(world.score) };
  return { screen: SCREEN_PLAY, best: Math.floor(world.score) };
}
