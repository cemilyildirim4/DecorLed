import React, { useEffect, useState } from 'react';
import { orderService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error("Siparişler yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Durum belirteçlerine göre şık renkler atayalım
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return { background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' };
      case 'Completed': return { background: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' };
      case 'Shipped': return { background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' };
      default: return { background: '#f3f4f6', color: '#4b5563', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' };
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Sipariş geçmişiniz yükleniyor... 📦</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Sipariş Geçmişim 📦</h2>
      
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>Henüz hiç sipariş vermemişsiniz.</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left', background: '#f8f9fa' }}>
              <th style={{ padding: '12px' }}>Sipariş No</th>
              <th>Tarih</th>
              <th>Toplam Tutar</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>#{order.id}</td>
                <td>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                <td style={{ color: '#28a745', fontWeight: '600' }}>{order.totalAmount} TL</td>
                <td>
                  <span style={getStatusStyle(order.status)}>
                    {order.status === 'Pending' ? 'Beklemede' : order.status}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => navigate(`/siparis/${order.id}`)}
                    style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Detayları Gör
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyOrders;