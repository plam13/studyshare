import { supabase } from './supabase.js';
import { isNotFoundError, throwFriendly, withSignal } from './errors.js';
import { removeMaterialFiles, uploadMaterialFile } from './storage.js';

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

// ---------------------------------------------------------------------------
// Mutations (RLS: authors edit/delete their own materials, admins any)
// ---------------------------------------------------------------------------

function toRow({ courseId, title, description }) {
  return { course_id: courseId, title, description };
}

function fileColumns(file) {
  return { file_path: file.filePath, file_name: file.fileName, file_type: file.fileType, file_size: file.fileSize };
}

/**
 * Uploads the file and creates the material. If the DB insert fails, the uploaded file is removed.
 * @returns {Promise<string>} the new material ID
 */
export async function createMaterial({ courseId, title, description, file }, authorId) {
  const uploaded = await uploadMaterialFile(authorId, file);
  const { data, error } = await supabase
    .from('materials')
    .insert({ ...toRow({ courseId, title, description }), ...fileColumns(uploaded), author_id: authorId })
    .select('id')
    .single();
  if (error) {
    await removeMaterialFiles([uploaded.filePath]);
    throwFriendly(error, 'Материалът не можа да бъде запазен. Опитай отново.');
  }
  return data.id;
}

/**
 * Updates a material. With a new `file` the old one is replaced (uploaded into the editor's folder)
 * and removed from Storage after a successful save.
 */
export async function updateMaterial(material, { courseId, title, description, file }, editorId) {
  const uploaded = file ? await uploadMaterialFile(editorId, file) : null;
  const changes = { ...toRow({ courseId, title, description }), ...(uploaded ? fileColumns(uploaded) : {}) };

  const { data, error } = await supabase.from('materials').update(changes).eq('id', material.id).select('id');
  if (error || !data.length) {
    if (uploaded) await removeMaterialFiles([uploaded.filePath]);
    if (error) throwFriendly(error, 'Промените не можаха да бъдат запазени. Опитай отново.');
    throw new Error('Нямаш права да редактираш този материал.');
  }
  if (uploaded) await removeMaterialFiles([material.filePath]);
}

/** Deletes the material row (comments/ratings cascade), then its file in Storage. */
export async function deleteMaterial(material) {
  const { data, error } = await supabase.from('materials').delete().eq('id', material.id).select('id');
  if (error) throwFriendly(error, 'Материалът не можа да бъде изтрит. Опитай отново.');
  if (!data.length) throw new Error('Нямаш права да изтриеш този материал.');
  await removeMaterialFiles([material.filePath]);
}

/** +1 download (security definer RPC). Returns the new count, or null on failure (never blocks a download). */
export async function incrementDownloads(materialId) {
  const { data, error } = await supabase.rpc('increment_material_downloads', { p_material_id: materialId });
  if (error) {
    console.warn('Could not increment the download counter', error);
    return null;
  }
  return data;
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
