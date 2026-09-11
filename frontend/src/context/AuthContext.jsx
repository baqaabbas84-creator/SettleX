import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * Normalizes user object across backend schema variations
 * (e.g. Mongoose _id vs id, businessName vs company)
 */
const normalizeUser = (userData) => {
  if (!userData || typeof userData !== 'object') return null;
  return {
    ...userData,
    id: userData.id || userData._id,
    company: userData.company || userData.businessName || '',
    businessName: userData.businessName || userData.company || '',
    role: userData.role || 'BUYER',
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('settlex_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user session on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('settlex_token');
      const storedUser = localStorage.getItem('settlex_user');

      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      // Populate cached user first to prevent UI flickering
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (isMounted) setUser(normalizeUser(parsed));
        } catch {
          localStorage.removeItem('settlex_user');
        }
      }

      // Verify token with backend: GET /api/auth/me
      try {
        const response = await authService.getMe();
        const verifiedUser = response?.data?.user || response?.data || response?.user;

        if (verifiedUser && typeof verifiedUser === 'object') {
          const normalized = normalizeUser(verifiedUser);
          if (isMounted) setUser(normalized);
          localStorage.setItem('settlex_user', JSON.stringify(normalized));
        }
      } catch (err) {
        // If token is invalid or expired (401/403), invalidate session
        if (err.status === 401 || err.status === 403) {
          localStorage.removeItem('settlex_token');
          localStorage.removeItem('settlex_user');
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Real backend login: POST /api/auth/login
   */
  const login = async (email, password) => {
    const response = await authService.login(email, password);

    // Extract token and user from backend response structure
    const receivedToken =
      response?.data?.token || response?.token || response?.accessToken;
    const rawUser =
      response?.data?.user ||
      response?.user ||
      (response?.data && typeof response.data === 'object' && !response.data.token ? response.data : null);

    const normalizedUser = normalizeUser(rawUser) || {
      email,
      name: email.split('@')[0],
      role: 'BUYER',
    };

    if (receivedToken) {
      setToken(receivedToken);
      localStorage.setItem('settlex_token', receivedToken);
    }

    setUser(normalizedUser);
    localStorage.setItem('settlex_user', JSON.stringify(normalizedUser));

    return normalizedUser;
  };

  /**
   * Real backend registration: POST /api/auth/register
   */
  const register = async (formData) => {
    const response = await authService.register(formData);

    let receivedToken =
      response?.data?.token || response?.token || response?.accessToken;
    let rawUser =
      response?.data?.user ||
      response?.user ||
      (response?.data && typeof response.data === 'object' && !response.data.token ? response.data : null);

    // If backend only creates user without returning JWT, attempt auto-login
    if (!receivedToken && formData.email && formData.password) {
      try {
        const loginRes = await authService.login(formData.email, formData.password);
        receivedToken =
          loginRes?.data?.token || loginRes?.token || loginRes?.accessToken;
        if (!rawUser) {
          rawUser =
            loginRes?.data?.user ||
            loginRes?.user ||
            (loginRes?.data && typeof loginRes.data === 'object' && !loginRes.data.token ? loginRes.data : null);
        }
      } catch {
        // Auto-login failed; user can still sign in manually
      }
    }

    const normalizedUser = normalizeUser(rawUser) || {
      name: formData.name,
      email: formData.email,
      role: formData.role || 'BUYER',
      company: formData.company || formData.businessName || '',
      businessName: formData.businessName || formData.company || '',
      phone: formData.phone || '',
    };

    if (receivedToken) {
      setToken(receivedToken);
      localStorage.setItem('settlex_token', receivedToken);
    }

    setUser(normalizedUser);
    localStorage.setItem('settlex_user', JSON.stringify(normalizedUser));

    return normalizedUser;
  };

  /**
   * Logout user and clear stored credentials
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('settlex_token');
      localStorage.removeItem('settlex_user');
    }
  };

  /**
   * Quick role switcher for testing / demo
   */
  const switchRole = (role) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem('settlex_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
