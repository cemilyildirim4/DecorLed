import { useTheme } from '../context/ThemeContext';

export default function ProductCard({ product, editingProductId, handleProductEditClick, handleProductDelete }) {
  const { darkMode, theme } = useTheme();

  // Backend url adresi. Eğer ortam değişkenlerinde yoksa fallback olarak local portu kullanırız
  const srvUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://localhost:7074';

  return (
    <div style={{ backgroundColor: theme.cardBg, border: editingProductId === product.id ? '2px solid #f59e0b' : `1px solid ${theme.border}`, borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      
      <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '6px', zIndex: 10 }}>
        <button onClick={() => handleProductEditClick(product)} style={{ backgroundColor: 'rgba(245, 158, 11, 0.9)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}>Düzenle ✏️</button>
        <button onClick={() => handleProductDelete(product.id, product.productName)} style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}>Sil 🗑️</button>
      </div>

      {/* 📸 GÖRSEL ÖNİZLEME ALANI: Eğer veritabanında görsel adresi varsa render edilir */}
      {product.imageUrl && (
        <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px', backgroundColor: '#f1f5f9' }}>
          <img src={`${srvUrl}${product.imageUrl}`} alt={product.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div>
        <h2 style={{ margin: '0 0 10px 0', color: theme.textMain, fontSize: '19px', fontWeight: '800', paddingRight: '140px', lineHeight: '1.3' }}>{product.productName}</h2>
        <p style={{ color: theme.textMuted, fontSize: '13px', margin: '0 0 20px 0', minHeight: '38px', lineHeight: '1.5' }}>{product.description || 'Bu donanım donatımı için açıklama girilmemiş.'}</p>
      </div>

      {product.attributes && product.attributes.length > 0 && (
        <div style={{ marginBottom: '20px', backgroundColor: theme.bodyBg, padding: '14px', borderRadius: '10px', borderLeft: '4px solid #0284c7' }}>
          <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none', fontSize: '13px' }}>
            {product.attributes.map(attr => (
              <li key={attr.id} style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${darkMode ? '#334155' : '#e2e8f0'}`, paddingBottom: '4px' }}>
                <span style={{ color: theme.textMuted, fontWeight: '500' }}>{attr.attributeName}</span>
                <span style={{ fontWeight: '700', color: '#0284c7' }}>{attr.attributeValue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '15px', borderTop: `1px solid ${theme.border}` }}>
        <span style={{ fontWeight: '900', fontSize: '22px', color: theme.success }}>{product.price.toLocaleString('tr-TR')} TL</span>
        <span style={{ fontSize: '12px', backgroundColor: product.stockQuantity > 10 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', padding: '6px 12px', borderRadius: '8px', color: product.stockQuantity > 10 ? theme.success : theme.danger, fontWeight: '800' }}>
          Stok: {product.stockQuantity} Pcs
        </span>
      </div>
    </div>
  );
}