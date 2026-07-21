import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function CustomerProductCard({ product }) {
  const { theme, darkMode } = useTheme();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // 🛒 Sepete Ekleme Sihirbazı
  const handleAddToCart = async () => {
    if (quantity < 1) {
      toast.error("En az 1 adet seçmelisiniz! ⚠️");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Sepete eklemek için giriş yapmanız gerekiyor.');
      navigate('/login');
      return;
    }

    const productId = Number(product.id ?? product.Id ?? product.productId ?? product.ProductId);
    if (!Number.isInteger(productId) || productId <= 0) {
      toast.error('Bu ürün için geçerli bir ürün kimliği bulunamadı.');
      return;
    }

    try {
      setAdding(true);
      await cartService.addToCart(productId, quantity);
      toast.success(`"${product.productName}" sepetinize eklendi! 🎉`);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Sepete eklenirken hata oluştu:", error);
      toast.error(error?.response?.data?.message || 'Sepete eklenirken bir hata oluştu.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{
      backgroundColor: theme.cardBg,
      color: theme.textMain,
      border: `1px solid ${theme.border}`,
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      height: '100%'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = darkMode ? '0 10px 30px rgba(0,0,0,0.6)' : '0 10px 30px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)';
    }}
    >
      {/* Ürün Görseli Bölümü */}
      <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: darkMode ? '#0f172a' : '#f1f5f9' }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8', fontSize: '40px' }}>🖼️</div>
        )}
        
        {/* Stok Durumu Rozeti */}
        <span style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: product.stockQuantity > 0 ? '#10b981' : '#ef4444',
          color: '#fff',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '700'
        }}>
          {product.stockQuantity > 0 ? `Stok: ${product.stockQuantity}` : 'Tükendi'}
        </span>
      </div>

      {/* Ürün Detayları */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800' }}>{product.productName}</h4>
        <p style={{ 
          margin: '0 0 15px 0', 
          fontSize: '14px', 
          color: darkMode ? '#94a3b8' : '#64748b',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minHeight: '40px'
        }}>
          {product.description || 'Bu donanım için özel teknik açıklama girilmemiştir.'}
        </p>

        {/* 🌟 Dinamik Teknik Şablon Nitelikleri (Müşteriye Özel Badgeler) */}
        {product.attributes && product.attributes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
            {product.attributes.map((attr, idx) => (
              <span key={idx} style={{
                backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                color: theme.textMain,
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: '600'
              }}>
                ⚙️ {attr.attributeName}: <strong>{attr.attributeValue}</strong>
              </span>
            ))}
          </div>
        )}

        {/* Fiyat ve Satın Alma Alanı */}
        <div style={{ marginTop: 'auto', borderTop: `1px solid ${theme.border}`, paddingTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '500' }}>Fiyat</span>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#10b981' }}>
              {product.price.toLocaleString('tr-TR')} TL
            </span>
          </div>

          {/* Adet Kontrolü ve Sepet Butonu */}
          {product.stockQuantity > 0 ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                min="1" 
                max={product.stockQuantity}
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '65px',
                  padding: '10px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.bodyBg,
                  color: theme.textMain,
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: '15px'
                }}
              />
              <button
                onClick={handleAddToCart}
                disabled={adding}
                style={{
                  flex: 1,
                  backgroundColor: theme.accent || '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: adding ? 0.7 : 1
                }}
              >
                {adding ? 'Ekleniyor...' : '🛒 Sepete Ekle'}
              </button>
            </div>
          ) : (
            <button disabled style={{
              width: '100%',
              backgroundColor: '#6b7280',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: 'not-allowed'
            }}>
              🚫 Stok Dışı / Talep Bırakın
            </button>
          )}
        </div>
      </div>
    </div>
  );
}