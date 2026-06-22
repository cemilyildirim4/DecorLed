import axios from 'axios';
import toast from 'react-hot-toast';

// Sonsuz redirect döngüsünü önlemek için flag
let isLoggedOut = false;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7074/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 🖼️ Merkezi Resim Yükleme Servisi
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.imageUrl;
};

// 🛒 Sepet Yönetimi Servisi (Hızlı Test İçin Eklendi)
export const cartService = {
  // Sepetteki ürünleri listeler
  getCart: async () => {
    const response = await api.get('/Cart');
    return response.data;
  },
  // Sepete ürün ekler veya miktarını artırır (productId, quantity)
  addToCart: async (productId, quantity) => {
    const response = await api.post('/Cart/add', { productId, quantity });
    return response.data;
  },
  // Sepetten tamamen ürün siler
  removeFromCart: async (productId) => {
    const response = await api.delete(`/Cart/${productId}`);
    return response.data;
  },
  // Sepeti tamamen boşaltır
  clearCart: async () => {
    const response = await api.delete('/Cart/clear');
    return response.data;
  }
};

// 📦 Sipariş Yönetimi Servisi
export const orderService = {
  // Alışverişi Tamamla / Sipariş Oluştur (Checkout)
  checkout: async () => {
    const response = await api.post('/Order/checkout');
    return response.data;
  },
  // Giriş yapmış kullanıcının geçmiş tüm siparişlerini getirir
  getMyOrders: async () => {
    const response = await api.get('/Order/my-orders');
    return response.data;
  },
  // Belirli bir siparişin içindeki ürün detaylarını getirir
  getOrderDetails: async (orderId) => {
    const response = await api.get(`/Order/${orderId}`);
    return response.data;
  }
};

// Request Interceptor: Her isteğin başına "Bearer Token" ekler
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Merkezi Hata Yönetimi Katmanı
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔒 401 Yetkisiz Erişim (Token süresi dolmuş veya hatalı)
    if (error.response?.status === 401) {
      if (error.config?.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (!isLoggedOut) {
        isLoggedOut = true;
        localStorage.removeItem('token');
        toast.error('Oturum süreniz doldu, lütfen tekrar giriş yapın.');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1500); // Kullanıcı mesajı okuyabilsin diye süre biraz esnetildi
      }
    } 
    // 🚫 403 Yetki Hatası (Admin alanına girmeye çalışan düz kullanıcı vb.)
    else if (error.response?.status === 403) {
      toast.error('Bu işlem için yetkiniz yok.');
    } 
    // ⚠️ 400 Kötü İstek (Örn: Sepet boşken sipariş vermeye çalışmak)
    else if (error.response?.status === 400) {
      toast.error(error.response?.data?.message || 'Hatalı veya geçersiz istek.');
    }
    // 🔥 500 Sunucu Hatası (Geliştirme aşamasında hayat kurtarır)
    else if (error.response?.status === 500) {
      const backendMessage = error.response?.data?.message;
      toast.error(backendMessage || 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    } 
    // 🌐 İnternet / Ağ Bağlantı Hatası
    else if (error.message === 'Network Error' && !isLoggedOut) {
      toast.error('Ağ bağlantısı kurulamadı. Lütfen API sunucunuzun açık olduğundan emin olun.');
    }
    
    return Promise.reject(error);
  }
);

export default api;