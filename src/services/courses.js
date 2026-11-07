import { supabase } from './supabase.js';
import { isNotFoundError, throwFriendly, withSignal } from './errors.js';
import { removeMaterialFiles } from './storage.js';

/** Limits mirror the CHECK constraints in supabase/migrations/*_init_schema.sql. */
export const COURSE_TITLE_MIN = 2;
export const COURSE_TITLE_MAX = 120;
export const COURSE_DESCRIPTION_MAX = 1000;

const UNIQUE_VIOLATION = '23505';

function normalizeCourse(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    materialsCount: row.materials?.[0]?.count ?? 0,
    createdAt: row.created_at,
  };
}

/** All courses, alphabetically, with exact material counts (aggregated by PostgREST). */
export async function listCourses({ signal } = {}) {
  const { data, error } = await withSignal(
    supabase.from('courses').select('id, title, description, created_at, materials(count)').order('title'),
    signal,
  );
  if (error) throwFriendly(error, 'Курсовете не можаха да бъдат заредени.');
  return data.map(normalizeCourse);
}

/** One course by ID, or null when it does not exist. */
export async function getCourse(id, { signal } = {}) {
  const { data, error } = await withSignal(
    supabase.from('courses').select('id, title, description, created_at, materials(count)').eq('id', id).maybeSingle(),
    signal,
  );
  if (error) {
    if (isNotFoundError(error)) return null;
    throwFriendly(error, 'Курсът не можа да бъде зареден.');
  }
  return data ? normalizeCourse(data) : null;
}

// ---------------------------------------------------------------------------
// Mutations (RLS: admins only)
// ---------------------------------------------------------------------------

function courseError(error, fallback) {
  if (error.code === UNIQUE_VIOLATION) throw new Error('Вече има курс с това заглавие.');
  throwFriendly(error, fallback);
}

/** Creates a course. @returns {Promise<string>} the new course ID */
export async function createCourse({ title, description }, createdBy) {
  const { data, error } = await supabase
    .from('courses')
    .insert({ title, description, created_by: createdBy })
    .select('id')
    .single();
  if (error) courseError(error, 'Курсът не можа да бъде създаден. Опитай отново.');
  return data.id;
}

export async function updateCourse(id, { title, description }) {
  const { data, error } = await supabase.from('courses').update({ title, description }).eq('id', id).select('id');
  if (error) courseError(error, 'Промените по курса не можаха да бъдат запазени.');
  if (!data.length) throw new Error('Нямаш права да редактираш този курс.');
}

/**
 * Deletes a course. Its materials, comments and ratings are removed by the DB cascade,
 * but Storage files are not — so the file paths are collected first and removed afterwards.
 */
export async function deleteCourse(id) {
  const { data: files, error: filesError } = await supabase.from('materials').select('file_path').eq('course_id', id);
  if (filesError) throwFriendly(filesError, 'Курсът не можа да бъде изтрит. Опитай отново.');

  const { data, error } = await supabase.from('courses').delete().eq('id', id).select('id');
  if (error) throwFriendly(error, 'Курсът не можа да бъде изтрит. Опитай отново.');
  if (!data.length) throw new Error('Нямаш права да изтриеш този курс.');

  await removeMaterialFiles(files.map((file) => file.file_path));
}
