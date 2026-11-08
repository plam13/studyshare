#!/usr/bin/env node
/**
 * StudyShare seed script (server-side only).
 *
 *   npm run seed:dry-run   # report what would be created, write nothing
 *   npm run seed           # create missing users, courses, materials (+ files), comments, ratings
 *
 * Config is read from .env.server.local (git-ignored):
 *   SUPABASE_URL, SUPABASE_SECRET_KEY, SEED_EXPECTED_PROJECT_REF
 *
 * Safety:
 * - Users are created through the Auth Admin API (never by writing to auth.users); no emails are sent.
 * - Existing users are reused; passwords are never reset.
 * - Reruns skip records that already exist (no duplicates).
 * - Refuses to run against any project other than SEED_EXPECTED_PROJECT_REF.
 * - Never prints keys or tokens.
 */
import { readFile, stat } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { COMMENTS, COURSES, MATERIALS, RATINGS, USERS } from './seed-data.mjs';
import { SOFTUNI_ATTRIBUTION, SOFTUNI_COMMENTS, SOFTUNI_MATERIALS, SOFTUNI_RATINGS } from './seed-softuni.mjs';
import { createSamplePdf } from './lib/pdf.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const BUCKET = 'materials';
const PDF_DIR = new URL('../pdf/', import.meta.url); // real course slides, git-ignored
const MAX_FILE_SIZE = 20 * 1024 * 1024; // same limit as the upload form

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

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const stats = {};
function count(entity, outcome) {
  stats[entity] ??= { created: 0, skipped: 0, 'would create': 0 };
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
        .insert({ title: course.title, description: course.description, created_by: userIds.get('admin@studyshare.bg') ?? null })
        .select('id')
        .single(),
      `Create course ${course.title}`,
    );
    ids.set(course.key, row.id);
  }
  return ids;
}

async function seedMaterials(userIds, courseIds) {
  const ids = new Map();
  const course = (key) => COURSES.find((c) => c.key === key);

  for (const material of MATERIALS) {
    const authorId = userIds.get(material.author);
    const courseId = courseIds.get(material.course);
    if (!authorId || !courseId) {
      created('materials'); // only possible in dry-run (author/course not created yet)
      continue;
    }

    const filePath = `${authorId}/seed-${material.key}.pdf`;
    const existing = await must(
      supabase.from('materials').select('id').eq('file_path', filePath).maybeSingle(),
      `Check material ${material.key}`,
    );
    if (existing) {
      ids.set(material.key, existing.id);
      count('materials', 'skipped');
      continue;
    }

    created('materials');
    if (DRY_RUN) continue;

    const pdf = createSamplePdf(`StudyShare: ${material.topic}`, [
      `Course: ${course(material.course).title}`,
      'This is a sample study material generated by the StudyShare seed script.',
      'Replace it with your own lecture notes, exercises or slides.',
    ]);
    await must(
      supabase.storage.from(BUCKET).upload(filePath, pdf, { contentType: 'application/pdf', upsert: true }),
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
          file_name: `${material.key}.pdf`,
          file_type: 'application/pdf',
          file_size: pdf.length,
          downloads_count: material.downloads,
        })
        .select('id')
        .single(),
      `Create material ${material.key}`,
    );
    ids.set(material.key, row.id);
  }
  return ids;
}

/** Real SoftUni slides from `pdf/`. Missing files are skipped with a warning, so the seed works without them. */
async function seedSoftUniMaterials(userIds, courseIds, ids) {
  for (const material of SOFTUNI_MATERIALS) {
    const fileUrl = new URL(material.file, PDF_DIR);
    const size = await stat(fileUrl).then((s) => s.size, () => null);
    if (size === null) {
      console.warn(`⚠ pdf/${material.file} not found — skipping ${material.key}`);
      count('softuni materials', 'skipped');
      continue;
    }
    if (size > MAX_FILE_SIZE) fail(`pdf/${material.file} is larger than 20 MB`);

    const authorId = userIds.get(material.author);
    const courseId = courseIds.get(material.course);
    if (!authorId || !courseId) {
      created('softuni materials'); // only possible in dry-run (author/course not created yet)
      continue;
    }

    const filePath = `${authorId}/softuni-${material.key}.pdf`;
    const existing = await must(
      supabase.from('materials').select('id').eq('file_path', filePath).maybeSingle(),
      `Check material ${material.key}`,
    );
    if (existing) {
      ids.set(material.key, existing.id);
      count('softuni materials', 'skipped');
      continue;
    }

    created('softuni materials');
    if (DRY_RUN) continue;

    const pdf = await readFile(fileUrl);
    await must(
      supabase.storage.from(BUCKET).upload(filePath, pdf, { contentType: 'application/pdf', upsert: true }),
      `Upload file ${filePath}`,
    );

    const row = await must(
      supabase
        .from('materials')
        .insert({
          course_id: courseId,
          author_id: authorId,
          title: material.title,
          description: `${material.description}\n\n${SOFTUNI_ATTRIBUTION}`,
          file_path: filePath,
          file_name: material.file,
          file_type: 'application/pdf',
          file_size: size,
          downloads_count: material.downloads,
        })
        .select('id')
        .single(),
      `Create material ${material.key}`,
    );
    ids.set(material.key, row.id);
    console.log(`↑ uploaded pdf/${material.file} (${(size / 1024 / 1024).toFixed(1)} MB)`);
  }
}

async function seedComments(userIds, materialIds) {
  const materialIdList = [...materialIds.values()];
  const existing = materialIdList.length
    ? await must(
        supabase.from('comments').select('material_id, author_id, content').in('material_id', materialIdList),
        'Load comments',
      )
    : [];
  const seen = new Set(existing.map((c) => `${c.material_id}|${c.author_id}|${c.content}`));

  for (const [materialKey, email, content] of [...COMMENTS, ...SOFTUNI_COMMENTS]) {
    const materialId = materialIds.get(materialKey);
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
    await must(
      supabase.from('comments').insert({ material_id: materialId, author_id: authorId, content }),
      `Create comment on ${materialKey}`,
    );
  }
}

async function seedRatings(userIds, materialIds) {
  const materialIdList = [...materialIds.values()];
  const existing = materialIdList.length
    ? await must(supabase.from('ratings').select('material_id, user_id').in('material_id', materialIdList), 'Load ratings')
    : [];
  const seen = new Set(existing.map((r) => `${r.material_id}|${r.user_id}`));

  for (const [materialKey, email, score] of [...RATINGS, ...SOFTUNI_RATINGS]) {
    const materialId = materialIds.get(materialKey);
    const userId = userIds.get(email);
    if (!materialId || !userId) {
      created('ratings');
      continue;
    }
    if (seen.has(`${materialId}|${userId}`)) {
      count('ratings', 'skipped');
      continue;
    }
    created('ratings');
    if (DRY_RUN) continue;
    await must(
      supabase.from('ratings').insert({ material_id: materialId, user_id: userId, score }),
      `Create rating on ${materialKey}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
console.log(`StudyShare seed → project ${projectRef}${DRY_RUN ? '  [DRY RUN — nothing will be written]' : ''}\n`);

const userIds = await seedUsers();
const courseIds = await seedCourses(userIds);
const materialIds = await seedMaterials(userIds, courseIds);
await seedSoftUniMaterials(userIds, courseIds, materialIds);
await seedComments(userIds, materialIds);
await seedRatings(userIds, materialIds);

console.table(stats);
console.log(DRY_RUN ? 'Dry run finished. Run `npm run seed` to apply.' : 'Seed finished.');
