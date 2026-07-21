import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SessionTimeoutHandler({ children }) {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60); 

  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 Dakika hareketsizlik sınırı
  
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

// Süre bittiğinde veya çıkışa basıldığında:
  const handleSessionLogout = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    logout();
  }, [logout]);

  const resetTimer = useCallback(() => {
    if (showWarning) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, INACTIVITY_LIMIT);
  }, [showWarning]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    resetTimer();

    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    if (!showWarning) {
      return undefined;
    }

    const countdownTimer = window.setTimeout(() => {
      setCountdown(60);
    }, 0);

    countdownRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.clearInterval(countdownRef.current);
          handleSessionLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearTimeout(countdownTimer);
      if (countdownRef.current) window.clearInterval(countdownRef.current);
    };
  }, [handleSessionLogout, showWarning]);

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    resetTimer();
  };

  return (
    <>
      {children}

      {showWarning && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`,
            padding: '30px', borderRadius: '16px', width: '400px', textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <span style={{ fontSize: '50px' }}>⏳</span>
            <h3 style={{ color: theme.textMain, margin: '15px 0 10px 0', fontWeight: '800' }}>
              Oturumunuz Kapatılıyor!
            </h3>
            <p style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '25px', lineHeight: '1.5' }}>
              Uzun süredir herhangi bir işlem yapmadınız. Güvenliğiniz için <strong style={{ color: theme.accent }}>{countdown}</strong> saniye içinde çıkış yapılacak.
            </p>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={handleSessionLogout} // 🚨 DEĞİŞİKLİK: Butona tıklandığında güvenli çıkışı çağırıyoruz
                style={{ backgroundColor: 'transparent', color: theme.textMain, border: `1px solid ${theme.border}`, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', flex: 1 }}
              >
                Çıkış Yap 🚪
              </button>
              <button 
                onClick={handleStayLoggedIn}
                style={{ backgroundColor: theme.accent, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', flex: 1, boxShadow: `0 4px 12px ${theme.accent}40` }}
              >
                Oturumu Uzat ⚡
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}