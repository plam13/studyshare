#!/usr/bin/env node
/**
 * StudyShare seed script (server-side only).
 *
 *   npm run seed:dry-run   # report what would be created, write nothing
 *   npm run seed           # create missing users, courses, materials (+ files), comments, ratings
 *   npm run seed -- --reset   # delete the demo materials (files, comments, ratings) and create them again
 *
 * Config is read from .env.server.local (git-ignored):
 *   SUPABASE_URL, SUPABASE_SECRET_KEY, SEED_EXPECTED_PROJECT_REF
 *
 * Safety:
 * - Users are created through the Auth Admin API (never by writing to auth.users); no emails are sent.
 * - Existing users are reused; passwords are never reset.
 * - Reruns skip records that already exist (no duplicates).
 * - --reset touches only demo materials (Storage path "<author>/seed-<key>.<ext>"), never content created in the app.
 * - Refuses to run against any project other than SEED_EXPECTED_PROJECT_REF.
 * - Never prints keys or tokens.
 */
import { createClient } from '@supabase/supabase-js';
import { COMMENTS, COURSES, DATE_HINTS, DATE_RANGE, FILE_SPECS, MATERIALS, RATINGS, USERS } from './seed-data.mjs';
import { buildSampleFile } from './lib/sample-files.mjs';
import { createSeedDates, iso } from './lib/seed-dates.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const RESET = process.argv.includes('--reset');
const BUCKET = 'materials';
const dates = createSeedDates(DATE_RANGE);

// ---------------------------------------------------------------------------
// Config & safety checks
// ---------------------------------------------------------------------------
function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

const { SUPABASE_URL, SUPABASE_SECRET_KEY, SEED_EXPECTED_PROJECT_REF } = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !SEED_EXPECTED_PROJECT_REF) {
  fail('Missing config. Create .env.server.local from .env.server.example.');
}
const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
if (projectRef !== SEED_EXPECTED_PROJECT_REF) {
  fail(`Refusing to run: SUPABASE_URL points to "${projectRef}", expected "${SEED_EXPECTED_PROJECT_REF}".`);
}

// The secret key bypasses RLS, so check the data rules the policies would normally enforce.
const authorOf = new Map(MATERIALS.map((m) => [m.key, m.author]));
for (const [materialKey] of [...COMMENTS, ...RATINGS]) {
  if (!authorOf.has(materialKey)) fail(`Seed data refers to unknown material "${materialKey}".`);
}
for (const [materialKey, email] of RATINGS) {
  if (authorOf.get(materialKey) === email) fail(`Seed data: ${email} rates their own material "${materialKey}".`);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const stats = {};
function count(entity, outcome) {
  stats[entity] ??= { created: 0, skipped: 0, deleted: 0, 'would create': 0, 'would delete': 0 };
  stats[entity][outcome] += 1;
}
const created = (entity) => count(entity, DRY_RUN ? 'would create' : 'created');

async function must(promise, context) {
  const { data, error } = await promise;
  if (error) fail(`${context}: ${error.message}`);
  return data;
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------
async function seedUsers() {
  const existing = new Map();
  for (let page = 1; ; page += 1) {
    const data = await must(supabase.auth.admin.listUsers({ page, perPage: 1000 }), 'List users');
    data.users.forEach((user) => existing.set(user.email.toLowerCase(), user.id));
    if (data.users.length < 1000) break;
  }

  const ids = new Map();
  for (const user of USERS) {
    const id = existing.get(user.email);
    if (id) {
      ids.set(user.email, id);
      count('users', 'skipped');
      continue;
    }
    created('users');
    if (DRY_RUN) continue;
    const data = await must(
      supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // no confirmation email is sent
        user_metadata: { full_name: user.fullName }, // profile name only — roles never come from metadata
      }),
      `Create user ${user.email}`,
    );
    ids.set(user.email, data.user.id);
  }
  return ids;
}

async function seedCourses(userIds) {
  const rows = await must(supabase.from('courses').select('id, title'), 'Load courses');
  const byTitle = new Map(rows.map((row) => [row.title, row.id]));
  const ids = new Map();
  const courseDate = iso(new Date(DATE_RANGE.from).getTime() - 7 * 24 * 3600 * 1000);

  for (const course of COURSES) {
    const id = byTitle.get(course.title);
    if (id) {
      ids.set(course.key, id);
      count('courses', 'skipped');
      continue;
    }
    created('courses');
    if (DRY_RUN) continue;
    const row = await must(
      supabase
        .from('courses')
        .insert({
          title: course.title,
          description: course.description,
          created_by: userIds.get('admin@studyshare.bg') ?? null,
          created_at: courseDate,
          updated_at: courseDate,
        })
        .select('id')
        .single(),
      `Create course ${course.title}`,
    );
    ids.set(course.key, row.id);
  }
  return ids;
}

/** --reset: remove demo materials (Storage files first; comments and ratings cascade with the rows). */
async function resetDemoMaterials() {
  const rows = await must(supabase.from('materials').select('id, file_path').like('file_path', '%/seed-%'), 'Load demo materials');
  rows.forEach(() => count('materials', DRY_RUN ? 'would delete' : 'deleted'));
  if (DRY_RUN || !rows.length) return;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    await must(supabase.storage.from(BUCKET).remove(batch.map((r) => r.file_path)), 'Delete demo files');
    await must(supabase.from('materials').delete().in('id', batch.map((r) => r.id)), 'Delete demo materials');
  }
}

async function seedMaterials(userIds, courseIds) {
  const ids = new Map(); // key -> { id, time }
  const courseTitle = (key) => COURSES.find((c) => c.key === key).title;

  for (const material of MATERIALS) {
    const time = dates.material(material.key, DATE_HINTS[material.key]);
    const authorId = userIds.get(material.author);
    const courseId = courseIds.get(material.course);
    if (!authorId || !courseId) {
      created('materials'); // only possible in dry-run (author/course not created yet)
      continue;
    }

    const existing = RESET && DRY_RUN
      ? null // after a real reset nothing would exist
      : await must(
        supabase.from('materials').select('id, created_at').like('file_path', `${authorId}/seed-${material.key}.%`).maybeSingle(),
        `Check material ${material.key}`,
      );
    if (existing) {
      ids.set(material.key, { id: existing.id, time: new Date(existing.created_at).getTime() });
      count('materials', 'skipped');
      continue;
    }

    created('materials');
    if (DRY_RUN) continue;

    const [format, size] = FILE_SPECS[material.key] ?? ['pdf', 's'];
    const file = buildSampleFile({ ...material, format, size }, courseTitle(material.course), new Date(time));
    const filePath = `${authorId}/seed-${material.key}.${file.ext}`;
    await must(
      supabase.storage.from(BUCKET).upload(filePath, file.data, { contentType: file.mime, upsert: true }),
      `Upload file ${filePath}`,
    );

    const row = await must(
      supabase
        .from('materials')
        .insert({
          course_id: courseId,
          author_id: authorId,
          title: material.title,
          description: material.description,
          file_path: filePath,
          file_name: file.fileName,
          file_type: file.mime,
          file_size: file.data.length,
          downloads_count: material.downloads,
          created_at: iso(time),
          updated_at: iso(time), // equal to created_at, so the material is not shown as edited
        })
        .select('id')
        .single(),
      `Create material ${material.key}`,
    );
    ids.set(material.key, { id: row.id, time });
    console.log(`↑ ${file.fileName.padEnd(48)} ${(file.data.length / 1024).toFixed(1).padStart(8)} KB  ${iso(time).slice(0, 10)}`);
  }
  return ids;
}

async function seedComments(userIds, materials) {
  const materialIdList = [...materials.values()].map((m) => m.id);
  const existing = materialIdList.length
    ? await must(
        supabase.from('comments').select('material_id, author_id, content').in('material_id', materialIdList),
        'Load comments',
      )
    : [];
  const seen = new Set(existing.map((c) => `${c.material_id}|${c.author_id}|${c.content}`));

  // Times per material, in list order (so a discussion reads chronologically)
  const byMaterial = new Map();
  COMMENTS.forEach(([key], index) => byMaterial.set(key, [...(byMaterial.get(key) ?? []), index]));
  const timeOf = new Map();
  for (const [key, indexes] of byMaterial) {
    const material = materials.get(key);
    if (!material) continue;
    dates.comments(key, material.time, indexes.length).forEach((time, i) => timeOf.set(indexes[i], time));
  }

  for (const [index, [materialKey, email, content]] of COMMENTS.entries()) {
    const materialId = materials.get(materialKey)?.id;
    const authorId = userIds.get(email);
    if (!materialId || !authorId) {
      created('comments');
      continue;
    }
    if (seen.has(`${materialId}|${authorId}|${content}`)) {
      count('comments', 'skipped');
      continue;
    }
    created('comments');
    if (DRY_RUN) continue;
    const time = iso(timeOf.get(index));
    await must(
      supabase.from('comments').insert({ material_id: materialId, author_id: authorId, content, created_at: time, updated_at: time }),
      `Create comment on ${materialKey}`,
    );
  }
}

async function seedRatings(userIds, materials) {
  const materialIdList = [...materials.values()].map((m) => m.id);
  const existing = materialIdList.length
    ? await must(supabase.from('ratings').select('material_id, user_id').in('material_id', materialIdList), 'Load ratings')
    : [];
  const seen = new Set(existing.map((r) => `${r.material_id}|${r.user_id}`));

  for (const [materialKey, email, score] of RATINGS) {
    const material = materials.get(materialKey);
    const userId = userIds.get(email);
    if (!material || !userId) {
      created('ratings');
      continue;
    }
    if (seen.has(`${material.id}|${userId}`)) {
      count('ratings', 'skipped');
      continue;
    }
    created('ratings');
    if (DRY_RUN) continue;
    const time = iso(dates.rating(materialKey, email, material.time));
    await must(
      supabase.from('ratings').insert({ material_id: material.id, user_id: userId, score, created_at: time, updated_at: time }),
      `Create rating on ${materialKey}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
const flags = [DRY_RUN && 'DRY RUN — nothing will be written', RESET && 'RESET demo materials'].filter(Boolean).join(', ');
console.log(`StudyShare seed → project ${projectRef}${flags ? `  [${flags}]` : ''}\n`);

const userIds = await seedUsers();
const courseIds = await seedCourses(userIds);
if (RESET) await resetDemoMaterials();
const materials = await seedMaterials(userIds, courseIds);
await seedComments(userIds, materials);
await seedRatings(userIds, materials);

console.table(stats);
console.log(DRY_RUN ? 'Dry run finished. Run without --dry-run to apply.' : 'Seed finished.');
