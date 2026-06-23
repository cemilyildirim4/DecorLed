import React, { useEffect, useState } from 'react';
import { cartService, orderService } from '../services/api';
import { useTheme } from '../context/ThemeContext'; // 🔥 Yeni Tema Desteği
import toast from 'react-hot-toast';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { theme, darkMode } = useTheme(); // 🔥 Global tema değişkenleri

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCartItems(data);
    } catch (error) {
      console.error("Sepet yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveItem = async (productId) => {
    try {
      await cartService.removeFromCart(productId);
      toast.success('Ürün sepetten kaldırıldı.');
      setCartItems(prev => prev.filter(item => item.productId !== productId));
      window.dispatchEvent(new Event('cartUpdated')); // Navbar rozetini de anlık düşürür
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Sepeti tamamen boşaltmak istediğinize emin misiniz?')) return;
    try {
      await cartService.clearCart();
      toast.success('Sepet temizlendi.');
      setCartItems([]);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      const response = await orderService.checkout();
      toast.success(response.message || 'Siparişiniz başarıyla alındı! 🎉');
      setCartItems([]);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error(error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: theme?.textMain, backgroundColor: theme?.bodyBg, minHeight: '100vh', fontSize: '18px', fontWeight: '600' }}>
        Sepetiniz yükleniyor... 🛒
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme?.bodyBg, color: theme?.textMain, minHeight: '100vh', padding: '40px 20px', transition: 'all 0.3s ease' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: theme?.cardBg, padding: '30px', borderRadius: '16px', boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)', border: `1px solid ${theme?.border || 'transparent'}` }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '800', borderBottom: `2px solid ${theme?.border || '#eee'}`, paddingBottom: '10px' }}>Alışveriş Sepetim 🛒</h2>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: '16px', color: darkMode ? '#94a3b8' : '#64748b' }}>Sepetinizde henüz ürün bulunmuyor.</p>
            <a href="/" style={{ color: theme?.accent || '#4f46e5', textDecoration: 'none', fontWeight: '700' }}>Ürünleri İncele →</a>
          </div>
        ) : (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${theme?.border || '#eee'}`, textAlign: 'left', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '14px' }}>
                  <th style={{ padding: '12px' }}>Ürün Bilgisi</th>
                  <th>Adet</th>
                  <th>Birim Fiyat</th>
                  <th>Toplam</th>
                  <th style={{ textAlign: 'center' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.productId} style={{ borderBottom: `1px solid ${theme?.border || '#eee'}`, fontSize: '15px' }}>
                    <td style={{ padding: '15px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.imageUrl && <img src={item.imageUrl} alt={item.productName} style={{ width: '55px', height: '55px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${theme?.border}` }} />}
                      <span style={{ fontWeight: '600' }}>{item.productName}</span>
                    </td>
                    <td style={{ fontWeight: '700' }}>{item.quantity}</td>
                    <td>{item.price.toLocaleString('tr-TR')} TL</td>
                    <td style={{ fontWeight: '700', color: theme?.accent || '#4f46e5' }}>{(item.price * item.quantity).toLocaleString('tr-TR')} TL</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleRemoveItem(item.productId)}
                        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'opacity 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Kaldır
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Özet ve Kontrol Alanı */}
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: darkMode ? 'rgba(255,255,255,0.03)' : '#f8f9fa', padding: '20px', borderRadius: '12px', border: `1px solid ${theme?.border}` }}>
              <button 
                onClick={handleClearCart}
                style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
              >
                Sepeti Boşalt
              </button>
              
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>Genel Toplam: <span style={{ color: '#10b981', fontSize: '22px', fontWeight: '800' }}>{totalAmount.toLocaleString('tr-TR')} TL</span></h3>
                <button 
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', opacity: checkoutLoading ? 0.7 : 1 }}
                >
                  {checkoutLoading ? 'Sipariş Alınıyor...' : 'Alışverişi Tamamla (Checkout) 🎉'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;