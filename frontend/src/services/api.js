import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  getMe: () => api.get('/auth/me'),
};

// ── Admin ─────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getStores: (params) => api.get('/admin/stores', { params }),
  getOwners: () => api.get('/admin/owners'),
  createUser: (data) => api.post('/admin/create-user', data),
  createStore: (data) => api.post('/admin/create-store', data),
};

// ── Normal User ───────────────────────────────────────
export const userAPI = {
  getStores: (params) => api.get('/user/stores', { params }),
  submitRating: (data) => api.post('/user/ratings', data),
  updateRating: (id, data) => api.put(`/user/ratings/${id}`, data),
};

// ── Store Owner ───────────────────────────────────────
export const ownerAPI = {
  getDashboard: () => api.get('/owner/dashboard'),
};

export default api;
