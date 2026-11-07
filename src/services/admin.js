/**
 * Admin-only data access. Every call is authorized in the database:
 * the RPCs check public.is_admin(), and table writes go through RLS policies.
 */
import { supabase } from './supabase.js';
import { throwFriendly, withSignal } from './errors.js';

/** Site-wide totals for the admin overview. */
export async function getAdminStats({ signal } = {}) {
  const { data, error } = await withSignal(supabase.rpc('admin_get_stats'), signal);
  if (error) throwFriendly(error, 'Статистиката не можа да бъде заредена.');
  return {
    usersCount: data.users_count,
    adminsCount: data.admins_count,
    coursesCount: data.courses_count,
    materialsCount: data.materials_count,
    commentsCount: data.comments_count,
    downloadsTotal: data.downloads_total,
  };
}

/** All users with email, role and activity counters (oldest first). */
export async function listUsers({ signal } = {}) {
  const { data, error } = await withSignal(supabase.rpc('admin_list_users'), signal);
  if (error) throwFriendly(error, 'Потребителите не можаха да бъдат заредени.');
  return data.map((row) => ({
    id: row.id,
    email: row.email ?? '',
    fullName: row.full_name ?? '',
    avatarUrl: row.avatar_url ?? null,
    role: row.role,
    isAdmin: row.role === 'admin',
    createdAt: row.created_at,
    lastSignInAt: row.last_sign_in_at,
    materialsCount: row.materials_count,
    commentsCount: row.comments_count,
  }));
}

/**
 * Grants or revokes the admin role. RLS allows this only for admins and never on their own row,
 * so at least one admin always remains.
 * @param {string} userId
 * @param {'user' | 'admin'} role
 */
export async function setUserRole(userId, role) {
  const { data, error } = await supabase.from('user_roles').update({ role }).eq('user_id', userId).select('user_id');
  if (error) throwFriendly(error, 'Ролята не можа да бъде променена. Опитай отново.');
  if (!data.length) throw new Error('Нямаш права да промениш тази роля.');
}

/** Latest comments across all materials, for moderation. */
export async function listRecentComments(limit = 20, { signal } = {}) {
  const { data, error } = await withSignal(
    supabase
      .from('comments')
      .select('id, content, created_at, author:profiles!comments_author_id_fkey(full_name), material:materials(id, title)')
      .order('created_at', { ascending: false })
      .limit(limit),
    signal,
  );
  if (error) throwFriendly(error, 'Коментарите не можаха да бъдат заредени.');
  return data.map((row) => ({
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    authorName: row.author?.full_name || 'Потребител',
    material: row.material ?? null,
  }));
}
