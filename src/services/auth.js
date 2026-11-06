/**
 * Shared auth service: register / login / logout + the current user state
 * (session + profile + role), kept in sync with Supabase Auth state changes.
 */
import { supabase } from './supabase.js';

/** Maps Supabase Auth error codes to user-friendly Bulgarian messages. */
const AUTH_ERROR_MESSAGES = {
  invalid_credentials: 'Грешен имейл или парола.',
  user_already_exists: 'Вече има регистриран потребител с този имейл.',
  email_exists: 'Вече има регистриран потребител с този имейл.',
  email_not_confirmed: 'Имейлът още не е потвърден. Провери пощата си.',
  weak_password: 'Паролата е твърде слаба. Използвай поне 6 символа.',
  email_address_invalid: 'Този имейл адрес не е валиден.',
  over_email_send_rate_limit: 'Твърде много опити. Опитай отново след малко.',
  over_request_rate_limit: 'Твърде много опити. Опитай отново след малко.',
  validation_failed: 'Невалидни данни. Провери имейла и паролата.',
};

function toFriendlyError(error) {
  const friendly = new Error(AUTH_ERROR_MESSAGES[error?.code] ?? 'Възникна грешка. Опитай отново.');
  friendly.cause = error;
  return friendly;
}

// ---------------------------------------------------------------------------
// Current user state
// ---------------------------------------------------------------------------
let currentUser = null;
let initPromise = null;
let loadVersion = 0;
const listeners = new Set();

async function loadCurrentUser() {
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

function sameUser(a, b) {
  return a?.id === b?.id && a?.role === b?.role && a?.fullName === b?.fullName && a?.avatarUrl === b?.avatarUrl;
}

/**
 * Reloads the current user. Ignores stale results when several reloads overlap
 * (e.g. quick logout → login). Notifies listeners only when something changed.
 */
export async function refreshCurrentUser() {
  const version = ++loadVersion;
  let user = null;
  try {
    user = await loadCurrentUser();
  } catch (error) {
    console.error('Failed to load the current user', error);
  }
  if (version !== loadVersion) return currentUser;

  const changed = !sameUser(user, currentUser);
  currentUser = user;
  if (changed) listeners.forEach((listener) => listener(currentUser));
  return currentUser;
}

/**
 * Restores the session on page load and subscribes to Auth changes (other tabs, token expiry).
 * Resolves once the initial session is known — wait for it before checking route access.
 */
export function initAuth() {
  if (!initPromise) {
    initPromise = refreshCurrentUser().then((user) => {
      supabase.auth.onAuthStateChange((event) => {
        if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
        // Defer: Supabase recommends not awaiting other Supabase calls inside this callback.
        setTimeout(() => refreshCurrentUser(), 0);
      });
      return user;
    });
  }
  return initPromise;
}

/** @returns {null | { id: string, email: string, fullName: string, avatarUrl: string | null, role: 'user' | 'admin', isAdmin: boolean }} */
export function getUser() {
  return currentUser;
}

/** Subscribes to current-user changes. Returns an unsubscribe function. */
export function onUserChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

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
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });
  if (error) throw toFriendlyError(error);

  // With "Confirm email" enabled an existing address returns a user without identities.
  if (data.user && data.user.identities?.length === 0) {
    throw new Error(AUTH_ERROR_MESSAGES.user_already_exists);
  }
  if (data.session) await refreshCurrentUser();
  return { needsConfirmation: !data.session };
}

export async function login({ email, password }) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toFriendlyError(error);
  await refreshCurrentUser();
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw toFriendlyError(error);
  await refreshCurrentUser();
}
