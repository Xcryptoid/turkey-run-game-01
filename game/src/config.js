// Gobble Run — the numbers that tune the escape. One file, every knob in one
// place, so the run can be re-balanced without hunting through the world code.
export const VIEW = { width: 1280, height: 480 };
export const GROUND_Y = 400;
export const STEP = 1 / 60;

// The turkey's lane: it runs in a band of the screen and the player steers it
// left and right inside that band to dodge what falls from the sky.
export const TURKEY = {
  xMin: 220,
  xMax: 460,
  startX: 300,
  width: 64,
  height: 58,
  runSpeed: 260,
  jumpSpeed: 700,
  gravity: 1800,
  slideTime: 0.55,
};

// How far the farmer starts behind the turkey (0..100) and how the gap moves.
// A stumble costs a life and lets the farmer close in; clean running pulls away.
export const FARMER = {
  startGap: 100,
  stumbleCost: 26,
  mudCost: 8,
  hideBonus: 18,
  cleanGainPerSecond: 0.6,
  catchGap: 0,
};

// The run is 1500 metres from the farmyard gate to the safety of the forest.
// Three zones, each faster and busier than the last.
export const RUN = {
  escapeDistance: 1500,
  baseSpeed: 300,
  maxSpeed: 560,
  lives: 3,
  zones: [
    { name: 'THE FARMYARD', until: 500, speed: 300, spawnGap: [230, 380] },
    { name: 'THE ORCHARD', until: 1000, speed: 400, spawnGap: [200, 330] },
    { name: 'THE KITCHEN', until: 1500, speed: 500, spawnGap: [175, 300] },
  ],
};

export const SCORE = { corn: 10, goldenCorn: 50, metre: 1 };
export const OBSTACLE = { fenceWidth: 26, ovenWidth: 72, knifeWidth: 14 };
