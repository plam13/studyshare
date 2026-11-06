/** Shared helpers for turning Supabase/PostgREST errors into user-friendly errors. */

/** True for "no rows" or an invalid UUID in the URL — both mean "not found" for the user. */
export function isNotFoundError(error) {
  return error?.code === 'PGRST116' || error?.code === '22P02';
}

export function isAbortError(error) {
  return error?.name === 'AbortError' || /abort/i.test(error?.message ?? '');
}

/**
 * Throws a friendly Error (Bulgarian message) that keeps the original as `cause`.
 * @param {object} error Supabase error
 * @param {string} message message shown to the user
 */
export function throwFriendly(error, message) {
  if (isAbortError(error)) {
    const abort = new Error('Request aborted');
    abort.name = 'AbortError';
    throw abort;
  }
  const friendly = new Error(message);
  friendly.cause = error;
  throw friendly;
}

/** Applies an AbortSignal to a Supabase query builder when provided. */
export function withSignal(query, signal) {
  return signal ? query.abortSignal(signal) : query;
}
