// context/AdminContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('adminToken') !== null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const result = await adminService.login(credentials);
      setIsAuthenticated(true);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, isLoading, login }}>
      {children}
    </AdminContext.Provider>
  );
}