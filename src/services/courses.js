import { supabase } from './supabase.js';
import { isNotFoundError, throwFriendly, withSignal } from './errors.js';

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
