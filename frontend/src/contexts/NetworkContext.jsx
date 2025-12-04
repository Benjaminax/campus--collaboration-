import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

const NetworkContext = createContext()

export const useNetwork = () => {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}

export const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState('unknown')

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('🌐 Back online!', {
        duration: 3000,
        position: 'bottom-center',
        id: 'network-status'
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.error('📡 You are offline', {
        duration: 5000,
        position: 'bottom-center',
        id: 'network-status'
      })
    }

    const handleConnectionChange = () => {
      if (navigator.connection) {
        setConnectionType(navigator.connection.effectiveType || 'unknown')
      }
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Monitor connection quality if available
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleConnectionChange)
      setConnectionType(navigator.connection.effectiveType || 'unknown')
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  const value = {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === 'slow-2g' || connectionType === '2g'
  }

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  )
}