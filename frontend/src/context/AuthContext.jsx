import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Mock users for demo — replace with real API calls
const DEMO_USERS = {
  buyer: {
    id: 'usr_buyer_001',
    name: 'Rajesh Kumar',
    email: 'rajesh@kumartrading.in',
    role: 'BUYER',
    company: 'Kumar Trading Co.',
    avatar: null,
  },
  seller: {
    id: 'usr_seller_001',
    name: 'Priya Sharma',
    email: 'priya@sharmafurniture.in',
    role: 'SELLER',
    company: 'Sharma Furniture Works',
    avatar: null,
  },
  admin: {
    id: 'usr_admin_001',
    name: 'Admin User',
    email: 'admin@settlex.in',
    role: 'ADMIN',
    company: 'SettleX Platform',
    avatar: null,
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedToken = localStorage.getItem('settlex_token');
    const storedUser = localStorage.getItem('settlex_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('settlex_token');
        localStorage.removeItem('settlex_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // TODO: Replace with real API call
    // POST /api/auth/login { email, password }
    // Returns { token, user }

    // Demo login logic
    let demoUser = null;
    if (email.includes('buyer') || email.includes('rajesh')) {
      demoUser = DEMO_USERS.buyer;
    } else if (email.includes('seller') || email.includes('priya')) {
      demoUser = DEMO_USERS.seller;
    } else if (email.includes('admin')) {
      demoUser = DEMO_USERS.admin;
    } else {
      // Default to buyer for demo
      demoUser = DEMO_USERS.buyer;
    }

    const demoToken = 'demo_jwt_' + Date.now();

    setUser(demoUser);
    setToken(demoToken);
    localStorage.setItem('settlex_token', demoToken);
    localStorage.setItem('settlex_user', JSON.stringify(demoUser));

    return demoUser;
  };

  const register = async (data) => {
    // TODO: Replace with real API call
    // POST /api/auth/register { name, email, password, role, company }
    const newUser = {
      id: 'usr_' + Date.now(),
      name: data.name,
      email: data.email,
      role: data.role || 'BUYER',
      company: data.company || '',
      avatar: null,
    };
    const demoToken = 'demo_jwt_' + Date.now();

    setUser(newUser);
    setToken(demoToken);
    localStorage.setItem('settlex_token', demoToken);
    localStorage.setItem('settlex_user', JSON.stringify(newUser));

    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('settlex_token');
    localStorage.removeItem('settlex_user');
  };

  const switchRole = (role) => {
    // Demo helper — switch between roles for hackathon demo
    const key = role.toLowerCase();
    if (DEMO_USERS[key]) {
      const demoUser = DEMO_USERS[key];
      setUser(demoUser);
      localStorage.setItem('settlex_user', JSON.stringify(demoUser));
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
