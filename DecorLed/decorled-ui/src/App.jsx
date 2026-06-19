import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { useTheme } from './context/ThemeContext'; 
import { useAuth } from './context/AuthContext';
import Login from './components/Login';

// Sayfalarımız
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';

// 🛡️ Özel Güvenlik Bileşeni: Giriş yapmayanları korumalı yollardan (Admin gibi) Login'e fırlatır
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#4f46e5', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>🚀 Güvenlik Duvarı Kontrol Ediliyor...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const { darkMode, theme } = useTheme(); 
  const { isAuthenticated, loading: authLoading } = useAuth(); 

  if (authLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#4f46e5', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>🚀 Sistem Entegre Ediliyor...</div>;

  return (
    <Router>
      {/* Global Toaster Bildirimleri */}
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            background: darkMode ? '#1e293b' : '#ffffff',
            color: theme?.textMain || '#000',
            fontWeight: '600',
            borderRadius: '10px'
          }
        }}
      />

      {/* 🧭 ROTA HARİTAMIZ */}
      <Routes>
        {/* 1. Herkese Açık Mağaza Vitrini */}
        <Route path="/" element={<Home />} />

        {/* 2. Login Sayfası (Eğer zaten giriş yapılmışsa direkt admin'e yönlendir) */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />} />

        {/* 3. Korunan Admin Paneli (Sadece giriş yapmış yetkili görebilir) */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* 4. Yanlış URL girilirse ana sayfaya fırlat */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;