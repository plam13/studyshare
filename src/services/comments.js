import { supabase } from './supabase.js';
import { throwFriendly, withSignal } from './errors.js';

function normalizeComment(row) {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    authorId: row.author_id,
    authorName: row.author?.full_name || 'Потребител',
    authorAvatarUrl: row.author?.avatar_url ?? null,
  };
}

/** Comments of a material, oldest first (chronological discussion). */
export async function listComments(materialId, { signal } = {}) {
  const { data, error } = await withSignal(
    supabase
      .from('comments')
      .select('id, content, created_at, updated_at, author_id, author:profiles!comments_author_id_fkey(full_name, avatar_url)')
      .eq('material_id', materialId)
      .order('created_at', { ascending: true }),
    signal,
  );
  if (error) throwFriendly(error, 'Коментарите не можаха да бъдат заредени.');
  return data.map(normalizeComment);
}

export const COMMENT_MAX_LENGTH = 1000;

export async function addComment(materialId, authorId, content) {
  const { error } = await supabase.from('comments').insert({ material_id: materialId, author_id: authorId, content });
  if (error) throwFriendly(error, 'Коментарът не можа да бъде публикуван. Опитай отново.');
}

/** Only the author may edit (RLS). */
export async function updateComment(commentId, content) {
  const { data, error } = await supabase.from('comments').update({ content }).eq('id', commentId).select('id');
  if (error) throwFriendly(error, 'Коментарът не можа да бъде запазен. Опитай отново.');
  if (!data.length) throw new Error('Нямаш права да редактираш този коментар.');
}

/** The author or an admin may delete (RLS). */
export async function deleteComment(commentId) {
  const { data, error } = await supabase.from('comments').delete().eq('id', commentId).select('id');
  if (error) throwFriendly(error, 'Коментарът не можа да бъде изтрит. Опитай отново.');
  if (!data.length) throw new Error('Нямаш права да изтриеш този коментар.');
}
