import axios from 'axios';

// Use VITE_API_URL when built on Render; fallback to localhost for dev
const raw = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const trimmed = raw.replace(/\/+$/, ''); // remove trailing slash
const base = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;

const api = axios.create({
  baseURL: base,
  withCredentials: true,
});

console.log('📡 Using API base URL →', api.defaults.baseURL);

export const PagesAPI = {
  list: () => api.get('/pages').then(r => r.data),
  create: (name: string) => api.post('/pages', { name }).then(r => r.data),
  delete: (id: string) => api.delete(`/pages/${id}`).then(r => r.data),
  getShapes: (pageId: string) => api.get(`/pages/${pageId}/shapes`).then(r => r.data),
  update: (id: string, patch: { name: string }) =>
    api.put(`/pages/${id}`, patch).then(r => r.data),
};

export const ShapesAPI = {
  create: (shape: any) => api.post('/shapes', shape).then(r => r.data),
  update: (id: string, patch: any) => api.put(`/shapes/${id}`, patch).then(r => r.data),
  delete: (id: string) => api.delete(`/shapes/${id}`).then(r => r.data),
};
