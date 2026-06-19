import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Boş alan kontrolü
    if (!username.trim() || !password.trim()) {
      setError('Lütfen kullanıcı adı ve şifre girin!');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      await login({ username, password });
      // Başarılı giriş - inputları temizle
      setUsername('');
      setPassword('');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      // Hata mesajını göster ama inputları temizleme
      const errorMsg = err.response?.data?.message || 'Kullanıcı adı veya şifre hatalı!';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.bodyBg }}>
      <form onSubmit={handleSubmit} style={{ backgroundColor: theme.cardBg, padding: '40px', borderRadius: '16px', border: `1px solid ${theme.border}`, width: '350px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: theme.textMain, textAlign: 'center', margin: '0 0 30px 0' }}>🔐 Admin Girişi</h2>
        
        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#991b1b', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '15px',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        <input 
          type="text" 
          placeholder="Kullanıcı Adı" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onFocus={() => setError('')}
          disabled={loading}
          autoComplete="username"
          style={{ 
            width: '100%', 
            padding: '10px', 
            marginBottom: '15px', 
            borderRadius: '8px', 
            border: `2px solid ${error ? '#dc2626' : theme.border}`,
            backgroundColor: theme.bodyBg,
            color: theme.textMain,
            boxSizing: 'border-box',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'text',
            opacity: loading ? 0.6 : 1,
            transition: 'border-color 0.2s ease'
          }} 
        />
        
        <input 
          type="password" 
          placeholder="Şifre" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setError('')}
          disabled={loading}
          autoComplete="current-password"
          style={{ 
            width: '100%', 
            padding: '10px', 
            marginBottom: '25px', 
            borderRadius: '8px', 
            border: `2px solid ${error ? '#dc2626' : theme.border}`,
            backgroundColor: theme.bodyBg,
            color: theme.textMain,
            boxSizing: 'border-box',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'text',
            opacity: loading ? 0.6 : 1,
            transition: 'border-color 0.2s ease'
          }} 
        />
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: loading ? '#999' : theme.accent, 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.8 : 1
          }}
        >
          {loading ? '⏳ Giriş Yapılıyor...' : 'GİRİŞ YAP'}
        </button>
      </form>
    </div>
  );
}