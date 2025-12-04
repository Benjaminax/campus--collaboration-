import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { useAuth } from '../contexts/AuthContext'

const Layout = () => {
  const { isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isAuthenticated) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-secondary-900/50">
      {/* Unified Sidebar - Responsive for both mobile and desktop */}
      <Sidebar 
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        onCollapseChange={setSidebarCollapsed}
      />
      
      {/* Main Content - Dynamic offset based on sidebar state */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${
        // On desktop: offset by sidebar width (collapsed or full)
        // On mobile: no offset (sidebar is overlay)
        'md:ml-64 lg:ml-64'
      }`}>
        <Header 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <main className="flex-1 p-4 md:p-6 transition-all duration-300">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout