import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('tabletap_token'));

  const login = (newToken) => {
    localStorage.setItem('tabletap_token', newToken);
    setToken(newToken);
  };
  const logout = () => {
    localStorage.removeItem('tabletap_token');
    setToken(null);
  };

  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
