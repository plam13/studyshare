import { supabase } from './supabase.js';
import { isNotFoundError, throwFriendly, withSignal } from './errors.js';

const MATERIAL_FIELDS = `
  id, title, description, file_path, file_name, file_type, file_size, downloads_count,
  created_at, updated_at, course_id, author_id,
  author:profiles!materials_author_id_fkey(full_name, avatar_url),
  course:courses(id, title)
`;

function normalizeMaterial(row, stats) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    filePath: row.file_path,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    downloadsCount: row.downloads_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    courseId: row.course_id,
    authorId: row.author_id,
    authorName: row.author?.full_name || 'Потребител',
    authorAvatarUrl: row.author?.avatar_url ?? null,
    course: row.course ?? null,
    avgRating: Number(stats?.avg_rating ?? 0),
    ratingsCount: stats?.ratings_count ?? 0,
    commentsCount: stats?.comments_count ?? 0,
  };
}

/** Loads rating/comment aggregates (view material_stats) for the given materials. */
async function withStats(rows, signal) {
  if (!rows.length) return [];
  const { data, error } = await withSignal(
    supabase
      .from('material_stats')
      .select('material_id, avg_rating, ratings_count, comments_count')
      .in('material_id', rows.map((row) => row.id)),
    signal,
  );
  if (error) throwFriendly(error, 'Статистиката на материалите не можа да бъде заредена.');
  const byId = new Map(data.map((stat) => [stat.material_id, stat]));
  return rows.map((row) => normalizeMaterial(row, byId.get(row.id)));
}

/** All materials of one course, newest first. */
export async function listCourseMaterials(courseId, { signal } = {}) {
  const { data, error } = await withSignal(
    supabase.from('materials').select(MATERIAL_FIELDS).eq('course_id', courseId).order('created_at', { ascending: false }),
    signal,
  );
  if (error) {
    if (isNotFoundError(error)) return []; // e.g. malformed course ID in the URL
    throwFriendly(error, 'Материалите не можаха да бъдат заредени.');
  }
  return withStats(data, signal);
}

/** Most recently uploaded materials (home page). */
export async function listLatestMaterials(limit = 6, { signal } = {}) {
  const { data, error } = await withSignal(
    supabase.from('materials').select(MATERIAL_FIELDS).order('created_at', { ascending: false }).limit(limit),
    signal,
  );
  if (error) throwFriendly(error, 'Последните материали не можаха да бъдат заредени.');
  return withStats(data, signal);
}

/** Materials uploaded by one user, newest first. */
export async function listUserMaterials(userId, { limit, signal } = {}) {
  let query = supabase.from('materials').select(MATERIAL_FIELDS).eq('author_id', userId).order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await withSignal(query, signal);
  if (error) throwFriendly(error, 'Твоите материали не можаха да бъдат заредени.');
  return withStats(data, signal);
}

/** One material by ID (with author, course and stats), or null when it does not exist. */
export async function getMaterial(id, { signal } = {}) {
  const { data, error } = await withSignal(supabase.from('materials').select(MATERIAL_FIELDS).eq('id', id).maybeSingle(), signal);
  if (error) {
    if (isNotFoundError(error)) return null;
    throwFriendly(error, 'Материалът не можа да бъде зареден.');
  }
  if (!data) return null;
  const [material] = await withStats([data], signal);
  return material;
}

/**
 * Client-side sorting for an already fully loaded list.
 * @param {'newest' | 'rating' | 'downloads' | 'title'} sort
 */
export function sortMaterials(materials, sort) {
  const sorted = [...materials];
  const comparators = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    rating: (a, b) => b.avgRating - a.avgRating || b.ratingsCount - a.ratingsCount,
    downloads: (a, b) => b.downloadsCount - a.downloadsCount,
    title: (a, b) => a.title.localeCompare(b.title, 'bg'),
  };
  return sorted.sort(comparators[sort] ?? comparators.newest);
}
