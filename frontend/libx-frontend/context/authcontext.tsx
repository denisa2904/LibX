import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuth: boolean;
  setAuthStatus: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);

  // Check local storage or cookies for an existing token on first load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuth(!!token);
  }, []);

  const setAuthStatus = (status: boolean) => {
    setIsAuth(status);
  };

  return (
    <AuthContext.Provider value={{ isAuth, setAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
