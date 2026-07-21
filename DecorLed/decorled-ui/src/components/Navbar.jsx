import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; 
import { useAuth } from '../context/AuthContext';
import { cartService, getUserRole } from '../services/api'; // 👈 getUserRole fonksiyonu eklendi
import { Lightbulb, User, LogOut, Sun, Moon, Activity, ShoppingCart, Package, Store, Shield } from 'lucide-react'; // 👈 Shield ikonu eklendi

export default function Navbar() {
  const { darkMode, setDarkMode, theme } = useTheme();
  const { logout, user } = useAuth(); 
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  const transitionStyle = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
  const textMainColor = '#ffffff'; 
  const textMutedColor = darkMode ? '#94a3b8' : '#e0e7ff'; 
  const navbarBorderColor = 'rgba(255, 255, 255, 0.15)';

  // 🛡️ Kullanıcı Rolünü Tespit Et
  const role = user?.role || getUserRole();
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
  const isAdmin = normalizedRole === 'admin';

  const fetchCartCount = useCallback(async () => {
    if (!user) {
      setCartCount(0);
      return;
    }
    try {
      const cartItems = await cartService.getCart();
      if (Array.isArray(cartItems)) {
        setCartCount(cartItems.length);
      }
    } catch (error) {
      console.error("Sepet adedi güncellenirken hata oluştu (Oturum geçersiz olabilir):", error);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const loadCartCount = async () => {
      await fetchCartCount();
      if (!isMounted) return;
    };

    void loadCartCount();

    const handleCartUpdated = () => {
      void loadCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, [fetchCartCount]);
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
      <style>{`
        @keyframes apiPulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 8px rgba(16, 185, 129, 0.6); }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        .pulse-dot {
          animation: apiPulse 2s infinite ease-in-out;
        }
        .nav-menu-link {
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 20px;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-menu-link:hover {
          transform: translateY(-1px);
          background-color: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
        }
        /* 👑 Admin Paneli Butonuna Özel Dikkat Çekici Tema Stilleri */
        .admin-menu-link {
          background-color: rgba(245, 158, 11, 0.12) !important;
          border: 1px solid rgba(245, 158, 11, 0.3) !important;
          color: #f59e0b !important;
        }
        .admin-menu-link:hover {
          background-color: rgba(245, 158, 11, 0.22) !important;
          border-color: rgba(245, 158, 11, 0.5) !important;
          color: #fbbf24 !important;
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

      {/* 🧭 ORTA KISIM: Dinamik Navigasyon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/" className="nav-menu-link">
          <Store size={14} style={{ opacity: 0.9 }} />
          Vitrin
        </Link>

        {/* 👑 ADMİN BUTONU: Sadece Admin rolüne sahip giriş yapmış üyelere görünür */}
        {isAdmin && (
          <Link to="/admin" className="nav-menu-link admin-menu-link">
            <Shield size={14} style={{ opacity: 0.9 }} />
            Yönetim Paneli 🛠️
          </Link>
        )}

        {user && (
          <>
            <Link to="/siparislerim" className="nav-menu-link">
              <Package size={14} style={{ opacity: 0.9 }} />
              Siparişlerim
            </Link>

            <Link to="/sepet" className="nav-menu-link" style={{ position: 'relative', paddingRight: cartCount > 0 ? '34px' : '14px' }}>
              <ShoppingCart size={14} style={{ opacity: 0.9 }} />
              Sepetim
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  right: '8px',
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '1px 7px',
                  fontSize: '10px',
                  fontWeight: '800',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                  display: 'inline-block',
                  lineHeight: '14px'
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
          </>
        )}
      </div>

      {/* SAĞ KISIM: Kontroller & Profil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
            <span>{user.username || 'Kullanıcı'}</span>
          </div>
        )}

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

        {user && (
          <button 
            onClick={() => {
              logout();
              localStorage.removeItem('token');
              navigate('/login');
            }} 
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
        )}

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