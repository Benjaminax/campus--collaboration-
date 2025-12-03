import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      // Let the auth context handle navigation
      console.log('401 error - token removed')
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}

export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar: (formData) => api.put('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteUser: (id) => api.delete(`/users/${id}`),
}

export const projectAPI = {
  getProjects: (params) => api.get('/projects', { params }),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  addMember: (id, userId) => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
  updateMemberRole: (id, userId, role) => api.put(`/projects/${id}/members/${userId}`, { role }),
}

export const taskAPI = {
  getTasks: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  getTask: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`),
  createTask: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  updateTask: (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  deleteTask: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
  assignTask: (projectId, taskId, userId) => api.post(`/projects/${projectId}/tasks/${taskId}/assign`, { userId }),
  updateTaskStatus: (projectId, taskId, status) => api.put(`/projects/${projectId}/tasks/${taskId}/status`, { status }),
}

export const commentAPI = {
  getComments: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}/comments`),
  createComment: (projectId, taskId, data) => api.post(`/projects/${projectId}/tasks/${taskId}/comments`, data),
  updateComment: (projectId, taskId, commentId, data) => api.put(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, data),
  deleteComment: (projectId, taskId, commentId) => api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`),
}

export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
}

export const activityAPI = {
  getActivities: (projectId, params) => api.get(`/projects/${projectId}/activities`, { params }),
  createActivity: (projectId, data) => api.post(`/projects/${projectId}/activities`, data),
}

export const analyticsAPI = {
  getDashboardAnalytics: (timeframe = 30) => api.get(`/analytics?timeframe=${timeframe}`),
  getProjectAnalytics: (projectId, timeframe = 30) => api.get(`/analytics/projects/${projectId}?timeframe=${timeframe}`),
  getActivityStats: (projectId, timeframe = 7) => api.get(`/activities/project/${projectId}/stats?timeframe=${timeframe}`),
  getTeamAnalytics: (timeframe = 30) => api.get(`/analytics/team?timeframe=${timeframe}`),
  getProductivityInsights: (timeframe = 30) => api.get(`/analytics/productivity?timeframe=${timeframe}`),
}

// Default export for convenience
export default api