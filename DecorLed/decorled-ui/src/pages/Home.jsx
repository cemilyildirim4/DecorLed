import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, cartService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const { theme, darkMode } = useTheme();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories] = useState(['Tümü', 'Elektronik', 'Moda', 'Ev & Yaşam', 'Aksesuar']);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [loading, setLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState(null);
  const apiBaseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://localhost:7074';

  // Kartlar için hover takibi (Inline style ile animasyon yapmak için)
  const [hoveredCardId, setHoveredCardId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts();
        const normalizedProducts = (data || []).map((product) => ({
          ...product,
          id: product.id ?? product.Id,
          name: product.name ?? product.productName ?? product.ProductName ?? product.title ?? product.Title,
          price: product.price ?? product.Price ?? 0,
          category: product.category ?? product.categoryName ?? product.CategoryName ?? 'Genel',
          imageUrl: product.imageUrl ?? product.image_url ?? product.ImageUrl ?? '',
          stockQuantity: product.stockQuantity ?? product.stockquantity ?? product.StockQuantity ?? 0,
          description: product.description ?? product.Description ?? ''
        }));
        setProducts(normalizedProducts);
        setFilteredProducts(normalizedProducts);
      } catch (error) {
        console.error("Ürünler yüklenirken hata oluştu:", error);
        // API henüz hazır değilse test etmek için sahte veriler (Fallback)
        const mockProducts = [
          { id: 1, name: 'Kablosuz ANC Kulaklık', price: 2499, category: 'Elektronik', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', isNew: true },
          { id: 2, name: 'Minimalist Kol Saati', price: 4199, category: 'Aksesuar', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', discount: '%15 İndirim' },
          { id: 3, name: 'Ergonomik Çalışma Koltuğu', price: 5850, category: 'Ev & Yaşam', imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500' },
          { id: 4, name: 'Oversize Pamuklu Kapüşonlu', price: 899, category: 'Moda', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500' },
          { id: 5, name: 'RGB Mekanik Klavye', price: 1750, category: 'Elektronik', imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500' },
          { id: 6, name: 'Paslanmaz Çelik Termos', price: 650, category: 'Ev & Yaşam', imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', isNew: true }
        ];
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Kategori değiştiğinde ürünleri filtrele
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category === 'Tümü') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === category));
    }
  };

  // Sepete Ürün Ekleme (Sepet rozetini tetikler)
  const handleAddToCart = async (e, product) => {
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Sepete eklemek için giriş yapmanız gerekiyor.');
      navigate('/login');
      return;
    }

    const productId = Number(product.id ?? product.Id ?? product.productId ?? product.ProductId);
    if (!Number.isInteger(productId) || productId <= 0) {
      toast.error('Bu ürünün sepete eklenmesi için geçerli bir ürün kimliği yok.');
      return;
    }

    try {
      setAddingProductId(productId);
      await cartService.addToCart(productId, 1);
      toast.success(`${product.name} sepete eklendi! 🛒`);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Sepete eklenirken bir hata oluştu.');
    } finally {
      setAddingProductId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: theme?.textMain, backgroundColor: theme?.bodyBg, minHeight: '100vh', fontSize: '20px', fontWeight: '600' }}>
        Harika ürünler sizin için listeleniyor... ✨
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme?.bodyBg, color: theme?.textMain, minHeight: '100vh', transition: 'all 0.3s ease', paddingBottom: '60px' }}>
      
      {/* 🚀 GÖSTERİŞLİ HERO BANNER ALANI */}
      <div style={{
        background: darkMode 
          ? 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' 
          : 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
        color: '#fff',
        padding: '80px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            YENİ SEZON FIRSATLARI
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: '900', margin: '20px 0 15px 0', letterSpacing: '-1px', lineHeight: '1.2' }}>
            Aradığın Her Şey, <br />Tek Bir Tıkla Kapında! ⚡
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 30px auto', fontWeight: '400' }}>
            En trend kıyafetlerden en son teknoloji ürünlerine kadar binlerce üründe geçerli büyük indirimi kaçırma.
          </p>
          <button 
            onClick={() => {
              const element = document.getElementById('vitrin');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ background: '#fff', color: '#4f46e5', border: 'none', padding: '14px 32px', borderRadius: '30px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Alışverişe Başla 🛍️
          </button>
        </div>
        {/* Arka plan süs halkası */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', top: '-50px', right: '-50px' }}></div>
        <div style={{ position: 'absolute', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', bottom: '-50px', left: '-50px' }}></div>
      </div>

      <div id="vitrin" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* 🏷️ KATEGORİ SEÇİCİ TABLAR */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                style={{
                  background: isActive ? (theme?.accent || '#4f46e5') : (theme?.cardBg),
                  color: isActive ? '#fff' : (theme?.textMain),
                  border: `1px solid ${isActive ? 'transparent' : (theme?.border || '#eee')}`,
                  padding: '10px 22px',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 🛍️ ÜRÜN VİTRİNİ (GRID) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
          gap: '30px' 
        }}>
          {filteredProducts.map((product) => {
            const isHovered = hoveredCardId === product.id;
            return (
              <div
                key={product.id}
                onClick={() => navigate(`/urun/${product.id}`)}
                onMouseEnter={() => setHoveredCardId(product.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                style={{
                  backgroundColor: theme?.cardBg,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: `1px solid ${theme?.border || 'transparent'}`,
                  boxShadow: isHovered 
                    ? (darkMode ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.08)')
                    : (darkMode ? '0 4px 15px rgba(0,0,0,0.2)' : '0 4px 15px rgba(0,0,0,0.03)'),
                  transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
              >
                {/* Rozetler (Yeni / İndirim) */}
                {product.isNew && (
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', zIndex: 3 }}>YENİ</span>
                )}
                {product.discount && (
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', zIndex: 3 }}>{product.discount}</span>
                )}

                {/* Ürün Görseli */}
                <div style={{ width: '100%', height: '240px', overflow: 'hidden', backgroundColor: '#f1f5f9', position: 'relative' }}>
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl.startsWith('http') ? product.imageUrl : `${apiBaseUrl}/${product.imageUrl.replace(/^\//, '')}`}
                      alt={product.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                        transition: 'transform 0.4s ease'
                      }} 
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontWeight: 700 }}>
                      Görsel yok
                    </div>
                  )}
                </div>

                {/* Ürün Bilgileri Bilgisi */}
                <div style={{ padding: '20px' }}>
                  <span style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {product.category}
                  </span>
                  <h3 style={{ margin: '5px 0 12px 0', fontSize: '16px', fontWeight: '700', height: '44px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>
                    {product.name}
                  </h3>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: theme?.accent || '#4f46e5' }}>
                      {product.price.toLocaleString('tr-TR')} TL
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={addingProductId === product.id}
                      style={{
                        background: isHovered ? '#10b981' : (darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                        color: isHovered ? '#fff' : (theme?.textMain),
                        border: 'none',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {addingProductId === product.id ? '...' : (isHovered ? 'Ekle 🛒' : '🛒')}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Home;