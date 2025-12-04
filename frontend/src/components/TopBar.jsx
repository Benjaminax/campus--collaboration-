import React from 'react'
import { motion } from 'framer-motion'
import ThemeSwitcher from './ui/ThemeSwitcher'
import { useAuth } from '../contexts/AuthContext'

const TopBar = () => {
  const { user } = useAuth()

  return (
    <motion.div 
      className="h-14 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between px-6 sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left side - School Logo */}
      <motion.div 
        className="flex items-center space-x-3"
        whileHover={{ scale: 1.02 }}
      >
        <motion.img
          src={`${import.meta.env.BASE_URL}ACity Logo NW landscape.png`}
          alt="Academic City Logo"
          className="h-8 object-contain"
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.2 }
          }}
        />
        <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Campus Collab
        </span>
      </motion.div>

      {/* Right side - Theme switcher and user info */}
      <motion.div 
        className="flex items-center space-x-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {user && (
          <motion.div 
            className="text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Welcome, <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
          </motion.div>
        )}
        <ThemeSwitcher />
      </motion.div>
    </motion.div>
  )
}

export default TopBar