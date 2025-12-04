// src/config.js
export const config = {
  // Production URLs
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'https://campus-collaboration.onrender.com/api',
    timeout: 10000,
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
  }
};

// Helper functions
export const getApiUrl = () => config.api.baseURL;
export const getSocketUrl = () => config.socket.url;