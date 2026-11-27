// The run itself: the turkey, the farmer behind it, and everything the farm
// throws in the way. The world scrolls left while the turkey holds its lane;
// distance is the score, and 1500 metres is the forest and freedom.
import { FARMER, GROUND_Y, OBSTACLE, RUN, SCORE, STEP, TURKEY } from './config.js';
import { makeRandom, pick, range } from './random.js';

export const EVENT_NONE = 0;
export const EVENT_OVER = 1;
export const EVENT_ESCAPED = 2;

export const KIND_FENCE = 'fence';
export const KIND_OVEN = 'oven';
export const KIND_KNIFE = 'knife';
export const KIND_MUD = 'mud';
export const KIND_HAYSTACK = 'haystack';
export const KIND_CORN = 'corn';
export const KIND_GOLDEN = 'golden';

function freshPlayer() {
  return {
    x: TURKEY.startX,
    y: GROUND_Y - TURKEY.height,
    vy: 0,
    grounded: true,
    sliding: false,
    slideLeft: 0,
    hiding: false,
    hideLeft: 0,
    invincibleLeft: 0,
  };
}

export class World {
  constructor(seed = 1) {
    this.seed = seed;
    this.reset();
  }

  reset() {
    this.random = makeRandom(this.seed);
    this.player = freshPlayer();
    this.distance = 0;
    this.score = 0;
    this.lives = RUN.lives;
    this.farmerGap = FARMER.startGap;
    this.speed = RUN.baseSpeed;
    this.obstacles = [];
    this.pickups = [];
    this.knives = [];
    this.nextSpawnAt = 260;
    this.spawnCursor = 0;
    this.over = false;
    this.escaped = false;
    this.time = 0;
    this.stumbleFlash = 0;
    this.hideFlash = 0;
    this.zoneIndex = 0;
    this.cornEaten = 0;
    this.stumbles = 0;
  }

  zone() {
    return RUN.zones[this.zoneIndex];
  }

  zoneName() {
    return this.zone().name;
  }

  /** The turkey's hitbox, shorter while it slides under a swinging knife. */
  playerBox() {
    const height = this.player.sliding ? TURKEY.height * 0.55 : TURKEY.height;
    return {
      x: this.player.x + 6,
      y: this.player.y + (TURKEY.height - height),
      width: TURKEY.width - 12,
      height,
    };
  }

  static overlaps(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  spawnPattern() {
    const roll = this.random();
    const zone = this.zone();
    // Everything spawns just off the right edge and scrolls in with the world.
    const at = 1400;
    // The pattern's own width: the next pattern waits until this one has
    // scrolled clear, so two groups never land unjumpably close together.
    let width = 0;
    if (roll < 0.16) {
      // A haystack to duck behind: hide, and the farmer loses the trail.
      this.obstacles.push({ kind: KIND_HAYSTACK, x: at, y: GROUND_Y - 92, width: 84, height: 92, active: true });
      width = 84;
    } else if (roll < 0.34) {
      this.obstacles.push({ kind: KIND_FENCE, x: at, y: GROUND_Y - 56, width: OBSTACLE.fenceWidth, height: 56, active: true });
      this.dropCorn(at + 90, 1);
      width = OBSTACLE.fenceWidth;
    } else if (roll < 0.52) {
      // The oven: wide and hot, jump it clean or lose a life.
      this.obstacles.push({ kind: KIND_OVEN, x: at, y: GROUND_Y - 58, width: OBSTACLE.ovenWidth, height: 58, active: true });
      this.dropCorn(at + 130, 2);
      width = OBSTACLE.ovenWidth;
    } else if (roll < 0.68) {
      // A carving knife drops from the sky and sticks where it lands. It is
      // aimed well ahead of the turkey — never on top of it — so the player
      // sees it stick and jumps it like any other obstacle.
      const targetX = this.player.x + range(this.random, 200, 420);
      this.knives.push({
        kind: KIND_KNIFE,
        x: targetX,
        y: -90,
        vy: 0,
        width: OBSTACLE.knifeWidth,
        height: 48,
        stuck: false,
        active: true,
      });
    } else if (roll < 0.8) {
      this.obstacles.push({ kind: KIND_MUD, x: at, y: GROUND_Y - 10, width: 130, height: 10, active: true });
      this.dropCorn(at + 160, 1);
      width = 130;
    } else {
      // A fence pair with a corn trail over the top — jump and snack. The pair
      // is spaced so the turkey can land and jump again between the fences.
      this.obstacles.push({ kind: KIND_FENCE, x: at, y: GROUND_Y - 56, width: OBSTACLE.fenceWidth, height: 56, active: true });
      this.obstacles.push({ kind: KIND_FENCE, x: at + 280, y: GROUND_Y - 56, width: OBSTACLE.fenceWidth, height: 56, active: true });
      this.dropCorn(at + 60, 3);
      width = 280 + OBSTACLE.fenceWidth;
    }
    // Clear ground between this pattern and the next, on top of its width.
    const clear = range(this.random, zone.spawnGap[0], zone.spawnGap[1]);
    this.nextSpawnAt = this.spawnCursor + width + clear;
  }

  dropCorn(afterX, count) {
    for (let index = 0; index < count; index += 1) {
      const golden = this.random() < 0.12;
      this.pickups.push({
        kind: golden ? KIND_GOLDEN : KIND_CORN,
        x: afterX + index * 46,
        y: GROUND_Y - (this.random() < 0.5 ? 56 : 120),
        width: 26,
        height: 30,
        active: true,
        bob: this.random() * Math.PI * 2,
      });
    }
  }

  /** One fixed step. `move` is -1/0/1, `jump` and `slide` are held buttons. */
  step(dt, move, jump, slide) {
    if (this.over || this.escaped) return EVENT_NONE;
    this.time += dt;
    const player = this.player;
    const zone = this.zone();

    // The turkey gains speed as it leaves the farmyard behind.
    this.speed = Math.min(RUN.maxSpeed, zone.speed + this.distance * 0.02);

    // Hiding: pressed against a haystack, the farmer searches and loses ground.
    if (player.hiding) {
      player.hideLeft -= dt;
      this.farmerGap = Math.min(100, this.farmerGap + FARMER.hideBonus * dt * 2);
      if (player.hideLeft <= 0) player.hiding = false;
      this.scroll(dt * 0.25);
      this.updateKnives(dt);
      return EVENT_NONE;
    }

    // Steering: left and right inside the lane.
    player.x = Math.max(TURKEY.xMin, Math.min(TURKEY.xMax, player.x + move * TURKEY.runSpeed * dt));

    // Jump and slide.
    if (jump && player.grounded) {
      player.vy = -TURKEY.jumpSpeed;
      player.grounded = false;
    }
    if (slide && player.grounded && !player.sliding) {
      player.sliding = true;
      player.slideLeft = TURKEY.slideTime;
    }
    if (player.sliding) {
      player.slideLeft -= dt;
      if (player.slideLeft <= 0) player.sliding = false;
    }

    // Gravity.
    player.vy += TURKEY.gravity * dt;
    player.y += player.vy * dt;
    if (player.y >= GROUND_Y - TURKEY.height) {
      player.y = GROUND_Y - TURKEY.height;
      player.vy = 0;
      player.grounded = true;
    }

    this.scroll(dt);
    this.updateKnives(dt);
    this.spawnAhead();

    // Clean running slowly pulls away from the farmer.
    this.farmerGap = Math.min(100, this.farmerGap + FARMER.cleanGainPerSecond * dt);
    if (this.stumbleFlash > 0) this.stumbleFlash -= dt;
    if (this.hideFlash > 0) this.hideFlash -= dt;
    if (player.invincibleLeft > 0) player.invincibleLeft -= dt;

    // Zone changes as the metres tick past.
    if (this.zoneIndex < RUN.zones.length - 1 && this.distance >= RUN.zones[this.zoneIndex].until) {
      this.zoneIndex += 1;
    }

    // The forest: 1500 metres, and the turkey is free.
    if (this.distance >= RUN.escapeDistance) {
      this.escaped = true;
      return EVENT_ESCAPED;
    }
    if (this.farmerGap <= FARMER.catchGap) {
      this.over = true;
      return EVENT_OVER;
    }
    if (this.lives <= 0) {
      this.over = true;
      return EVENT_OVER;
    }
    return EVENT_NONE;
  }

  scroll(dt) {
    const travelled = this.speed * dt;
    this.distance += travelled / 10;
    this.spawnCursor += travelled;
    this.score += travelled / 10 * SCORE.metre;
    for (const item of this.obstacles) item.x -= travelled;
    for (const item of this.pickups) item.x -= travelled;
    // A knife still falling hangs at its screen position; only once it sticks
    // in the ground does it scroll with the world like any other obstacle.
    for (const item of this.knives) if (item.stuck) item.x -= travelled;
    this.obstacles = this.obstacles.filter((item) => item.x > -200 && item.active);
    this.pickups = this.pickups.filter((item) => item.x > -100 && item.active);
    this.knives = this.knives.filter((item) => item.x > -100 && item.active);
    this.collide();
  }

  updateKnives(dt) {
    for (const knife of this.knives) {
      if (knife.stuck) continue;
      knife.vy += 2400 * dt;
      knife.y += knife.vy * dt;
      if (knife.y >= GROUND_Y - knife.height) {
        knife.y = GROUND_Y - knife.height;
        knife.stuck = true;
      }
    }
  }

  spawnAhead() {
    if (this.spawnCursor >= this.nextSpawnAt) this.spawnPattern();
  }

  collide() {
    const player = this.player;
    // Hidden in a haystack, nothing can touch the turkey.
    if (player.hiding) return;
    const box = this.playerBox();

    // Haystacks: slide into one to hide while the farmer searches.
    for (const item of this.obstacles) {
      if (!item.active || item.kind !== KIND_HAYSTACK) continue;
      if (World.overlaps(box, item) && player.sliding && player.grounded) {
        player.hiding = true;
        player.hideLeft = 1.1;
        this.hideFlash = 1.1;
        item.active = false;
        return;
      }
    }

    // Corn: free points, and the only reason to jump for joy.
    for (const item of this.pickups) {
      if (!item.active) continue;
      if (World.overlaps(box, item)) {
        item.active = false;
        this.cornEaten += 1;
        this.score += item.kind === KIND_GOLDEN ? SCORE.goldenCorn : SCORE.corn;
      }
    }

    if (player.invincibleLeft > 0) return;

    // Mud: it does not hurt, but it slows the turkey and the farmer gains.
    for (const item of this.obstacles) {
      if (!item.active || item.kind !== KIND_MUD) continue;
      if (World.overlaps(box, item)) {
        item.active = false;
        this.farmerGap = Math.max(0, this.farmerGap - FARMER.mudCost);
        this.stumbleFlash = 0.5;
      }
    }

    // Solid things: a fence, an oven, or a knife stuck in the ground.
    for (const item of [...this.obstacles, ...this.knives]) {
      if (!item.active) continue;
      if (item.kind === KIND_MUD || item.kind === KIND_HAYSTACK) continue;
      if (item.kind === KIND_KNIFE && !item.stuck) continue;
      if (World.overlaps(box, item)) {
        item.active = false;
        this.stumble();
        return;
      }
    }

    // A knife still falling can clip the turkey on the way down.
    for (const knife of this.knives) {
      if (!knife.active || knife.stuck) continue;
      if (World.overlaps(box, knife)) {
        knife.active = false;
        this.stumble();
        return;
      }
    }
  }

  stumble() {
    this.lives -= 1;
    this.stumbles += 1;
    this.farmerGap = Math.max(0, this.farmerGap - FARMER.stumbleCost);
    this.player.invincibleLeft = 1.5;
    this.stumbleFlash = 0.9;
  }
}
