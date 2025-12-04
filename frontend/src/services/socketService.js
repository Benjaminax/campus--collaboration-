// src/services/socketService.js
import { io } from 'socket.io-client';
import { config } from '../config';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token = null) {
    if (this.socket?.connected) return;

    const options = {
      ...config.socket.options,
      auth: token ? { token } : undefined
    };

    this.socket = io(config.socket.url, options);

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();