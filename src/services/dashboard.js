import { supabase } from './supabase.js';
import { throwFriendly, withSignal } from './errors.js';

/**
 * Personal statistics for the logged-in user, aggregated in the database
 * (RPC public.get_my_dashboard, SECURITY INVOKER — respects RLS).
 */
export async function getMyDashboard({ signal } = {}) {
  const { data, error } = await withSignal(supabase.rpc('get_my_dashboard'), signal);
  if (error) throwFriendly(error, 'Статистиката не можа да бъде заредена.');
  return {
    materialsCount: data.materials_count,
    downloadsTotal: data.downloads_total,
    ratingsReceived: data.ratings_received,
    avgRatingReceived: Number(data.avg_rating_received),
    commentsReceived: data.comments_received,
    commentsWritten: data.comments_written,
    ratingsGiven: data.ratings_given,
    coursesCount: data.courses_count,
  };
}
