import { supabase } from './supabase.js';
import { throwFriendly } from './errors.js';

export const MATERIALS_BUCKET = 'materials';
export const AVATARS_BUCKET = 'avatars';
const SIGNED_URL_TTL_SECONDS = 60;

/** Limits mirror the bucket settings in supabase/migrations/*_storage_buckets.sql. */
export const MATERIAL_MAX_BYTES = 20 * 1024 * 1024;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

/** Allowed material extensions → MIME type stored in Storage and in materials.file_type. */
const MATERIAL_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  zip: 'application/zip',
};

const AVATAR_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

/** Value for <input type="file" accept="…">. */
export const MATERIAL_ACCEPT = Object.keys(MATERIAL_TYPES).map((ext) => `.${ext}`).join(',');
export const AVATAR_ACCEPT = Object.keys(AVATAR_TYPES).map((ext) => `.${ext}`).join(',');

function extensionOf(fileName) {
  const match = /\.([a-z0-9]+)$/i.exec(fileName ?? '');
  return match ? match[1].toLowerCase() : '';
}

/**
 * MIME type derived from the extension (browsers report e.g. ZIP files inconsistently),
 * or null when the type is not allowed.
 */
export function materialMimeType(file) {
  return MATERIAL_TYPES[extensionOf(file?.name)] ?? null;
}

/** Validates a material file. Returns a Bulgarian error message or '' when valid. */
export function validateMaterialFile(file) {
  if (!file) return 'Избери файл.';
  if (!materialMimeType(file)) return 'Позволени са PDF, Word, PowerPoint, Excel, TXT и ZIP файлове.';
  if (file.size === 0) return 'Файлът е празен.';
  if (file.size > MATERIAL_MAX_BYTES) return 'Файлът е по-голям от 20 MB.';
  return '';
}

/** Validates an avatar image. Returns a Bulgarian error message or '' when valid. */
export function validateAvatarFile(file) {
  if (!file) return 'Избери изображение.';
  if (!AVATAR_TYPES[extensionOf(file.name)]) return 'Позволени са JPG, PNG, WEBP и GIF изображения.';
  if (file.size > AVATAR_MAX_BYTES) return 'Изображението е по-голямо от 2 MB.';
  return '';
}

/**
 * Storage keys must be ASCII-safe: "Exam notes (final).pdf" → "Exam-notes-final.pdf".
 * Non-Latin characters are dropped; the object path is prefixed with a UUID, so it stays unique.
 * The original name is kept in the DB (materials.file_name) and used for downloads.
 */
export function safeStorageName(fileName) {
  const ext = extensionOf(fileName);
  const base = fileName.replace(/\.[^.]+$/, '');
  const slug = base
    .normalize('NFKD')
    .replace(/\p{M}/gu, '') // drop accents: "é" → "e"
    .replace(/[^A-Za-z0-9._-]+/g, '-') // everything else (incl. Cyrillic, spaces) → "-"
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 60);
  return `${slug || 'file'}${ext ? `.${ext}` : ''}`;
}

// ---------------------------------------------------------------------------
// Materials bucket (private)
// ---------------------------------------------------------------------------

/**
 * Uploads a material file into the user's own folder: <userId>/<uuid>-<safe-name>.
 * @returns {Promise<{ filePath: string, fileName: string, fileType: string, fileSize: number }>}
 */
export async function uploadMaterialFile(userId, file) {
  const fileType = materialMimeType(file);
  const filePath = `${userId}/${crypto.randomUUID()}-${safeStorageName(file.name)}`;
  const { error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .upload(filePath, file, { contentType: fileType, upsert: false });
  if (error) throwFriendly(error, 'Файлът не можа да бъде качен. Провери типа и размера и опитай отново.');
  return { filePath, fileName: file.name, fileType, fileSize: file.size };
}

/** Deletes material files. Never throws: a leftover file must not block the user's action. */
export async function removeMaterialFiles(paths) {
  const list = paths.filter(Boolean);
  if (!list.length) return;
  const { error } = await supabase.storage.from(MATERIALS_BUCKET).remove(list);
  if (error) console.warn('Could not remove material files from Storage', error);
}

/**
 * Creates a short-lived signed URL for a private material file.
 * The browser downloads it with the original file name (Content-Disposition: attachment).
 * Storage policies allow this only for logged-in users.
 */
export async function getMaterialDownloadUrl(filePath, fileName) {
  const { data, error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_TTL_SECONDS, { download: fileName });
  if (error) throwFriendly(error, 'Файлът не можа да бъде изтеглен. Опитай отново.');
  return data.signedUrl;
}

// ---------------------------------------------------------------------------
// Avatars bucket (public)
// ---------------------------------------------------------------------------

/**
 * Uploads a new avatar as <userId>/avatar-<timestamp>.<ext> (a new name each time avoids stale CDN caches).
 * @returns {Promise<{ path: string, publicUrl: string }>}
 */
export async function uploadAvatarFile(userId, file) {
  const ext = extensionOf(file.name);
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, file, { contentType: AVATAR_TYPES[ext], upsert: false });
  if (error) throwFriendly(error, 'Снимката не можа да бъде качена. Опитай отново.');
  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

/** Removes one avatar file. Never throws. */
export async function removeAvatarFile(path) {
  const { error } = await supabase.storage.from(AVATARS_BUCKET).remove([path]);
  if (error) console.warn('Could not remove avatar file', error);
}

/** Removes all of the user's avatar files except `keepPath`. Never throws. */
export async function removeOldAvatarFiles(userId, keepPath = '') {
  const { data, error } = await supabase.storage.from(AVATARS_BUCKET).list(userId, { limit: 100 });
  if (error) {
    console.warn('Could not list avatar files', error);
    return;
  }
  const stale = data.map((item) => `${userId}/${item.name}`).filter((path) => path !== keepPath);
  if (!stale.length) return;
  const { error: removeError } = await supabase.storage.from(AVATARS_BUCKET).remove(stale);
  if (removeError) console.warn('Could not remove old avatar files', removeError);
}
