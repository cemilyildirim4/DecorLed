import React, { useEffect, useState } from 'react';
import { cartService, orderService } from '../services/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // 🔄 Sepet verilerini backend'den çeken fonksiyon
  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCartItems(data);
    } catch (error) {
      // Hatalar zaten api.js içindeki interceptor tarafından yakalanıp toast fırlatılıyor
      console.error("Sepet yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ❌ Sepetten tek ürün silme
  const handleRemoveItem = async (productId) => {
    try {
      await cartService.removeFromCart(productId);
      toast.success('Ürün sepetten kaldırıldı.');
      // State'i anlık güncelle (Arayüzden hemen düşsün)
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    } catch (error) {
      console.error(error);
    }
  };

  // 🧹 Sepeti tamamen boşaltma
  const handleClearCart = async () => {
    if (!window.confirm('Sepeti tamamen boşaltmak istediğinize emin misiniz?')) return;
    try {
      await cartService.clearCart();
      toast.success('Sepet temizlendi.');
      setCartItems([]);
    } catch (error) {
      console.error(error);
    }
  };

  // 📦 Siparişi Tamamla (Checkout) - Esas Sihirbaz
  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      
      // Backend'deki Transaction'lı checkout tetiklenir
      const response = await orderService.checkout();
      
      // Başarılı toast mesajı (Backend'den gelen pırıl pırıl mesaj)
      toast.success(response.message || 'Siparişiniz başarıyla alındı! 🎉');
      
      // Sipariş olunca sepet otomatik boşaldığı için UI state'ini de sıfırlıyoruz
      setCartItems([]);
      
    } catch (error) {
      console.error(error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // 💰 Toplam Sepet Tutarını Hesaplama
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Sepetiniz yükleniyor... 🛒</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Alışveriş Sepetim 🛒</h2>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>Sepetinizde henüz ürün bulunmuyor.</p>
          <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>Ürünleri İncele</a>
        </div>
      ) : (
        <div>
          {/* Sepet Listesi */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Ürün</th>
                <th>Adet</th>
                <th>Fiyat</th>
                <th>Toplam</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.productId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.imageUrl && <img src={item.imageUrl} alt={item.productName} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />}
                    <span>{item.productName}</span>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.price} TL</td>
                  <td>{item.price * item.quantity} TL</td>
                  <td>
                    <button 
                      onClick={() => handleRemoveItem(item.productId)}
                      style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Özet Alanı */}
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <button 
              onClick={handleClearCart}
              style={{ background: 'transparent', color: '#dc3545', border: '1px solid #dc3545', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Sepeti Boşalt
            </button>
            
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Genel Toplam: <span style={{ color: '#28a745' }}>{totalAmount} TL</span></h3>
              <button 
                onClick={handleCheckout}
                disabled={checkoutLoading}
                style={{ background: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: checkoutLoading ? 0.7 : 1 }}
              >
                {checkoutLoading ? 'Sipariş Alınıyor...' : 'Alışverişi Tamamla (Checkout)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;