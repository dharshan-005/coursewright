// -----------------------------------------------------------------------
// api/auth.js — real authentication calls (backend: /api/auth/*).
// Every call that issues a token resolves to { token, user }.
// -----------------------------------------------------------------------
import { apiRequest } from './client.js';

/** @param {{ email: string, password: string }} data */
export function loginUser(data) {
  return apiRequest('/auth/login', { method: 'POST', body: data, auth: false });
}

/** @param {{ name: string, email: string, password: string, role?: string }} data */
export function registerUser(data) {
  return apiRequest('/auth/register', { method: 'POST', body: data, auth: false });
}

export function logoutUser() {
  return apiRequest('/auth/logout', { method: 'POST' });
}

/** Resolves to { user } for the token currently stored. */
export function getCurrentUser() {
  return apiRequest('/auth/me');
}

/** @param {{ name?: string, email?: string, bio?: string }} changes */
export function updateMyProfile(changes) {
  return apiRequest('/auth/me', { method: 'PUT', body: changes });
}

/** Resolves to a fresh { token, user } — old tokens stop working. */
export function changeMyPassword({ currentPassword, newPassword }) {
  return apiRequest('/auth/change-password', { method: 'PUT', body: { currentPassword, newPassword } });
}
