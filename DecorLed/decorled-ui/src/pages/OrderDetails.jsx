import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';

const OrderDetails = () => {
  const { id } = useParams(); // URL'den sipariş ID'sini kapıyoruz (/siparis/3)
  const navigate = useNavigate();
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

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Sipariş detayları hazırlanıyor... 📄</div>;
  if (!order) return <div style={{ padding: '20px', textAlign: 'center', color: '#dc3545' }}>Sipariş bulunamadı!</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <button onClick={() => navigate('/siparislerim')} style={{ background: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', marginBottom: '20px', fontWeight: '600' }}>
        ← Siparişlerime Geri Dön
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px' }}>
        <h3>Sipariş Detayı <span style={{ color: '#4f46e5' }}>#{order.id}</span></h3>
        <span style={{ color: '#6b7280', fontSize: '14px' }}>
          {new Date(order.createdAt).toLocaleString('tr-TR')}
        </span> {/* 🔥 Hata buradaydı, span düzgün kapatıldı */}
      </div>

      {/* Sipariş Özet Kartı */}
      <div style={{ display: 'flex', gap: '40px', background: '#f9fafb', padding: '15px', borderRadius: '6px', margin: '20px 0' }}>
        <div>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Sipariş Durumu</span>
          <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: order.status === 'Pending' ? '#d97706' : '#111827' }}>
            {order.status === 'Pending' ? 'Beklemede (Onay Bekliyor)' : order.status}
          </p>
        </div>
        <div>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Toplam Ödenen</span>
          <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#28a745' }}>{order.totalAmount} TL</p>
        </div>
      </div>

      {/* Alınan Ürünlerin Listesi */}
      <h4>Satın Alınan Ürünler</h4>
      <div style={{ marginTop: '10px' }}>
        {order.items && order.items.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Bu siparişe ait ürün detayı bulunamadı.</p>
        ) : (
          order.items?.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <p style={{ margin: '0 0 5px 0', fontWeight: '600' }}>{item.productName || `Ürün ID: ${item.productId}`}</p>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>{item.price} TL × {item.quantity} Adet</span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#111827' }}>{item.price * item.quantity} TL</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderDetails;