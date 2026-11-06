import { supabase } from './supabase.js';
import { throwFriendly } from './errors.js';
import { refreshCurrentUser } from './auth.js';
import { removeAvatarFile, removeOldAvatarFiles, uploadAvatarFile } from './storage.js';

export const FULL_NAME_MAX_LENGTH = 100;

async function updateProfileColumns(userId, changes, message) {
  const { error } = await supabase.from('profiles').update(changes).eq('id', userId);
  if (error) throwFriendly(error, message);
}

/** Changes the display name and refreshes the current-user state (header etc.). */
export async function updateFullName(userId, fullName) {
  await updateProfileColumns(userId, { full_name: fullName }, 'Името не можа да бъде запазено.');
  await refreshCurrentUser();
}

/** Uploads a new avatar, saves its public URL and removes the previous image files. */
export async function changeAvatar(userId, file) {
  const { path, publicUrl } = await uploadAvatarFile(userId, file);
  try {
    await updateProfileColumns(userId, { avatar_url: publicUrl }, 'Снимката не можа да бъде запазена.');
  } catch (error) {
    await removeAvatarFile(path); // roll back: nothing references the new file
    throw error;
  }
  await removeOldAvatarFiles(userId, path);
  await refreshCurrentUser();
}

export async function removeAvatar(userId) {
  await updateProfileColumns(userId, { avatar_url: null }, 'Снимката не можа да бъде премахната.');
  await removeOldAvatarFiles(userId);
  await refreshCurrentUser();
}
