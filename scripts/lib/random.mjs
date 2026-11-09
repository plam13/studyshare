/** Deterministic pseudo-random numbers, so every seed run produces the same files and dates. */

/** 32-bit FNV-1a hash of a string. */
export function hashString(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 generator seeded from a string; returns () => float in [0, 1). */
export function createRandom(seedText) {
  let state = hashString(seedText);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = (random, list) => list[Math.floor(random() * list.length)];
export const between = (random, min, max) => min + Math.floor(random() * (max - min + 1));
