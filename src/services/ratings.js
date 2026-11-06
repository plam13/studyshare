import { supabase } from './supabase.js';
import { throwFriendly, withSignal } from './errors.js';

/** The current user's score (1–5) for a material, or 0 when not rated yet. */
export async function getMyRating(materialId, userId, { signal } = {}) {
  const { data, error } = await withSignal(
    supabase.from('ratings').select('score').eq('material_id', materialId).eq('user_id', userId).maybeSingle(),
    signal,
  );
  if (error) throwFriendly(error, 'Твоята оценка не можа да бъде заредена.');
  return data?.score ?? 0;
}

/**
 * Sets the user's rating. Insert first, update on a duplicate key — a PostgREST upsert
 * would also try to update material_id/user_id, which clients are not granted.
 */
export async function rateMaterial(materialId, userId, score) {
  const { error } = await supabase.from('ratings').insert({ material_id: materialId, user_id: userId, score });
  if (!error) return;
  if (error.code !== '23505') {
    throwFriendly(error, error.code === '42501' ? 'Не можеш да оцениш собствен материал.' : 'Оценката не можа да бъде запазена.');
  }

  const { error: updateError } = await supabase
    .from('ratings')
    .update({ score })
    .eq('material_id', materialId)
    .eq('user_id', userId);
  if (updateError) throwFriendly(updateError, 'Оценката не можа да бъде запазена.');
}

export async function removeRating(materialId, userId) {
  const { error } = await supabase.from('ratings').delete().eq('material_id', materialId).eq('user_id', userId);
  if (error) throwFriendly(error, 'Оценката не можа да бъде премахната.');
}
