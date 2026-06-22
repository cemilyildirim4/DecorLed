import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) { // <-- Burası export olmalı
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(() => ({
    bodyBg: darkMode ? '#0f172a' : '#f1f5f9',
    cardBg: darkMode ? '#1e293b' : '#ffffff',
    textMain: darkMode ? '#f8fafc' : '#0f172a',
    textMuted: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    inputBg: darkMode ? '#0f172a' : '#ffffff',
    navbarBg: darkMode ? '#1e293b' : '#4f46e5',
    brandText: darkMode ? '#38bdf8' : '#ffffff',
    accent: '#4f46e5',
    success: '#10b981',
    danger: '#ef4444'
  }), [darkMode]);

  useEffect(() => {
    document.body.style.backgroundColor = theme.bodyBg;
  }, [darkMode, theme.bodyBg]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// !!! EN ÖNEMLİ KISIM BURASI: Buraya 'export' eklemeyi unutmuş olabilirsin:
export function useTheme() { 
  return useContext(ThemeContext);
}