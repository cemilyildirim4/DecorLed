import { useTheme } from '../context/ThemeContext'; 
import { useAuth } from '../context/AuthContext';
// 🌟 Lucide ikon kütüphanesini kullanmaya devam ediyoruz
import { Lightbulb, User, LogOut, Sun, Moon, Activity } from 'lucide-react';

export default function Navbar() {
  const { darkMode, setDarkMode, theme } = useTheme();
  const { logout, user } = useAuth(); 

  const transitionStyle = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';

  // 🎨 KONTRAST DÜZELTMESİ: Navbar arka planı hep koyu olduğu için 
  // yazıları ve ikonları her iki temada da güvenli/açık renklerde tutuyoruz.
  const textMainColor = '#ffffff'; 
  const textMutedColor = darkMode ? '#94a3b8' : '#e0e7ff'; // Orijinal alt başlık renklerin
  const navbarBorderColor = 'rgba(255, 255, 255, 0.15)';

  return (
    <div style={{ 
      backgroundColor: theme.navbarBg, 
      padding: '12px 40px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.15)',
      borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)'}`,
      position: 'relative',
      zIndex: 50,
      backdropFilter: 'blur(8px)'
    }}>
      {/* 🚀 Canlı Pulsing (Yanıp Sönen) API Noktası Animasyonu */}
      <style>{`
        @keyframes apiPulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 8px rgba(16, 185, 129, 0.6); }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        .pulse-dot {
          animation: apiPulse 2s infinite ease-in-out;
        }
      `}</style>

      {/* SOL KISIM: Logo & Marka */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '8px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* İkon rengi koyu arka planda parlasın diye sabitlendi */}
          <Lightbulb size={22} color="#f59e0b" />
        </div>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '800', 
            color: theme.brandText || textMainColor, 
            letterSpacing: '-0.5px'
          }}>
            DecorLed
          </h1>
          <p style={{ 
            margin: '1px 0 0 0', 
            fontSize: '11px', 
            fontWeight: '500',
            color: textMutedColor,
            letterSpacing: '0.1px'
          }}>
            Canlı Donanım Kataloğu ve Şablon Yönetimi
          </p>
        </div>
      </div>

      {/* SAĞ KISIM: Kontroller & Profil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        
        {/* Kullanıcı İsmi Göstergesi */}
        {user && (
          <div style={{ 
            color: textMainColor, 
            fontSize: '13px', 
            fontWeight: '600', 
            backgroundColor: 'rgba(255, 255, 255, 0.08)', 
            padding: '8px 14px', 
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <User size={15} style={{ opacity: 0.8 }} color={textMainColor} />
            <span>{user.username || 'Admin'}</span>
          </div>
        )}

        {/* Tema Değiştirme Butonu (Gözü yormayan net kontrast) */}
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          style={{ 
            backgroundColor: darkMode ? '#1e293b' : 'rgba(255, 255, 255, 0.15)', 
            color: darkMode ? '#f59e0b' : '#ffffff', 
            border: darkMode ? '1px solid #334155' : '1px solid rgba(255, 255, 255, 0.25)', 
            padding: '8px 14px', 
            borderRadius: '20px', 
            cursor: 'pointer', 
            fontWeight: '600', 
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: transitionStyle
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          {darkMode ? 'Gündüz' : 'Gece'}
        </button>

        {/* Çıkış Yap Butonu (Koyu arka planda net görünen beyaz çizgi, hover'da soft kırmızı) */}
        <button 
          onClick={logout} 
          style={{ 
            backgroundColor: 'transparent', 
            color: textMainColor, 
            border: `1px solid ${navbarBorderColor}`, 
            padding: '8px 14px', 
            borderRadius: '20px', 
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: transitionStyle
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            e.currentTarget.style.borderColor = '#ef4444';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = navbarBorderColor;
            e.currentTarget.style.color = textMainColor;
          }}
        >
          <LogOut size={14} />
          Çıkış Yap
        </button>

        {/* API Çevrimiçi Göstergesi */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px', 
          backgroundColor: 'rgba(16, 185, 129, 0.15)', 
          padding: '8px 14px', 
          borderRadius: '20px', 
          color: '#10b981', 
          fontWeight: '700', 
          letterSpacing: '0.3px',
          border: '1px solid rgba(16, 185, 129, 0.3)' 
        }}>
          <Activity size={12} className="pulse-dot" />
          API ÇEVRİMİÇİ
        </div>
        
      </div>
    </div>
  );
}