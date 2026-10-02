// -----------------------------------------------------------------------
// api/client.js
// Single fetch wrapper used by every real API module (auth, users,
// dashboard). It:
//   - prefixes requests with VITE_API_BASE_URL (default "/api", which the
//     Vite dev server proxies to the backend — see vite.config.js)
//   - attaches the JWT from localStorage as "Authorization: Bearer <token>"
//   - throws an Error carrying the server's message + status on failure
//   - broadcasts "auth:unauthorized" on a 401 so AuthContext can log out
// -----------------------------------------------------------------------

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
export const TOKEN_KEY = 'coursewright_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable (private mode) — session just won't survive a refresh.
  }
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response (e.g. proxy error page)
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    // No JSON body means the request never reached our API (backend down, or
    // another program answering on the proxied port).
    const fallback = !data
      ? `Can't reach the API (HTTP ${res.status}). Make sure the backend is running and connected to MongoDB.`
      : res.status >= 500
        ? 'Server error. Please try again.'
        : `Request failed (${res.status})`;
    throw new ApiError(data?.message || fallback, res.status, data?.errors);
  }
  return data;
}
