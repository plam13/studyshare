import { supabase } from './supabase.js';

/** Maps Supabase Auth error codes to user-friendly Bulgarian messages. */
const AUTH_ERROR_MESSAGES = {
  invalid_credentials: 'Грешен имейл или парола.',
  user_already_exists: 'Вече има регистриран потребител с този имейл.',
  email_exists: 'Вече има регистриран потребител с този имейл.',
  email_not_confirmed: 'Имейлът още не е потвърден. Провери пощата си.',
  weak_password: 'Паролата е твърде слаба. Използвай поне 6 символа.',
  over_email_send_rate_limit: 'Твърде много опити. Опитай отново след малко.',
  over_request_rate_limit: 'Твърде много опити. Опитай отново след малко.',
  validation_failed: 'Невалидни данни. Провери имейла и паролата.',
};

function toFriendlyError(error) {
  const message = AUTH_ERROR_MESSAGES[error?.code] ?? 'Възникна грешка. Опитай отново.';
  const friendly = new Error(message);
  friendly.cause = error;
  return friendly;
}

/**
 * Registers a new user. A DB trigger creates the profile and the default "user" role.
 * @returns {Promise<{ needsConfirmation: boolean }>} true when email confirmation is required
 */
export async function register({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/login.html`,
    },
  });
  if (error) throw toFriendlyError(error);

  // When "Confirm email" is enabled Supabase returns no session.
  // An empty identities array means the email is already taken.
  if (data.user && data.user.identities?.length === 0) {
    throw new Error(AUTH_ERROR_MESSAGES.user_already_exists);
  }
  return { needsConfirmation: !data.session };
}

export async function login({ email, password }) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toFriendlyError(error);
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw toFriendlyError(error);
}

/**
 * Returns the logged-in user with profile and role, or null for guests.
 * @returns {Promise<null | { id: string, email: string, fullName: string, avatarUrl: string | null, role: 'user' | 'admin', isAdmin: boolean }>}
 */
export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { user } = session;
  const [profileResult, roleResult] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
  ]);

  const role = roleResult.data?.role ?? 'user';
  return {
    id: user.id,
    email: user.email,
    fullName: profileResult.data?.full_name || '',
    avatarUrl: profileResult.data?.avatar_url ?? null,
    role,
    isAdmin: role === 'admin',
  };
}
