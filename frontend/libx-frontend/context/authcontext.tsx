// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { login as loginUser, register as registerUser, AuthData } from '@/api/auth'; 
// import { GetServerSideProps, NextPage } from 'next';
// import cookie from 'cookie';

// interface AuthContextType {
//   user: null | { username: string };
//   login: (userData: AuthData) => Promise<void>;
//   logout: () => void;
//   register: (userData: AuthData) => Promise<void>;
// }

// interface Props {
//     isAuth: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<null | { username: string }>(null);

//   const login = async (userData: AuthData) => {
//     try {
//       const response = await loginUser(userData);
//       // Assuming the username is part of the response for simplicity
//       setUser({ username: userData.username });
//       localStorage.setItem('authToken', response.token); // Store token
//     } catch (error) {
//       console.error('Failed to login:', error);
//       throw error;
//     }
//   };

//   const register = async (userData: AuthData) => {
//     try {
//       const response = await registerUser(userData);
//       setUser({ username: userData.username });
//       localStorage.setItem('authToken', response.token);
//     } catch (error) {
//       console.error('Failed to register:', error);
//       throw error;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('authToken');
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, register }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

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
