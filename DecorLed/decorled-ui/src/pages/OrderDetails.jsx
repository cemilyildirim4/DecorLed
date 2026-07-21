import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import { useTheme } from '../context/ThemeContext'; // 🔥 Tema desteği eklendi

const OrderDetails = () => {
  const { id } = useParams(); // URL'den sipariş ID'sini kapıyoruz (/siparis/3)
  const navigate = useNavigate();
  const { theme, darkMode } = useTheme(); // 🔥 Global tema değişkenleri

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const data = await orderService.getOrderDetails(id);
        setOrder(data);
      } catch (error) {
        console.error("Sipariş detayı yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: theme?.textMain, backgroundColor: theme?.bodyBg, minHeight: '100vh', fontSize: '18px', fontWeight: '600' }}>
        Sipariş detayları hazırlanıyor... 📄
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#dc3545', backgroundColor: theme?.bodyBg, minHeight: '100vh', fontSize: '18px', fontWeight: '600' }}>
        Sipariş bulunamadı!
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme?.bodyBg, minHeight: '100vh', padding: '40px 20px', transition: 'all 0.3s ease' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: theme?.cardBg, color: theme?.textMain, padding: '30px', borderRadius: '16px', boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)', border: `1px solid ${theme?.border || 'transparent'}` }}>
        
        <button 
          onClick={() => navigate('/siparislerim')} 
          style={{ background: 'transparent', border: 'none', color: theme?.accent || '#4f46e5', cursor: 'pointer', marginBottom: '20px', fontWeight: '700', fontSize: '14px', padding: 0 }}
        >
          ← Siparişlerime Geri Dön
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${theme?.border || '#f3f4f6'}`, paddingBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Sipariş Detayı <span style={{ color: theme?.accent || '#4f46e5' }}>#{order.id}</span></h3>
          <span style={{ color: darkMode ? '#94a3b8' : '#6b7280', fontSize: '14px' }}>
            {new Date(order.createdAt).toLocaleString('tr-TR')}
          </span>
        </div>

        {/* Sipariş Özet Kartı */}
        <div style={{ display: 'flex', gap: '40px', background: darkMode ? 'rgba(255,255,255,0.03)' : '#f9fafb', padding: '20px', borderRadius: '12px', margin: '20px 0', border: `1px solid ${theme?.border || 'transparent'}` }}>
          <div>
            <span style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#6b7280', fontWeight: '500' }}>Sipariş Durumu</span>
            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: order.status === 'Pending' ? '#d97706' : (darkMode ? '#fff' : '#111827') }}>
              {order.status === 'Pending' ? 'Beklemede (Onay Bekliyor)' : 
               order.status === 'Completed' ? 'Tamamlandı' : 
               order.status === 'Shipped' ? 'Kargoda' : order.status}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#6b7280', fontWeight: '500' }}>Toplam Ödenen</span>
            <p style={{ margin: '5px 0 0 0', fontWeight: '800', color: '#10b981', fontSize: '18px' }}>{order.totalAmount?.toLocaleString('tr-TR')} TL</p>
          </div>
        </div>

        {/* Alınan Ürünlerin Listesi */}
        <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>Satın Alınan Ürünler</h4>
        <div style={{ marginTop: '10px' }}>
          {order.items && order.items.length === 0 ? (
            <p style={{ color: darkMode ? '#64748b' : '#9ca3af', fontSize: '14px' }}>Bu siparişe ait ürün detayı bulunamadı.</p>
          ) : (
            order.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: `1px solid ${theme?.border || '#f3f4f6'}` }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: '700', fontSize: '15px' }}>{item.productName || `Ürün ID: ${item.productId}`}</p>
                  <span style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#6b7280' }}>{item.price?.toLocaleString('tr-TR')} TL × {item.quantity} Adet</span>
                </div>
                <span style={{ fontWeight: '800', color: theme?.textMain }}>{(item.price * item.quantity).toLocaleString('tr-TR')} TL</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;