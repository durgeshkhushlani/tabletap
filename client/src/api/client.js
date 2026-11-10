import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tabletap_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A rejected token (expired or user deleted) means the session is over: clear it and go to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const onAuthRoute = err.config?.url?.startsWith('/auth/login') || err.config?.url?.startsWith('/auth/register');
    if (err.response?.status === 401 && !onAuthRoute && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('tabletap_token');
      window.location.assign('/admin/login');
    }
    return Promise.reject(err);
  }
);

export default api;
