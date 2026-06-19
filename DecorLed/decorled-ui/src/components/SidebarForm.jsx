import { useTheme } from '../context/ThemeContext'; // Önemli: Klasör yolunu kendi yapına göre doğrula (örn: './ThemeContext' de olabilir)

export default function SidebarForm({
  activeTab,
  setActiveTab,
  editingProductId,
  selectedCategoryId,
  handleCategoryChange,
  categories,
  productName,
  setProductName,
  description,
  setDescription,
  price,
  setPrice,
  stockQuantity,
  setStockQuantity,
  dynamicAttributes,
  handleDynamicAttributeValueChange,
  formLoading,
  handleProductSubmit,
  handleCancelEdit,
  newCategoryName,
  setNewCategoryName,
  handleAddAttributeField,
  newAttributeNames,
  handleAttributeFieldNameChange,
  handleRemoveAttributeField,
  handleCategorySubmit,
  handleCategoryDelete
}) {
  // Tema verilerini ve karanlık mod durumunu merkezi Context uydusundan çekiyoruz
  const { darkMode, theme } = useTheme();

  return (
    <div style={{ boxSizing: 'border-box' }}>
      <div 
        className="custom-scrollbar"
        style={{ 
          backgroundColor: theme.cardBg, 
          padding: '25px', 
          borderRadius: '16px', 
          border: `1px solid ${theme.border}`, 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)', 
          position: 'sticky', 
          top: '30px',
          maxHeight: 'calc(100vh - 140px)',
          overflowY: 'auto',
          paddingRight: '18px'
        }}
      >
        {/* SEKME BUTONLARI */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: `2px solid ${theme.border}`, paddingBottom: '12px' }}>
          <button 
            onClick={() => setActiveTab('product')} 
            style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '11px', backgroundColor: activeTab === 'product' ? theme.accent : (darkMode ? '#334155' : '#e2e8f0'), color: activeTab === 'product' ? '#fff' : theme.textMain, transition: 'all 0.2s' }}
          >
            📦 ÜRÜN İŞLEMLERİ
          </button>
          <button 
            onClick={() => setActiveTab('category')} 
            style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '11px', backgroundColor: activeTab === 'category' ? '#0284c7' : (darkMode ? '#334155' : '#e2e8f0'), color: activeTab === 'category' ? '#fff' : theme.textMain, transition: 'all 0.2s' }}
          >
            ⚙️ YENİ ŞABLON AÇ
          </button>
        </div>

        {/* SEKME 1: ÜRÜN FORMU */}
        {activeTab === 'product' && (
          <form onSubmit={handleProductSubmit}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '800' }}>
              {editingProductId ? '✏️ Konfigürasyonu Düzenle' : '🚀 Donanım Enjeksiyonu'}
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase' }}>1. Sistem Kategorisi</label>
              <select value={selectedCategoryId} onChange={(e) => handleCategoryChange(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: theme.inputBg, border: `2px solid ${editingProductId ? '#f59e0b' : (darkMode ? '#475569' : '#4f46e5')}`, color: theme.textMain, fontWeight: '700' }}>
                <option value="">-- Kategori Seçimi Yapın --</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.categoryName}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase' }}>Donanım Donatım Adı</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.textMain, boxSizing: 'border-box' }} placeholder="Örn: RGB Akıllı Piksel Şerit"/>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase' }}>Sistem Notları / Mimari</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.textMain, height: '60px', boxSizing: 'border-box', resize: 'none' }} placeholder="Modül veya pin konfigürasyonları..."/>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase' }}>Fiyat (TL)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.success, fontWeight: '800', boxSizing: 'border-box' }}/>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase' }}>Stok Havuzu</label>
                <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.textMain, fontWeight: '800', boxSizing: 'border-box' }}/>
              </div>
            </div>

            {dynamicAttributes.length > 0 && (
              <div style={{ marginBottom: '20px', borderTop: `2px dashed ${theme.border}`, paddingTop: '15px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>⚙️ Donanım Spesifikasyonları</span>
                {dynamicAttributes.map((attr, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px', color: theme.textMain, marginBottom: '4px', fontWeight: '600' }}>{attr.attributeName}</label>
                    <input type="text" value={attr.attributeValue} onChange={(e) => handleDynamicAttributeValueChange(index, e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', backgroundColor: theme.bodyBg, border: `1px solid ${theme.border}`, color: '#0284c7', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}/>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button type="submit" disabled={formLoading} style={{ backgroundColor: theme.accent, color: '#fff', padding: '14px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase' }}>
                {formLoading ? "İşleniyor..." : (editingProductId ? '⚡ Güncellemeyi Kaydet' : '⚡ Envantere Gönder')}
              </button>
              {editingProductId && (
                <button type="button" onClick={handleCancelEdit} style={{ backgroundColor: 'transparent', color: theme.danger, padding: '10px', border: `1px solid ${theme.danger}`, borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Vazgeç / İptal Et</button>
              )}
            </div>
          </form>
        )}

        {/* SEKME 2: YENİ KATEGORİ & ŞABLON FORMU */}
        {activeTab === 'category' && (
          <div>
            <form onSubmit={handleCategorySubmit}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '800', color: '#0284c7' }}>⚙️ Kategori & Teknik Şablon Tanımlama</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase' }}>Kategori Adı</label>
                <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', backgroundColor: theme.inputBg, border: '2px solid #0284c7', color: theme.textMain, boxSizing: 'border-box' }} placeholder="Örn: LED Kontrol Kartı"/>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase' }}>Şablon Özellik Başlıkları</label>
                  <button type="button" onClick={handleAddAttributeField} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>+ Yeni Alan Ekle</button>
                </div>

                {newAttributeNames.map((name, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => handleAttributeFieldNameChange(index, e.target.value)} 
                      style={{ flex: 1, padding: '9px', borderRadius: '6px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.textMain, fontSize: '13px' }} 
                      placeholder={`Özellik ${index + 1} (Örn: Port Sayısı)`}
                    />
                    {newAttributeNames.length > 1 && (
                      <button type="button" onClick={() => handleRemoveAttributeField(index)} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: theme.danger, border: 'none', borderRadius: '6px', padding: '0 10px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              <button type="submit" disabled={formLoading} style={{ backgroundColor: '#0284c7', color: '#fff', padding: '14px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', width: '100%', fontSize: '14px', textTransform: 'uppercase', marginBottom: '10px' }}>
                {formLoading ? "Şablon Kaydediliyor..." : "💾 Şablonu Sisteme Mühürle"}
              </button>
            </form>

            {/* SİSTEMDEKİ MEVCUT KATEGORİLER VE SİLME ALANI */}
            <div style={{ marginTop: '25px', borderTop: `2px dashed ${theme.border}`, paddingTop: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800', color: theme.textMain, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📂 Sistemdeki Mevcut Kategoriler</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                {categories.length === 0 ? (
                  <span style={{ fontSize: '12px', color: theme.textMuted }}>Kayıtlı kategori bulunamadı.</span>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.bodyBg, padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: theme.textMain }}>{cat.categoryName}</span>
                      <button 
                        type="button" 
                        onClick={() => handleCategoryDelete(cat.id, cat.categoryName)} 
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: theme.danger, border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        Sil 🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}