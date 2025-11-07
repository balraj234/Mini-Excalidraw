import axios from 'axios';

const base = import.meta.env.VITE_API_URL || 'https://mini-excalidraw-backend.onrender.com/api';
// const raw = import.meta.env.VITE_API_URL || 'http://localhost:4000';
// const trimmed = raw.replace(/\/+$/,'');    // remove trailing slash if any
// const base = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
const api = axios.create({ baseURL: base });

export const PagesAPI = {
  list: () => api.get('/api/pages').then(r => r.data),
  create: (name: string) => api.post('/api/pages', { name }).then(r => r.data),
  delete: (id: string) => api.delete(`/api/pages/${id}`).then(r => r.data),
  getShapes: (pageId: string) => api.get(`/api/pages/${pageId}/shapes`).then(r => r.data),

  // renaming or updating a page
  update: (id: string, patch: { name: string }) => 
    api.put(`/pages/${id}`, patch).then(r => r.data)
};

export const ShapesAPI = {
  create: (shape: any) => api.post('/shapes', shape).then(r => r.data),
  update: (id: string, patch: any) => api.put(`/shapes/${id}`, patch).then(r => r.data),
  delete: (id: string) => api.delete(`/shapes/${id}`).then(r => r.data)
};
