// Gobble Run's front door: the loop, the screens, and the screenshot mode.
// The game runs on a fixed 1/60 step so a run is the same every time it is
// played from the same seed; ?shot=start|play|kitchen|end stages a scene from
// the real rules and draws one frame for the screenshots.
import { STEP, VIEW } from './config.js';
import { World, EVENT_ESCAPED, EVENT_OVER } from './world.js';
import { drawWorld, SCREEN_ESCAPED, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') ?? 1) || 1;

const world = new World(seed);
const sounds = new SoundBank();
let screen = SCREEN_TITLE;
let best = 0;
try {
  best = Number(window.localStorage.getItem('gobble-run-best') ?? 0) || 0;
} catch {
  best = 0;
}

function saveBest() {
  if (world.score > best) {
    best = Math.floor(world.score);
    try {
      window.localStorage.setItem('gobble-run-best', String(best));
    } catch {
      // A browser that refuses storage still plays fine.
    }
  }
}

function startRun() {
  world.reset();
  screen = SCREEN_PLAY;
  sounds.unlock();
  sounds.gobble();
}

function endRun(escaped) {
  saveBest();
  screen = escaped ? SCREEN_ESCAPED : SCREEN_OVER;
  if (escaped) sounds.escaped();
  else sounds.caught();
}

const input = new Input(canvas, (action) => {
  if (action === 'jump') {
    sounds.unlock();
    if (screen === SCREEN_TITLE) startRun();
    else if (screen === SCREEN_OVER || screen === SCREEN_ESCAPED) startRun();
  }
  if (action === 'start' && screen === SCREEN_TITLE) startRun();
  if (action === 'restart') startRun();
  if (action === 'pause' && (screen === SCREEN_PLAY || screen === SCREEN_PAUSED)) {
    screen = screen === SCREEN_PLAY ? SCREEN_PAUSED : SCREEN_PLAY;
  }
  if (action === 'mute') {
    const muted = sounds.toggleMute();
    document.getElementById('mute-note').textContent = muted ? 'Sound off (M to turn on)' : 'Sound on (M to mute)';
  }
});

let last = performance.now();
let accumulator = 0;

function frame(now) {
  const elapsed = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (screen === SCREEN_PLAY) {
    accumulator += elapsed;
    while (accumulator >= STEP) {
      accumulator -= STEP;
      const jump = input.takeJump();
      const result = world.step(STEP, input.steer(), jump, input.slideHeld);
      if (jump && world.player.grounded === false) sounds.jump();
      if (result & EVENT_OVER) endRun(false);
      if (result & EVENT_ESCAPED) endRun(true);
    }
  }
  drawWorld(context, world, screen, best);
  window.requestAnimationFrame(frame);
}

if (shotName !== null) {
  // Screenshot mode: stage the scene from the real rules and draw one frame.
  // No loop, no input — the image is the same for the same seed. The page
  // chrome is hidden so the 1280x480 canvas fills the viewport exactly.
  document.querySelectorAll('h1, #controls, #mute-note, #story').forEach((el) => {
    el.style.display = 'none';
  });
  document.body.style.margin = '0';
  document.querySelector('main').style.padding = '0';
  canvas.style.border = 'none';
  const staged = stageShot(shotName, world);
  screen = staged.screen;
  best = staged.best;
  drawWorld(context, world, screen, best);
  document.title = `Gobble Run — ${shotName}`;
} else {
  window.requestAnimationFrame(frame);
}
