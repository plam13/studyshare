/**
 * Reports ("Сигнализирай"): users flag other users' materials; admins review them.
 * RLS: users insert/see only their own reports and never for their own materials; only admins see all and change status.
 */
import { supabase } from './supabase.js';
import { throwFriendly, withSignal } from './errors.js';

export const REPORT_REASONS = {
  copyright: 'Нарушава авторски права',
  inappropriate: 'Неподходящо съдържание',
  spam: 'Спам или реклама',
  wrong_course: 'Грешен курс',
  other: 'Друго',
};

/** The current user's report for a material, or null. */
export async function getMyReport(materialId, userId, { signal } = {}) {
  const { data, error } = await withSignal(
    supabase.from('reports').select('id, reason, status, created_at').eq('material_id', materialId).eq('reporter_id', userId).maybeSingle(),
    signal,
  );
  if (error) throwFriendly(error, 'Сигналът не можа да бъде зареден.');
  return data;
}

/** @param {{ materialId: string, userId: string, reason: keyof REPORT_REASONS, details: string }} report */
export async function createReport({ materialId, userId, reason, details }) {
  const { error } = await supabase
    .from('reports')
    .insert({ material_id: materialId, reporter_id: userId, reason, details: details.trim() });
  if (error?.code === '23505') throw new Error('Вече си сигнализирал за този материал.');
  if (error) throwFriendly(error, 'Сигналът не можа да бъде изпратен. Опитай отново.');
}

/** Admin: number of open reports (count only, no rows are transferred). */
export async function countOpenReports({ signal } = {}) {
  const { count, error } = await withSignal(
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    signal,
  );
  if (error) throwFriendly(error, 'Броят на сигналите не можа да бъде зареден.');
  return count ?? 0;
}

/** Admin: open reports, newest first, with material and reporter. */
export async function listOpenReports({ signal } = {}) {
  const { data, error } = await withSignal(
    supabase
      .from('reports')
      .select(`id, reason, details, created_at,
        reporter:profiles!reports_reporter_id_fkey(full_name),
        material:materials(id, title, file_path, author_id, author:profiles!materials_author_id_fkey(full_name))`)
      .eq('status', 'open')
      .order('created_at', { ascending: false }),
    signal,
  );
  if (error) throwFriendly(error, 'Сигналите не можаха да бъдат заредени.');
  return data.map((row) => ({
    id: row.id,
    reason: row.reason,
    reasonLabel: REPORT_REASONS[row.reason] ?? row.reason,
    details: row.details,
    createdAt: row.created_at,
    reporterName: row.reporter?.full_name || 'Потребител',
    material: row.material
      ? { id: row.material.id, title: row.material.title, filePath: row.material.file_path, authorName: row.material.author?.full_name || 'Потребител' }
      : null,
  }));
}

/**
 * Admin: closes a report. The database records who closed it and when.
 * @param {string} id
 * @param {'resolved' | 'dismissed'} status
 */
export async function setReportStatus(id, status) {
  const { data, error } = await supabase.from('reports').update({ status }).eq('id', id).select('id');
  if (error) throwFriendly(error, 'Сигналът не можа да бъде обновен.');
  if (!data.length) throw new Error('Нямаш права да обработваш сигнали.');
}
