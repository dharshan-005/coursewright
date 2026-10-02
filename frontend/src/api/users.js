// -----------------------------------------------------------------------
// api/users.js — admin user management (backend: /api/users/*, admin only).
// -----------------------------------------------------------------------
import { apiRequest } from './client.js';

/** Resolves to an array of users, newest first. */
export async function getAllUsers({ search = '', role = '' } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (role) params.set('role', role);
  const qs = params.toString();
  const data = await apiRequest(`/users${qs ? `?${qs}` : ''}`);
  return data.users;
}

/** @param {{ name, email, password, role }} data */
export async function createUser(data) {
  return (await apiRequest('/users', { method: 'POST', body: data })).user;
}

/** @param {string} userId @param {{ name?, email?, role?, isActive?, password? }} changes */
export async function updateUser(userId, changes) {
  return (await apiRequest(`/users/${userId}`, { method: 'PUT', body: changes })).user;
}

export function deleteUser(userId) {
  return apiRequest(`/users/${userId}`, { method: 'DELETE' });
}
