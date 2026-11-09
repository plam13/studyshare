/**
 * Favorites ("Запази"): a private list of saved materials per user.
 * RLS: users see, add and remove only their own rows.
 */
import { supabase } from './supabase.js';
import { throwFriendly, withSignal } from './errors.js';
import { listMaterialsByIds } from './materials.js';

/** True when the user has saved the material. */
export async function isFavorite(materialId, userId, { signal } = {}) {
  const { data, error } = await withSignal(
    supabase.from('favorites').select('material_id').eq('material_id', materialId).eq('user_id', userId).maybeSingle(),
    signal,
  );
  if (error) throwFriendly(error, 'Запазените материали не можаха да бъдат заредени.');
  return Boolean(data);
}

export async function addFavorite(materialId, userId) {
  const { error } = await supabase.from('favorites').insert({ material_id: materialId, user_id: userId });
  if (error?.code === '23505') return; // already saved (e.g. in another tab)
  if (error) throwFriendly(error, 'Материалът не можа да бъде запазен. Опитай отново.');
}

export async function removeFavorite(materialId, userId) {
  const { error } = await supabase.from('favorites').delete().eq('material_id', materialId).eq('user_id', userId);
  if (error) throwFriendly(error, 'Материалът не можа да бъде премахнат от запазените. Опитай отново.');
}

/** The user's saved materials (with author, course and stats), most recently saved first. */
export async function listFavoriteMaterials(userId, { limit, signal } = {}) {
  let query = supabase.from('favorites').select('material_id').eq('user_id', userId).order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await withSignal(query, signal);
  if (error) throwFriendly(error, 'Запазените материали не можаха да бъдат заредени.');
  return listMaterialsByIds(data.map((row) => row.material_id), { signal });
}
