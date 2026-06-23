import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { useTheme } from './context/ThemeContext'; 
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Navbar from './components/Navbar'; // 🔥 YENİ: Premium üst menümüzü içeri aktardık

// Sayfalarımız
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart'; 
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';

// 🛡️ Özel Güvenlik Bileşeni: Giriş yapmayanları korumalı yollardan Login'e fırlatır
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

      {/* 🔥 GLOBAL ÜST MENÜ: Tüm sayfaların yukarısında canlı ve görünür kalması için burada */}
      <Navbar />

      {/* 🧭 ROTA HARİTAMIZ */}
      <Routes>
        {/* 1. Herkese Açık Mağaza Vitrini */}
        <Route path="/" element={<Home />} />

        {/* 2. Login Sayfası (Eğer zaten giriş yapılmışsa direkt admin'e yönlendir) */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />} />

        {/* 3. Korunan Admin Paneli */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* 4. 🛒 Korunan Sepet Sayfası */}
        <Route path="/sepet" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />

        {/* 5. 📦 Korunan Sipariş Geçmişi Sayfası */}
        <Route path="/siparislerim" element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        } />

        {/* 6. 📄 Korunan Sipariş Detay Sayfası */}
        <Route path="/siparis/:id" element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        } />

        {/* 7. Yanlış URL girilirse ana sayfaya fırlat */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;