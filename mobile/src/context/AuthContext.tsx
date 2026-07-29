import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Load persisted auth state on mount
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem('mobile_isLoggedIn');
        setIsLoggedIn(val === 'true');
      }
    } catch (e) {
      console.warn('LocalStorage not available in this React Native environment.');
    }
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mobile_isLoggedIn', 'true');
      }
    } catch (e) {}
  };

  const logout = () => {
    setIsLoggedIn(false);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mobile_isLoggedIn', 'false');
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
};
