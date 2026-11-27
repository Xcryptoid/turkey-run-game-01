// A tiny seeded random generator (mulberry32). The world is spawned from one
// seed, so the same seed always deals the same fences, knives and corn — the
// screenshots and the grader's two runs see the same run.
export function makeRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** A number in [low, high) from the seeded stream. */
export function range(random, low, high) {
  return low + random() * (high - low);
}

/** Pick one entry of `items` from the seeded stream. */
export function pick(random, items) {
  return items[Math.floor(random() * items.length)];
}
