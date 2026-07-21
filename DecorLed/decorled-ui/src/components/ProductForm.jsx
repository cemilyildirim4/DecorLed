import { useState } from 'react';
import api, { uploadImage } from '../services/api'; // 🌟 API instance'ını ve yeni servis fonksiyonumuzu import ettik
import toast from 'react-hot-toast';

export default function ProductForm() {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedImageUrl = '';

      // 🚀 TERTEMİZ KULLANIM: FormData detaylarıyla component boğulmuyor
      if (image) {
        uploadedImageUrl = await uploadImage(image); 
      }

      // Ürün verilerini hazırlayıp backend'e gönderiyoruz
      const productData = {
        productName,
        description: '',
        price: parseFloat(price),
        stockQuantity: 1,
        categoryId: 1,
        imageUrl: uploadedImageUrl,
        attributes: []
      };

      await api.post('/products', productData);
      toast.success('Ürün görseliyle birlikte başarıyla eklendi! 📦✨');
      
      // Temizlik
      setProductName('');
      setPrice('');
      setImage(null);
      setImagePreview('');

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Ürün eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // HTML form arayüzün (Önceki mesajdaki tasarımın aynısı burada kalabilir)
    <form onSubmit={handleSubmit} style={{ padding: '20px', maxWidth: '400px' }}>
      <input 
        type="text" 
        placeholder="Ürün Adı" 
        value={productName} 
        onChange={(e) => setProductName(e.target.value)} 
      />
      
      <div style={{ margin: '15px 0' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ürün Görseli</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        
        {imagePreview && (
          <img src={imagePreview} alt="Önizleme" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '10px', borderRadius: '8px' }} />
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
      </button>
    </form>
  );
}