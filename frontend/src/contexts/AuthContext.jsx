import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const response = await authService.getProfile();
          const profileData = response.data.data;
          const normalizedUser = {
            ...profileData,
            first_name: profileData.firstName || profileData.first_name,
            last_name: profileData.lastName || profileData.last_name,
            role_name: profileData.role || profileData.role_name,
          };
          setUser(normalizedUser);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token, user: userData } = response.data.data;
    const normalizedUser = {
      ...userData,
      first_name: userData.firstName || userData.first_name,
      last_name: userData.lastName || userData.last_name,
      role_name: userData.role || userData.role_name,
    };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    return normalizedUser;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    const { token, user: newUser } = response.data.data;
    const normalizedUser = {
      ...newUser,
      first_name: newUser.firstName || newUser.first_name,
      last_name: newUser.lastName || newUser.last_name,
      role_name: newUser.role || newUser.role_name,
    };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') {
      return user.role_name === roles;
    }
    return roles.includes(user.role_name);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isAuthenticated: !!user,
    isStudent: user?.role_name === 'estudiante',
    isTeacher: user?.role_name === 'docente',
    isCommittee: user?.role_name === 'comite',
    isLibrary: user?.role_name === 'biblioteca',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
