import { useTheme } from '../context/ThemeContext'; 
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { darkMode, setDarkMode, theme } = useTheme();
  // user nesnesini de çektik, böylece giriş yapanın adını gösterebileceğiz
  const { logout, user } = useAuth(); 

  return (
    <div style={{ backgroundColor: theme.navbarBg, padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '32px' }}>💡</span>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: theme.brandText, letterSpacing: '-0.5px' }}>DecorLed</h1>
          <p style={{ margin: 0, fontSize: '11px', color: darkMode ? '#94a3b8' : '#e0e7ff' }}>Canlı Donanım Kataloğu ve Şablon Yönetimi</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Kullanıcı İsmi Göstergesi */}
        {user && (
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px' }}>
            👤 {user.username || 'Admin'}
          </span>
        )}

        {/* Çıkış Yap Butonu */}
        <button 
          onClick={logout} 
          style={{ 
            backgroundColor: 'transparent', 
            color: '#fff', 
            border: `1px solid rgba(255,255,255,0.4)`, 
            padding: '6px 12px', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Çıkış Yap 🚪
        </button>

        {/* Tema Değiştirme Butonu */}
        <button onClick={() => setDarkMode(!darkMode)} style={{ backgroundColor: darkMode ? '#f59e0b' : '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
          {darkMode ? '☀️ Gündüz' : '🌙 Gece'}
        </button>

        <div style={{ fontSize: '12px', backgroundColor: 'rgba(25, 232, 142, 0.2)', padding: '6px 14px', borderRadius: '30px', color: darkMode ? '#10b981' : '#ffffff', fontWeight: '700', border: '1px solid #10b981' }}>● API ÇEVRİMİÇİ</div>
      </div>
    </div>
  );
}