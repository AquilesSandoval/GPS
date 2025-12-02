import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getRoles: () => api.get('/auth/roles'),
};

// Project services
export const projectService = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (uuid) => api.get(`/projects/${uuid}`),
  create: (data) => api.post('/projects', data),
  update: (uuid, data) => api.put(`/projects/${uuid}`, data),
  submit: (uuid) => api.post(`/projects/${uuid}/submit`),
  updateStatus: (uuid, statusId, reason) => api.put(`/projects/${uuid}/status`, { statusId, reason }),
  assignReviewer: (uuid, reviewerId, roleType) => api.post(`/projects/${uuid}/reviewers`, { reviewerId, roleType }),
  removeReviewer: (uuid, reviewerId) => api.delete(`/projects/${uuid}/reviewers/${reviewerId}`),
  addAuthor: (uuid, userId) => api.post(`/projects/${uuid}/authors`, { userId }),
  removeAuthor: (uuid, userId) => api.delete(`/projects/${uuid}/authors/${userId}`),
  getStatusHistory: (uuid) => api.get(`/projects/${uuid}/history`),
  getTypes: () => api.get('/projects/types'),
  getStatuses: () => api.get('/projects/statuses'),
  search: (params) => api.get('/projects/search', { params }),
};

// Document services
export const documentService = {
  getByProject: (projectUuid) => api.get(`/documents/project/${projectUuid}`),
  upload: (projectUuid, stageId, file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('stageId', stageId);
    return api.post(`/documents/project/${projectUuid}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  download: (uuid) => api.get(`/documents/${uuid}/download`, { responseType: 'blob' }),
  delete: (uuid) => api.delete(`/documents/${uuid}`),
  getStages: () => api.get('/documents/stages'),
};

// Comment services
export const commentService = {
  getByProject: (projectUuid, params) => api.get(`/comments/project/${projectUuid}`, { params }),
  create: (data) => api.post('/comments', data),
  update: (id, content) => api.put(`/comments/${id}`, { content }),
  delete: (id) => api.delete(`/comments/${id}`),
  resolve: (id) => api.post(`/comments/${id}/resolve`),
  unresolve: (id) => api.post(`/comments/${id}/unresolve`),
  reply: (id, content) => api.post(`/comments/${id}/reply`, { content }),
};

// Notification services
export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreference: (typeId, data) => api.put(`/notifications/preferences/${typeId}`, data),
};

// User services
export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (uuid) => api.get(`/users/${uuid}`),
  update: (uuid, data) => api.put(`/users/${uuid}`, data),
  toggleActive: (uuid) => api.put(`/users/${uuid}/toggle-active`),
  getTeachers: () => api.get('/users', { params: { roleId: 2, isActive: true } }),
};

export default api;
