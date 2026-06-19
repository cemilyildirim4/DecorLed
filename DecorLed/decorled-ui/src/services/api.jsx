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

// 🖼️ Merkezi Resim Yükleme Servisi (Düzeltildi)
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.imageUrl; // 🔥 EKSİK OLAN RETURN EKLENDİ
}; // 🔥 EKSİK OLAN SÜSLÜ PARANTEZ KAPATILDI

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (error.config?.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (!isLoggedOut) {
        isLoggedOut = true;
        localStorage.removeItem('token');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 300);
      }
    } else if (error.response?.status === 403) {
      toast.error('Bu işlem için yetkiniz yok.');
    } else if (error.response?.status === 500) {
      toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    } else if (error.message === 'Network Error' && !isLoggedOut) {
      toast.error('Ağ bağlantısı kurulamadı. Lütfen bağlantınızı kontrol edin.');
    }
    
    return Promise.reject(error);
  }
);

export default api;