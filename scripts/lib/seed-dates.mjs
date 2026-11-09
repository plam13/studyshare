/**
 * Deterministic demo dates: materials spread over DATE_RANGE, comments after their material
 * (in list order, so discussions read chronologically), ratings between the material date and the range end.
 */
import { createRandom } from './random.mjs';

const HOUR = 3600 * 1000;

export function createSeedDates({ from, to }) {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  // Daytime hours only (08:00–23:00 local), so nothing is posted at 4 a.m.
  const daytime = (time, random) => {
    const date = new Date(time);
    if (date.getHours() < 8) date.setHours(8 + Math.floor(random() * 4), Math.floor(random() * 60));
    return Math.min(date.getTime(), end);
  };

  return {
    /**
     * Upload time of a material; leaves at least two days for its discussion.
     * @param {number} [hint] position in the range (0 = start, 1 = end); ±3 days jitter. Random when omitted.
     */
    material(key, hint) {
      const random = createRandom(`date:${key}`);
      const span = end - start - 2 * 24 * HOUR;
      const time = hint === undefined
        ? start + random() * span
        : start + hint * span + (random() - 0.5) * 6 * 24 * HOUR;
      return daytime(Math.min(Math.max(time, start), start + span), random);
    },

    /** Increasing times for `count` comments after `materialTime`, all before the range end. */
    comments(key, materialTime, count) {
      const random = createRandom(`comments:${key}`);
      const gaps = Array.from({ length: count }, (_, i) => (i === 0 ? 6 + random() * 72 : 1 + random() * 30) * HOUR);
      const total = gaps.reduce((sum, gap) => sum + gap, 0);
      const scale = Math.min(1, (end - materialTime - HOUR) / total);
      let time = materialTime;
      return gaps.map((gap) => {
        time += gap * scale;
        return Math.round(time);
      });
    },

    /** Rating time between the material and the range end. */
    rating(key, email, materialTime) {
      const random = createRandom(`rating:${key}:${email}`);
      return daytime(materialTime + (2 + random() * Math.max((end - materialTime) / HOUR - 2, 1)) * HOUR, random);
    },
  };
}

export const iso = (time) => new Date(time).toISOString();
