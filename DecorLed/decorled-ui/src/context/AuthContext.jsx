import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🛡️ Sayfa yenilendiğinde Token'ı Backend ile Doğrula
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const nextUser = {
          username: response.data.username || '',
          role: response.data.role || null
        };
        setUser(nextUser);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Token doğrulama başarısız:", err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();

    // 📡 Axios interceptor'dan gelen zorunlu çıkış sinyalini dinle
    const handleForceLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
    };

    window.addEventListener('auth-force-logout', handleForceLogout);
    return () => window.removeEventListener('auth-force-logout', handleForceLogout);
  }, []);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token, user: serverUser, role } = response.data;

    if (!token) {
      throw new Error('Token alınamadı.');
    }

    const authUser = serverUser || { username: credentials.username, role: role || null };

    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser(authUser);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}