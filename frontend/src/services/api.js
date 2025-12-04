import axios from 'axios';
import { config } from '../config';

const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || 
                  sessionStorage.getItem('token') ||
                  document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log errors if we're online to reduce spam
    if (navigator.onLine) {
      // Enhanced error logging for debugging
      if (error.code === 'ECONNABORTED') {
        console.error('⏰ Request timeout - Server may be cold starting (this is normal for Render free tier)');
      } else if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        console.error('🌐 Network Error - Check your internet connection or server status');
      } else {
        console.error('API Error:', error.response?.data || error.message);
      }
    } else {
      // Silently handle network errors when offline
      console.log('📡 Request failed - Device is offline');
    }
    
    // Handle specific errors
    if (error.response?.status === 401) {
      // Clear auth and redirect
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar: (formData) => api.put('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const projectAPI = {
  getProjects: (params) => api.get('/projects', { params }),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  addMember: (id, userId) => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
  updateMemberRole: (id, userId, role) => api.put(`/projects/${id}/members/${userId}`, { role }),
};

export const taskAPI = {
  getTasks: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  getTask: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`),
  createTask: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  updateTask: (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  deleteTask: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
  assignTask: (projectId, taskId, userId) => api.post(`/projects/${projectId}/tasks/${taskId}/assign`, { userId }),
  updateTaskStatus: (projectId, taskId, status) => api.put(`/projects/${projectId}/tasks/${taskId}/status`, { status }),
};

export const commentAPI = {
  getComments: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}/comments`),
  createComment: (projectId, taskId, data) => api.post(`/projects/${projectId}/tasks/${taskId}/comments`, data),
  updateComment: (projectId, taskId, commentId, data) => api.put(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, data),
  deleteComment: (projectId, taskId, commentId) => api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`),
};

export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export const activityAPI = {
  getActivities: (projectId, params) => api.get(`/projects/${projectId}/activities`, { params }),
  createActivity: (projectId, data) => api.post(`/projects/${projectId}/activities`, data),
};

export const analyticsAPI = {
  getDashboardAnalytics: (timeframe = 30) => api.get(`/analytics?timeframe=${timeframe}`),
  getProjectAnalytics: (projectId, timeframe = 30) => api.get(`/analytics/projects/${projectId}?timeframe=${timeframe}`),
  getActivityStats: (projectId, timeframe = 7) => api.get(`/activities/project/${projectId}/stats?timeframe=${timeframe}`),
  getTeamAnalytics: (timeframe = 30) => api.get(`/analytics/team?timeframe=${timeframe}`),
  getProductivityInsights: (timeframe = 30) => api.get(`/analytics/productivity?timeframe=${timeframe}`),
};

export default api;