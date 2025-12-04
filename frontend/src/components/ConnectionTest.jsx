// src/components/ConnectionTest.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import socketService from '../services/socketService';

export default function ConnectionTest() {
  const [backendStatus, setBackendStatus] = useState('Testing...');
  const [socketStatus, setSocketStatus] = useState('Disconnected');

  useEffect(() => {
    // Test backend API with debug endpoint since health might not work
    api.get('/debug')
      .then(response => {
        setBackendStatus(`✅ Connected: ${response.data.success ? 'API Working' : 'Debug endpoint reached'}`);
      })
      .catch(error => {
        // Try health endpoint as fallback
        api.get('/health')
          .then(response => {
            setBackendStatus(`✅ Connected: ${response.data.message || 'Server OK'}`);
          })
          .catch(error2 => {
            setBackendStatus(`❌ Error: ${error.response?.status ? `Status ${error.response.status}` : error.message}`);
          });
      });

    // Test Socket.IO
    socketService.connect();
    socketService.on('connect', () => {
      setSocketStatus('✅ Connected');
    });
    socketService.on('disconnect', () => {
      setSocketStatus('❌ Disconnected');
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Connection Status</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">Backend API:</span>
          <span className={backendStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
            {backendStatus}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">WebSocket:</span>
          <span className={socketStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
            {socketStatus}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">Backend URL:</span>
          <code className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
            https://campus-collaboration.onrender.com
          </code>
        </div>
      </div>
    </div>
  );
}