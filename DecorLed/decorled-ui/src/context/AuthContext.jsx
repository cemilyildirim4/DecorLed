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
        // Backend'deki /auth/me endpoint'ine istek atarak token'ı doğruluyoruz
        const response = await api.get('/auth/me');
        
        // Backend'den gelen kullanıcı bilgilerini state'e yazıyoruz
        setUser({ username: response.data.username });
        setIsAuthenticated(true);
      } catch (err) {
        // Eğer token süresi dolmuşsa veya geçersizse local'i temizle
        console.error("Token doğrulama başarısız:", err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        // İstek başarılı da olsa başarısız da olsa yükleme ekranını kapat
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token } = response.data;
    
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser({ username: credentials.username });

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