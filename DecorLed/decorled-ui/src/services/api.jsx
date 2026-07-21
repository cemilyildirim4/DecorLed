import axios from 'axios';
import toast from 'react-hot-toast';

const configuredBaseUrl = (import.meta.env.VITE_API_URL || 'https://localhost:7074/api').replace(/\/+$/, '');
const normalizedBaseUrl = configuredBaseUrl.endsWith('/api') ? configuredBaseUrl : `${configuredBaseUrl}/api`;

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 🔑 Token'dan Rol Bilgisini Çözen Yardımcı Metot
export const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    // .NET ClaimsIdentity şemasında veya direkt "role" anahtarındaki değeri çeker
    return (
      decoded.role || 
      decoded["role"] || 
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
      null
    );
  } catch (e) {
    console.error("Rol okunurken hata oluştu:", e);
    return null;
  }
};

// 🖼 *Merkezi Resim Yükleme Servisi*
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

// 🏷 *Ürün Yönetimi Servisi*
export const productService = {
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  getProductDetails: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  }
};

// 🛒 *Sepet Yönetimi Servisi*
export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  addToCart: async (productId, quantity) => {
    const safeProductId = Number(productId);
    const safeQuantity = Number(quantity);

    if (!Number.isInteger(safeProductId) || safeProductId <= 0 || !Number.isInteger(safeQuantity) || safeQuantity <= 0) {
      throw new Error('Geçersiz ürün veya adet bilgisi.');
    }

    const response = await api.post('/cart/add', {
      productId: safeProductId,
      quantity: safeQuantity,
      ProductId: safeProductId,
      Quantity: safeQuantity
    });
    return response.data;
  },
  removeFromCart: async (productId) => {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  }
};

// 📦 *Sipariş Yönetimi Servisi*
export const orderService = {
  checkout: async () => {
    const response = await api.post('/order/checkout');
    return response.data;
  },
  getMyOrders: async () => {
    const response = await api.get('/order/my-orders');
    return response.data;
  },
  getOrderDetails: async (orderId) => {
    const response = await api.get(`/order/${orderId}`);
    return response.data;
  }
};

// Request Interceptor: Her isteğin başına "Bearer Token" ekler
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    config.headers.Authorization = undefined;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Merkezi Hata Yönetimi Katmanı
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/me');

    if (error.response?.status === 401) {
      if (isAuthRoute) {
        return Promise.reject(error);
      }

      const hasToken = !!localStorage.getItem('token');
      if (!hasToken) {
        toast.error('Bu işlem için giriş yapmanız gerekiyor.');
        window.dispatchEvent(new Event('auth-force-logout'));
        return Promise.reject(error);
      }

      localStorage.removeItem('token');
      toast.error('Oturum süreniz doldu, lütfen tekrar giriş yapın.');
      window.dispatchEvent(new Event('auth-force-logout'));
    } 
    else if (error.response?.status === 403) {
      toast.error('Bu işlem için yetkiniz yok.');
    } 
    else if (error.response?.status === 400) {
      toast.error(error.response?.data?.message || 'Hatalı veya geçersiz istek.');
    }
    else if (error.response?.status === 500) {
      toast.error(error.response?.data?.message || 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    } 
    else if (error.message === 'Network Error') {
      toast.error('Ağ bağlantısı kurulamadı. API sunucunuz kapalı olabilir.');
    }
    
    return Promise.reject(error);
  }
);

export default api;