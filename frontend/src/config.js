// src/config.js
export const config = {
  // API Configuration - uses production URLs for GitHub Pages deployment
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'https://campus-collaboration.onrender.com/api',
    timeout: 30000, // Increased to 30 seconds for Render cold starts
  },
  socket: {
    url: import.meta.env.VITE_SOCKET_URL || 'https://campus-collaboration.onrender.com',
    options: {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    }
  },
  // GitHub Pages configuration
  isProduction: import.meta.env.PROD || window.location.hostname.includes('github.io')
};

// Helper functions
export const getApiUrl = () => config.api.baseURL;
export const getSocketUrl = () => config.socket.url;