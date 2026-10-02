// -----------------------------------------------------------------------
// api/dashboard.js — dashboard data (backend: /api/dashboard/*).
// -----------------------------------------------------------------------
import { apiRequest } from './client.js';

/** Public homepage counters: { users } */
export async function getPublicStats() {
  return (await apiRequest('/dashboard/public', { auth: false })).stats;
}

/** Current user's account summary: { user, account } */
export function getMyDashboard() {
  return apiRequest('/dashboard/me');
}

/** Admin overview: { stats, signupsLast7Days, recentUsers } */
export function getAdminDashboard() {
  return apiRequest('/dashboard/admin');
}
