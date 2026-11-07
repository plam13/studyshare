// Stable pastel tone per entity (no DB column needed): the same course always gets the same color.

const COURSE_TONES = ['sky', 'green', 'coral', 'yellow', 'lilac'];

/** Simple string hash (djb2) → non-negative integer. */
function hash(value) {
  let result = 5381;
  for (const char of String(value)) result = ((result << 5) + result + char.charCodeAt(0)) >>> 0;
  return result;
}

/** Tone name for a course ID, e.g. "green". Use with the `ss-tone-<name>` classes. */
export function courseTone(courseId) {
  return COURSE_TONES[hash(courseId) % COURSE_TONES.length];
}

/** "Programming Basics" → "programming-basics" (decorative window-bar title). */
export function slugify(text) {
  return String(text)
    .toLocaleLowerCase('bg')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'course';
}
