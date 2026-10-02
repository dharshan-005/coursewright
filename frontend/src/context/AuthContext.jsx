import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
  logoutUser as apiLogout,
  getCurrentUser,
  updateMyProfile,
  changeMyPassword,
} from '../api/auth';
import { getToken, setToken } from '../api/client';

// -----------------------------------------------------------------------
// AuthContext
//
// Real authentication backed by the Express API (backend/src/routes/authRoutes.js).
//
//  - login()/register() call the API, store the returned JWT in
//    localStorage, and keep the returned user in state.
//  - On page load, if a token is stored, it's verified with GET /auth/me
//    before any protected page renders (`initializing` is true meanwhile,
//    and RouteGuards waits for it).
//  - Any API call that comes back 401 fires "auth:unauthorized"
//    (see api/client.js) and this context logs the user out.
//
// The user's role comes from the server — the frontend can no longer pick it.
// -----------------------------------------------------------------------

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(() => Boolean(getToken()));

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // Restore the session from a stored token.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    getCurrentUser()
      .then(({ user: me }) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // Expired / revoked token anywhere in the app → sign out.
  useEffect(() => {
    window.addEventListener('auth:unauthorized', clearSession);
    return () => window.removeEventListener('auth:unauthorized', clearSession);
  }, [clearSession]);

  function startSession({ token, user: nextUser }) {
    setToken(token);
    setUser(nextUser);
    return nextUser;
  }

  async function login({ email, password }) {
    return startSession(await apiLogin({ email, password }));
  }

  async function register({ name, email, password, role = 'student' }) {
    return startSession(await apiRegister({ name, email, password, role }));
  }

  async function logout() {
    try {
      if (getToken()) await apiLogout();
    } catch {
      // Logging out should always succeed locally, even if the API is down.
    } finally {
      clearSession();
    }
  }

  /** Saves name/email/bio on the server and refreshes the session user. */
  async function updateProfile(changes) {
    const { user: updated } = await updateMyProfile(changes);
    setUser(updated);
    return updated;
  }

  /** Changes the password; the server returns a new token (old ones are revoked). */
  async function changePassword(passwords) {
    return startSession(await changeMyPassword(passwords));
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    initializing,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
