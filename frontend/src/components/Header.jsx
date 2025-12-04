import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  FolderIcon,
  ListBulletIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { Avatar } from './ui'
import ThemeSwitcher from './ui/ThemeSwitcher'
import api from '../services/api'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Tasks', href: '/tasks', icon: ListBulletIcon },
  { name: 'Team', href: '/team', icon: UserGroupIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const profileMenuRef = useRef()
  const location = useLocation()

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/counts')
      setUnreadCount(response.data?.unreadCount || 0)
    } catch (error) {
      console.error('Error fetching notification count:', error)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <motion.header 
      className="h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-3 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors touch-manipulation"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            )}
          </motion.button>

          {/* Logo and Brand */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.img 
              src={`${import.meta.env.BASE_URL}ACity Logo NW landscape.png`}
              alt="Academic City Logo"
              className="h-10 md:h-16 w-auto object-contain cursor-pointer"
              whileHover={{ 
                scale: 1.05,
                filter: "brightness(1.1)"
              }}
              transition={{ type: "spring", stiffness: 400 }}
              onClick={() => navigate('/dashboard')}
            />
            <motion.span 
              className="hidden sm:inline text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
            >
              Campus Collaboration Board
            </motion.span>
          </motion.div>

          {/* Search Bar - Hidden on mobile */}
          <motion.div 
            className="hidden md:flex flex-1 max-w-lg mx-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="relative group w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" />
              <motion.input
                type="text"
                placeholder="Search projects, tasks, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50/80 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 backdrop-blur-sm"
                whileFocus={{ scale: 1.02 }}
              />
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {/* Notifications */}
            <motion.button 
              className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/notifications')}
            >
              <motion.div whileHover={{ rotate: 10 }}>
                <BellIcon className="h-5 w-5" />
              </motion.div>
              {unreadCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs flex items-center justify-center text-white font-semibold shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  whileHover={{ scale: 1.2 }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Theme Switcher */}
            <div className="flex items-center justify-center">
              <ThemeSwitcher />
            </div>

            {/* User Menu */}
            <div className="relative" ref={profileMenuRef}>
              <motion.button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="h-8 w-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-md"
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 8px 25px -5px rgba(204, 54, 52, 0.3)"
                  }}
                >
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </motion.div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: showProfileMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </motion.div>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <UserCircleIcon className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    <hr className="my-2 border-gray-200/50 dark:border-gray-700/50" />
                    <motion.button
                      onClick={() => {
                        logout()
                        setShowProfileMenu(false)
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Sign out
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>


      </div>
    </motion.header>
  )
}

export default Header