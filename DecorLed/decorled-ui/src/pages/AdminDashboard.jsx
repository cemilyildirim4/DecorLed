import { useState, useEffect, useCallback } from 'react';
import api, { uploadImage } from '../services/api'; 
import toast from 'react-hot-toast'; 
import { useTheme } from '../context/ThemeContext'; 
import SidebarForm from '../components/SidebarForm';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import SessionTimeoutHandler from '../components/SessionTimeoutHandler';
import Swal from 'sweetalert2';

export default function AdminDashboard() {
  const { darkMode, theme } = useTheme(); 
  const { logout } = useAuth(); 
  
  // --- STATE'LER ---
  const [selectedFile, setSelectedFile] = useState(null); 
  const [imagePreview, setImagePreview] = useState(null); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // --- 1. HANDLER: Formu ve Resimleri Sıfırlama ---
  const handleCancelEdit = () => {
    setEditingProductId(null);
    setProductName('');
    setDescription('');
    setPrice('');
    setStockQuantity('');
    setSelectedCategoryId('');
    setDynamicAttributes([]);
    setSelectedFile(null);
    setImagePreview(null);
    toast.dismiss();
  };

  // --- 2. HANDLER: Kategori Seçildiğinde API'den Dinamik Şablonu Çekme ---
  const handleCategoryChange = async (categoryId) => {
    setSelectedCategoryId(categoryId); 

    if (!categoryId) {
      setDynamicAttributes([]);
      return;
    }

    try {
      const res = await api.get(`/products/categories/${categoryId}/attributes`);
      const formattedAttributes = res.data.map(attr => ({
        attributeName: typeof attr === 'object' ? (attr.attributeName || attr.name) : attr,
        attributeValue: '' 
      }));
      setDynamicAttributes(formattedAttributes);
    } catch (err) {
      console.error("Dinamik şablon özellikleri merkezden çekilemedi:", err);
      toast.error("Kategori şablonu yüklenirken sunucu hatası oluştu! ❌");
    }
  };

  // --- 3. HANDLER: Ürün Ekleme ve Güncelleme ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !price || !stockQuantity || !selectedCategoryId) {
      toast.error("Lütfen zorunlu alanları doldurun! ⚠️");
      return;
    }

    setFormLoading(true);

    try {
      let uploadedImageUrl = '';
      
      if (editingProductId) {
        uploadedImageUrl = imagePreview ? imagePreview : '';
      }

      if (selectedFile) {
        uploadedImageUrl = await uploadImage(selectedFile); 
      }

      const filteredAttributes = dynamicAttributes.filter(attr => attr.attributeName.trim() !== '');

      const productData = {
        productName: productName,
        description: description,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity),
        categoryId: parseInt(selectedCategoryId),
        imageUrl: uploadedImageUrl, 
        attributes: filteredAttributes
      };

      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, productData);
        
        Swal.fire({
          title: 'Güncelleme Başarılı! ⚡',
          text: `"${productName}" konfigürasyonu başarıyla güncellendi.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: theme.cardBg,
          color: theme.textMain,
          iconColor: theme.accent || '#4f46e5'
        });

      } else {
        await api.post('/products', productData);
        
        Swal.fire({
          title: 'Envantere Enjekte Edildi! 🎉',
          text: `"${productName}" sisteme başarıyla eklendi.`,
          icon: 'success',
          timer: 2200,
          showConfirmButton: false,
          background: theme.cardBg,
          color: theme.textMain,
          iconColor: '#10b981'
        });
      }

      handleCancelEdit(); 
      initPage(); 

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        toast.error(err.response.data.message || err.response.data);
      } else {
        toast.error("İşlem sırasında bir hata oluştu. ❌");
      }
    } finally {
      setFormLoading(false);
    }
  };

  // --- 4. HANDLER: Düzenle Butonuna Tıklanınca Formu Doldurma ---
  const handleProductEditClick = (product) => {
    setEditingProductId(product.id);
    setProductName(product.productName);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setStockQuantity(product.stockQuantity.toString());
    setSelectedCategoryId(product.categoryId.toString());
    setDynamicAttributes(product.attributes || []);
    
    if (product.imageUrl) {
      setImagePreview(product.imageUrl);
    } else {
      setImagePreview(null);
    }
    setSelectedFile(null); 
  };

  // --- 5. HANDLER: Sayfa İlk Açıldığında Verileri Çekme ---
  const initPage = useCallback(async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/products/categories')
      ]);
      setProducts(productsRes.data);
      categoriesRes.data && setCategories(categoriesRes.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        toast.error("Oturum süreniz dolmuş veya geçersiz! 🔑");
      } else {
        toast.error("Merkez API sunucusuna bağlanılamadı! 🔌");
      }
    }
  }, [logout]);

  useEffect(() => {
    void initPage();
  }, [initPage]);

  // --- 6. HANDLER: Ürün Silme Fonksiyonu ---
  const handleProductDelete = (id, name) => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: `"${name}" isimli donanım envanterden tamamen imha edilecektir!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',  
      confirmButtonText: 'Evet, Envanterden Sil!',
      cancelButtonText: 'Vazgeç',
      background: theme.cardBg, 
      color: theme.textMain
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/products/${id}`);
          
          Swal.fire({
            title: 'İmha Edildi!',
            text: 'Donanım konfigürasyonu başarıyla silindi.',
            icon: 'success',
            confirmButtonColor: theme.accent
          });

          initPage(); 
        } catch (err) {
          console.error("Silme hatası:", err);
          Swal.fire(
            'Hata!',
            err.response?.data?.message || 'Ürün silinirken merkez sunucuda bir hata oluştu.',
            'error'
          );
        }
      }
    });
  };

  const handleDynamicAttributeValueChange = (index, value) => {
    const updated = [...dynamicAttributes];
    updated[index].attributeValue = value;
    setDynamicAttributes(updated);
  };
  
  const handleAddAttributeField = () => {
    setNewAttributeNames([...newAttributeNames, '']);
  };

  const handleAttributeFieldNameChange = (index, value) => {
    const updated = [...newAttributeNames];
    updated[index] = value;
    setNewAttributeNames(updated);
  };

  const handleRemoveAttributeField = (index) => {
    const updated = newAttributeNames.filter((_, i) => i !== index);
    setNewAttributeNames(updated);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Lütfen kategori adını boş bırakmayın! ⚠️");
      return;
    }

    const filteredAttributes = newAttributeNames.filter(name => name.trim() !== '');

    setFormLoading(true);
    try {
      const payload = {
        categoryName: newCategoryName,
        attributeNames: filteredAttributes
      };

      await api.post('/products/categories', payload);
      toast.success("Yeni teknik şablon başarıyla sisteme mühürlendi! 📂");
      
      setNewCategoryName('');
      setNewAttributeNames(['', '']);
      initPage(); 
    } catch (err) {
      console.error("Şablon kayıt hatası:", err);
      toast.error(err.response?.data?.message || "Şablon kaydedilirken sunucu hatası oluştu. ❌");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCategoryDelete = (id, name) => {
    Swal.fire({
      title: 'Kategoriyi Sil?',
      text: `"${name}" kategorisi ve bu kategoriye bağlı tüm teknik şablon mimarisi silinecektir!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'Vazgeç',
      background: theme.cardBg,
      color: theme.textMain
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/products/categories/${id}`);
          Swal.fire({
            title: 'Kaldırıldı!',
            text: 'Kategori mimarisi başarıyla silindi.',
            icon: 'success',
            confirmButtonColor: theme.accent
          });
          initPage(); 
        } catch (err) {
          console.error("Kategori silme hatası:", err);
          Swal.fire(
            'Hata!',
            err.response?.data?.message || 'Kategori silinirken merkez sunucuda bir hata oluştu.',
            'error'
          );
        }
      }
    });
  };

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

        {/* 🌟 ARTIK BURADA MANUEL NAVBAR YOK! GLOBAL NAVBAR YUKARIDA ÇALIŞIYOR */}

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '30px', padding: '30px 40px', width: '100%', boxSizing: 'border-box' }}>
          <SidebarForm 
            selectedFile={selectedFile} setSelectedFile={setSelectedFile}
            imagePreview={imagePreview} setImagePreview={setImagePreview}
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

            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', backgroundColor: theme.cardBg, padding: '15px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="🔍 Ürün adı veya sistem notlarında ara..." style={{ flex: 3, padding: '12px 15px', borderRadius: '8px', backgroundColor: theme.bodyBg, border: `1px solid ${theme.border}`, color: theme.textMain }} />
              <select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: theme.bodyBg, border: `1px solid ${theme.border}`, color: theme.textMain }}>
                <option value="">🌐 Tüm Kategoriler</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>📂 {cat.categoryName}</option>)}
              </select>
            </div>

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