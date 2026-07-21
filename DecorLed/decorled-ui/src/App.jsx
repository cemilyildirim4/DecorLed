import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { useTheme } from './context/ThemeContext'; 
import { useAuth } from './context/AuthContext';
import { getUserRole } from './services/api'; // 👈 api dosyasından rol kontrol fonksiyonunu ekledik
import Login from './components/Login';
import Navbar from './components/Navbar';

// Sayfalarımız
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart'; 
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Register from './pages/Register';

// 🛡️ Normal Üye Güvenlik Duvarı
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#4f46e5', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
        🚀 Güvenlik Duvarı Kontrol Ediliyor...
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// 👑 Admin (Yönetici) Özel Güvenlik Duvarı
function AdminRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#4f46e5', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
        🚀 Yönetici Yetkileri Doğrulanıyor...
      </div>
    );
  }

  // AuthContext'ten veya JWT Token'dan gelen rol bilgisini kontrol ediyoruz
  const role = user?.role || getUserRole();
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
  const isAdmin = normalizedRole === 'admin';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kullanıcı üye fakat Admin değilse ana sayfaya yönlendir
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const { darkMode, theme } = useTheme(); 
  const { isAuthenticated, loading: authLoading } = useAuth(); 

  return (
    <Router>
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

      {authLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#4f46e5', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
          🚀 Sistem Entegre Ediliyor...
        </div>
      ) : (
        <>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
            {/* 👑 Admin Dashboard Artık AdminRoute İle Tam Güvenli */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />

            <Route path="/sepet" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />

            <Route path="/siparislerim" element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            } />

            <Route path="/siparis/:id" element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      )}
    </Router>
  );
}

export default App;