import { useState, useEffect } from 'react';
import api from '../services/api'; 
import toast from 'react-hot-toast'; 
import { useTheme } from '../context/ThemeContext'; // Yol değişti (üst klasöre çıkıldı)
import Navbar from '../components/Navbar';
import SidebarForm from '../components/SidebarForm';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import SessionTimeoutHandler from '../components/SessionTimeoutHandler';

export default function AdminDashboard() {
  const { darkMode, theme } = useTheme(); 
  const { logout } = useAuth(); 
  
  // --- STATE'LER ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [dynamicAttributes, setDynamicAttributes] = useState([]);

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');

  const [activeTab, setActiveTab] = useState('product'); 
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newAttributeNames, setNewAttributeNames] = useState(['', '']); 

  const initPage = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'), 
        api.get('/products/categories')
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        toast.error("Oturum süreniz dolmuş veya geçersiz! 🔑");
      } else {
        setError("API bağlantısı kurulamadı.");
        toast.error("Merkez API sunucusuna bağlanılamadı! 🔌");
      }
    }
  };

  useEffect(() => {
    initPage();
  }, []);

  // --- BURAYA SENİN APPMİZDEKİ TÜM HANDLER FONKSİYONLARINI KOYUYORSUN ---
  // (handleCategoryChange, handleProductSubmit, handleProductDelete vb. kodlarının tamamı aynen burada duracak)
  const handleCategoryChange = async (categoryId) => { /* senin kodların */ };
  const handleDynamicAttributeValueChange = (index, value) => { /* senin kodların */ };
  const handleProductEditClick = (product) => { /* senin kodların */ };
  const handleCancelEdit = () => { /* senin kodların */ };
  const handleProductSubmit = (e) => { /* senin kodların */ };
  const handleAddAttributeField = () => { /* senin kodların */ };
  const handleAttributeFieldNameChange = (index, value) => { /* senin kodların */ };
  const handleRemoveAttributeField = (index) => { /* senin kodların */ };
  const handleCategorySubmit = (e) => { /* senin kodların */ };
  const handleProductDelete = (id, name) => { /* senin kodların */ };
  const handleCategoryDelete = (id, name) => { /* senin kodların */ };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategoryId === '' || product.categoryId === parseInt(filterCategoryId);
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#4f46e5', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>🚀 Sistem Entegre Ediliyor...</div>;

  return (
    <SessionTimeoutHandler>
      <div style={{ fontFamily: '"Inter", "Segoe UI", sans-serif', minHeight: '100vh', backgroundColor: theme.bodyBg, color: theme.textMain, transition: 'all 0.3s ease', boxSizing: 'border-box' }}>
        <style>{`
          #root { max-width: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
          body { margin: 0; padding: 0; }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: ${darkMode ? '#475569' : '#cbd5e1'}; border-radius: 4px; }
        `}</style>

        <Navbar />

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '30px', padding: '30px 40px', width: '100%', boxSizing: 'border-box' }}>
          <SidebarForm 
            activeTab={activeTab} setActiveTab={setActiveTab} editingProductId={editingProductId}
            selectedCategoryId={selectedCategoryId} handleCategoryChange={handleCategoryChange}
            categories={categories} productName={productName} setProductName={setProductName}
            description={description} setDescription={setDescription} price={price} setPrice={setPrice}
            stockQuantity={stockQuantity} setStockQuantity={setStockQuantity} dynamicAttributes={dynamicAttributes}
            handleDynamicAttributeValueChange={handleDynamicAttributeValueChange} formLoading={formLoading}
            handleProductSubmit={handleProductSubmit} handleCancelEdit={handleCancelEdit} newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName} handleAddAttributeField={handleAddAttributeField}
            newAttributeNames={newAttributeNames} handleAttributeFieldNameChange={handleAttributeFieldNameChange}
            handleRemoveAttributeField={handleRemoveAttributeField} handleCategorySubmit={handleCategorySubmit}
            handleCategoryDelete={handleCategoryDelete}
          />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: theme.textMain }}>📦 Aktif Donanım Havuzu</h3>
            </div>

            {/* Arama ve Filtreleme Barları */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', backgroundColor: theme.cardBg, padding: '15px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="🔍 Ürün adı veya sistem notlarında ara..." style={{ flex: 3, padding: '12px 15px', borderRadius: '8px', backgroundColor: theme.bodyBg, border: `1px solid ${theme.border}`, color: theme.textMain }} />
              <select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: theme.bodyBg, border: `1px solid ${theme.border}`, color: theme.textMain }}>
                <option value="">🌐 Tüm Kategoriler</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>📂 {cat.categoryName}</option>)}
              </select>
            </div>

            {/* Ürün Kartları Listesi */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} editingProductId={editingProductId} handleProductEditClick={handleProductEditClick} handleProductDelete={handleProductDelete} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SessionTimeoutHandler>
  );
}