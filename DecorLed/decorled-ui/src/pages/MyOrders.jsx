import { useEffect, useState } from 'react';
import { orderService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // 🔥 Tema desteği eklendi

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme, darkMode } = useTheme(); // 🔥 Global tema değişkenleri

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data || []);
      } catch (error) {
        console.error("Siparişler yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Senin yazdığın durum belirteç stilleri (Aynen korundu)
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return { background: '#fef3c7', color: '#d97706', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' };
      case 'Completed': return { background: '#dcfce7', color: '#15803d', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' };
      case 'Shipped': return { background: '#e0f2fe', color: '#0369a1', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' };
      default: return { background: '#f3f4f6', color: '#4b5563', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: theme?.textMain, backgroundColor: theme?.bodyBg, minHeight: '100vh', fontSize: '18px', fontWeight: '600' }}>
        Sipariş geçmişiniz yükleniyor... 📦
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme?.bodyBg, color: theme?.textMain, minHeight: '100vh', padding: '40px 20px', transition: 'all 0.3s ease' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: theme?.cardBg, padding: '30px', borderRadius: '16px', boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)', border: `1px solid ${theme?.border || 'transparent'}` }}>
        
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '800', borderBottom: `2px solid ${theme?.border || '#eee'}`, paddingBottom: '10px' }}>
          Sipariş Geçmişim 📦
        </h2>
        
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: '16px', color: darkMode ? '#94a3b8' : '#64748b' }}>Henüz hiç sipariş vermemişsiniz.</p>
            <a href="/" style={{ color: theme?.accent || '#4f46e5', textDecoration: 'none', fontWeight: '700', marginTop: '10px', display: 'inline-block' }}>Ürünleri İncele →</a>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${theme?.border || '#eee'}`, textAlign: 'left', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '14px' }}>
                  <th style={{ padding: '12px' }}>Sipariş No</th>
                  <th>Tarih</th>
                  <th>Toplam Tutar</th>
                  <th>Durum</th>
                  <th style={{ textAlign: 'center' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: `1px solid ${theme?.border || '#eee'}`, fontSize: '15px' }}>
                    <td style={{ padding: '15px 12px', fontWeight: 'bold', color: theme?.accent || '#4f46e5' }}>#{order.id}</td>
                    <td style={{ color: darkMode ? '#cbd5e1' : '#334155' }}>
                      {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td style={{ color: '#10b981', fontWeight: '700' }}>
                      {order.totalAmount?.toLocaleString('tr-TR')} TL
                    </td>
                    <td>
                      <span style={getStatusStyle(order.status)}>
                        {order.status === 'Pending' ? 'Beklemede' : 
                         order.status === 'Completed' ? 'Tamamlandı' : 
                         order.status === 'Shipped' ? 'Kargoda' : order.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => navigate(`/siparis/${order.id}`)}
                        style={{ 
                          background: theme?.accent || '#4f46e5', 
                          color: '#fff', 
                          border: 'none', 
                          padding: '8px 14px', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          fontWeight: '600',
                          fontSize: '13px',
                          transition: 'opacity 0.2s' 
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Detayları Gör
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;