import { supabase } from './supabase.js';
import { throwFriendly } from './errors.js';

export const MATERIALS_BUCKET = 'materials';
const SIGNED_URL_TTL_SECONDS = 60;

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
