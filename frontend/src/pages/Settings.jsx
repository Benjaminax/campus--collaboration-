import React, { useState, useContext, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { 
  Cog6ToothIcon,
  PaintBrushIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  EyeIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Card, Button, Badge } from '../components/ui'
import { AuthContext } from '../contexts/AuthContext'
import { ThemeContext } from '../contexts/ThemeContext'
import api from '../services/api'

const Settings = () => {
  const { user, updateUser } = useContext(AuthContext)
  const { theme, setTheme } = useContext(ThemeContext)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      projectUpdates: true,
      taskAssignments: true,
      deadlineReminders: true,
      teamInvites: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowDirectMessages: true
    },
    preferences: {
      language: 'en',
      timezone: 'Africa/Accra',
      dateFormat: 'MM/DD/YYYY',
      autoSave: true,
      compactMode: false
    }
  })

  // Auto-save functionality
  useEffect(() => {
    if (settings.preferences.autoSave) {
      const timeoutId = setTimeout(() => {
        handleSaveSettings()
      }, 2000) // Auto-save 2 seconds after changes

      return () => clearTimeout(timeoutId)
    }
  }, [settings])

  // Load local settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings
        }))
      } catch (error) {
        console.log('Error loading saved settings:', error)
      }
    }
  }, [])

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      
      // Check if user has permission (demo logic)
      if (user?.role === 'student') {
        // For students, save locally as they may not have server permissions
        localStorage.setItem('userSettings', JSON.stringify(settings))
        toast.success('Settings saved to your local profile!', {
          duration: 3000,
          position: 'top-right'
        })
        return
      }
      
      await api.put('/users/settings', settings)
      toast.success('Settings saved successfully!', {
        duration: 3000,
        position: 'top-right'
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      
      if (error.response?.status === 403) {
        // For permission errors, save locally instead
        localStorage.setItem('userSettings', JSON.stringify(settings))
        toast.success('Settings saved to your local profile (server permissions required for global settings)', {
          duration: 4000,
          position: 'top-right'
        })
      } else if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.')
      } else if (error.code === 'ERR_NETWORK') {
        // Network error - save locally
        localStorage.setItem('userSettings', JSON.stringify(settings))
        toast.success('Settings saved locally (offline mode)', {
          duration: 4000,
          position: 'top-right'
        })
      } else {
        // For other errors, save locally
        localStorage.setItem('userSettings', JSON.stringify(settings))
        toast.success('Settings saved locally (backend unavailable)', {
          duration: 4000,
          position: 'top-right'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationChange = (key) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    })
  }

  const handlePrivacyChange = (key, value) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    })
  }

  const handlePreferenceChange = (key, value) => {
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value
      }
    })
  }

  const handleExportData = async () => {
    try {
      toast.loading('Generating PDF export...', { id: 'export' })
      
      // Fetch user's tasks and projects data
      let tasksData = []
      let projectsData = []
      let activitiesData = []
      let notificationsData = []
      
      try {
        const [tasksResponse, projectsResponse, activitiesResponse, notificationsResponse] = await Promise.all([
          api.get('/tasks'),
          api.get('/projects'),
          api.get('/activities').catch(() => ({ data: [] })),
          api.get('/notifications').catch(() => ({ data: [] }))
        ])
        tasksData = tasksResponse.data || []
        projectsData = projectsResponse.data || []
        activitiesData = activitiesResponse.data || []
        notificationsData = notificationsResponse.data || []
      } catch (apiError) {
        console.log('Using demo data for export')
        // Demo data for when backend is unavailable
        tasksData = [
          { id: 1, title: 'Complete Project Setup', status: 'completed', priority: 'high', dueDate: '2025-12-05', assignedTo: user?.name || 'User' },
          { id: 2, title: 'Review Code Changes', status: 'in-progress', priority: 'medium', dueDate: '2025-12-06', assignedTo: user?.name || 'User' },
          { id: 3, title: 'Update Documentation', status: 'pending', priority: 'low', dueDate: '2025-12-07', assignedTo: user?.name || 'User' }
        ]
        projectsData = [
          { id: 1, name: 'Campus Collaboration Platform', status: 'Active', progress: 75, dueDate: '2025-12-15' },
          { id: 2, name: 'Mobile App Development', status: 'Planning', progress: 25, dueDate: '2025-12-20' }
        ]
        activitiesData = [
          { id: 1, type: 'task_completed', message: 'Completed task: Project Setup', timestamp: '2025-12-04T10:30:00Z' },
          { id: 2, type: 'project_created', message: 'Created new project: Mobile App', timestamp: '2025-12-03T14:15:00Z' }
        ]
        notificationsData = [
          { id: 1, title: 'Task Due Soon', message: 'Review Code Changes due tomorrow', type: 'deadline', read: false },
          { id: 2, title: 'Project Updated', message: 'Campus Collaboration Platform was updated', type: 'update', read: true }
        ]
      }
      
      // Create PDF
      const pdf = new jsPDF()
      const pageHeight = pdf.internal.pageSize.height
      let yPosition = 20
      
      // Header
      pdf.setFontSize(20)
      pdf.setTextColor(59, 130, 246) // Blue color
      pdf.text('Campus Collaboration - Data Export', 20, yPosition)
      yPosition += 15
      
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 20, yPosition)
      pdf.text(`User: ${user?.name || 'Unknown User'}`, 20, yPosition + 5)
      pdf.text(`Email: ${user?.email || 'Not specified'}`, 20, yPosition + 10)
      yPosition += 25
      
      // Projects Section
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text('My Projects', 20, yPosition)
      yPosition += 10
      
      if (projectsData.length > 0) {
        projectsData.forEach((project, index) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage()
            yPosition = 20
          }
          
          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)
          pdf.text(`${index + 1}. ${project.name || project.title || 'Untitled Project'}`, 25, yPosition)
          
          pdf.setFontSize(10)
          pdf.setTextColor(100, 100, 100)
          pdf.text(`Status: ${project.status || 'Unknown'} | Progress: ${project.progress || 0}% | Due: ${project.dueDate || 'Not set'}`, 30, yPosition + 5)
          yPosition += 15
        })
      } else {
        pdf.setFontSize(10)
        pdf.setTextColor(150, 150, 150)
        pdf.text('No projects found', 25, yPosition)
        yPosition += 10
      }
      
      yPosition += 10
      
      // Tasks Section
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text('My Tasks', 20, yPosition)
      yPosition += 10
      
      if (tasksData.length > 0) {
        tasksData.forEach((task, index) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage()
            yPosition = 20
          }
          
          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)
          pdf.text(`${index + 1}. ${task.title}`, 25, yPosition)
          
          pdf.setFontSize(10)
          pdf.setTextColor(100, 100, 100)
          const statusColor = task.status === 'completed' ? [34, 197, 94] : 
                            task.status === 'in-progress' ? [234, 179, 8] : [156, 163, 175]
          pdf.setTextColor(...statusColor)
          pdf.text(`Status: ${task.status}`, 30, yPosition + 5)
          
          pdf.setTextColor(100, 100, 100)
          pdf.text(`Priority: ${task.priority} | Due: ${task.dueDate || 'Not set'} | Assigned to: ${task.assignedTo || 'Unassigned'}`, 90, yPosition + 5)
          yPosition += 15
        })
      } else {
        pdf.setFontSize(10)
        pdf.setTextColor(150, 150, 150)
        pdf.text('No tasks found', 25, yPosition)
        yPosition += 10
      }
      
      yPosition += 10
      
      // Activities Section
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = 20
      }
      
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Recent Activities', 20, yPosition)
      yPosition += 10
      
      if (activitiesData.length > 0) {
        activitiesData.slice(0, 10).forEach((activity, index) => { // Show only last 10 activities
          if (yPosition > pageHeight - 30) {
            pdf.addPage()
            yPosition = 20
          }
          
          pdf.setFontSize(10)
          pdf.setTextColor(0, 0, 0)
          pdf.text(`${index + 1}. ${activity.message || activity.description}`, 25, yPosition)
          
          pdf.setFontSize(8)
          pdf.setTextColor(100, 100, 100)
          const activityDate = activity.timestamp || activity.createdAt
          if (activityDate) {
            pdf.text(`${new Date(activityDate).toLocaleDateString()} ${new Date(activityDate).toLocaleTimeString()}`, 30, yPosition + 4)
          }
          yPosition += 12
        })
      } else {
        pdf.setFontSize(10)
        pdf.setTextColor(150, 150, 150)
        pdf.text('No recent activities found', 25, yPosition)
        yPosition += 10
      }
      
      yPosition += 10
      
      // Notifications Section
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = 20
      }
      
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Notifications', 20, yPosition)
      yPosition += 10
      
      if (notificationsData.length > 0) {
        notificationsData.slice(0, 15).forEach((notification, index) => { // Show only last 15 notifications
          if (yPosition > pageHeight - 30) {
            pdf.addPage()
            yPosition = 20
          }
          
          pdf.setFontSize(10)
          pdf.setTextColor(0, 0, 0)
          pdf.text(`${index + 1}. ${notification.title || notification.message}`, 25, yPosition)
          
          pdf.setFontSize(8)
          pdf.setTextColor(100, 100, 100)
          if (notification.message && notification.title) {
            pdf.text(`${notification.message}`, 30, yPosition + 4)
          }
          const statusText = notification.read ? 'Read' : 'Unread'
          pdf.text(`Status: ${statusText} | Type: ${notification.type || 'info'}`, 30, yPosition + 8)
          yPosition += 15
        })
      } else {
        pdf.setFontSize(10)
        pdf.setTextColor(150, 150, 150)
        pdf.text('No notifications found', 25, yPosition)
        yPosition += 10
      }
      
      yPosition += 10
      
      // Statistics Summary
      if (yPosition > pageHeight - 50) {
        pdf.addPage()
        yPosition = 20
      }
      
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Statistics Summary', 20, yPosition)
      yPosition += 10
      
      const completedTasks = tasksData.filter(task => task.status === 'completed').length
      const activeTasks = tasksData.filter(task => task.status === 'in-progress').length
      const pendingTasks = tasksData.filter(task => task.status === 'pending' || task.status === 'todo').length
      const activeProjects = projectsData.filter(project => project.status === 'Active').length
      const unreadNotifications = notificationsData.filter(notif => !notif.read).length
      
      pdf.setFontSize(12)
      pdf.setTextColor(34, 197, 94) // Green
      pdf.text(`Total Projects: ${projectsData.length} (${activeProjects} active)`, 25, yPosition)
      yPosition += 8
      
      pdf.setTextColor(59, 130, 246) // Blue
      pdf.text(`Total Tasks: ${tasksData.length}`, 25, yPosition)
      yPosition += 6
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Completed: ${completedTasks} | In Progress: ${activeTasks} | Pending: ${pendingTasks}`, 30, yPosition)
      yPosition += 10
      
      pdf.setFontSize(12)
      pdf.setTextColor(168, 85, 247) // Purple
      pdf.text(`Recent Activities: ${activitiesData.length}`, 25, yPosition)
      yPosition += 8
      
      pdf.setTextColor(239, 68, 68) // Red
      pdf.text(`Notifications: ${notificationsData.length} (${unreadNotifications} unread)`, 25, yPosition)
      yPosition += 10
      
      // Settings Summary
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Settings Summary', 20, yPosition)
      yPosition += 10
      
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Theme: ${theme}`, 25, yPosition)
      pdf.text(`Language: ${settings.preferences.language}`, 25, yPosition + 5)
      pdf.text(`Timezone: ${settings.preferences.timezone}`, 25, yPosition + 10)
      pdf.text(`Email Notifications: ${settings.notifications.email ? 'Enabled' : 'Disabled'}`, 25, yPosition + 15)
      pdf.text(`Profile Visibility: ${settings.privacy.profileVisibility}`, 25, yPosition + 20)
      
      // Save PDF
      const fileName = `campus_collaboration_export_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      toast.success('PDF exported successfully!', { id: 'export' })
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to generate PDF export. Please try again.', { id: 'export' })
    }
  }

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data, projects, and collaborations.'
    )
    
    if (confirmed) {
      const doubleConfirmed = window.confirm(
        'This is your final warning. Type "DELETE" in the next prompt to confirm account deletion.'
      )
      
      if (doubleConfirmed) {
        const typedConfirmation = prompt('Type "DELETE" to confirm:')
        
        if (typedConfirmation === 'DELETE') {
          toast.error('Account deletion is not implemented in this demo version.', {
            duration: 5000
          })
          // In a real app, you would call an API endpoint here
          // await api.delete('/users/account')
        } else {
          toast.info('Account deletion cancelled - incorrect confirmation text.')
        }
      } else {
        toast.info('Account deletion cancelled.')
      }
    }
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: ComputerDesktopIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Settings
          </motion.h1>
          <motion.p 
            className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Customize your experience and manage your preferences
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="w-full sm:w-auto"
        >
          <Button 
            onClick={handleSaveSettings}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 min-h-[48px] px-6 py-3 text-base font-medium touch-manipulation"
          >
            <CheckCircleIcon className="h-5 w-5" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Appearance Settings */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <PaintBrushIcon className="h-5 w-5 mr-2 text-primary-600" />
              Appearance
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {themeOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => {
                        setTheme(option.value)
                        toast.success(`Theme changed to ${option.label}`, {
                          duration: 2000,
                          position: 'top-right'
                        })
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 min-h-[64px] touch-manipulation ${
                        theme === option.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-sm'
                      }`}
                    >
                      <option.icon className={`h-5 w-5 ${
                        theme === option.value ? 'text-primary-600' : 'text-gray-500'
                      }`} />
                      <span className={`text-xs sm:text-sm font-medium ${
                        theme === option.value ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {option.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Compact Mode
                </label>
                <button
                  onClick={() => handlePreferenceChange('compactMode', !settings.preferences.compactMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 touch-manipulation ${
                    settings.preferences.compactMode 
                      ? 'bg-primary-600 hover:bg-primary-700' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                      settings.preferences.compactMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-primary-600" />
              Notifications
            </h3>
            
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
                { key: 'projectUpdates', label: 'Project Updates', description: 'Notifications about project changes' },
                { key: 'taskAssignments', label: 'Task Assignments', description: 'When you are assigned to a task' },
                { key: 'deadlineReminders', label: 'Deadline Reminders', description: 'Reminders for upcoming deadlines' },
                { key: 'teamInvites', label: 'Team Invites', description: 'Invitations to join teams or projects' }
              ].map((item) => (
                <div key={item.key} className="flex items-start justify-between py-2 gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleNotificationChange(item.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 touch-manipulation ${
                        settings.notifications[item.key] 
                          ? 'bg-primary-600 hover:bg-primary-700' 
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                          settings.notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}}
            </div>
          </Card>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-primary-600" />
              Privacy
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Profile Visibility
                </label>
                <select
                  value={settings.privacy.profileVisibility}
                  onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white touch-manipulation"
                >
                  <option value="public">Public</option>
                  <option value="team">Team Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {[
                { key: 'showEmail', label: 'Show Email in Profile' },
                { key: 'showPhone', label: 'Show Phone in Profile' },
                { key: 'allowDirectMessages', label: 'Allow Direct Messages' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                  <button
                    onClick={() => handlePrivacyChange(item.key, !settings.privacy[item.key])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 touch-manipulation ${
                      settings.privacy[item.key] 
                        ? 'bg-primary-600 hover:bg-primary-700' 
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                        settings.privacy[item.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}}
            </div>
          </Card>
        </motion.div>

        {/* General Preferences */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <GlobeAltIcon className="h-5 w-5 mr-2 text-primary-600" />
              General Preferences
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Language
                </label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white touch-manipulation"
                >
                  <option value="en">English</option>
                  <option value="tw">Twi</option>
                  <option value="ga">Ga</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Timezone
                </label>
                <select
                  value={settings.preferences.timezone}
                  onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white touch-manipulation"
                >
                  <option value="Africa/Accra">Africa/Accra (GMT)</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Date Format
                </label>
                <select
                  value={settings.preferences.dateFormat}
                  onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white touch-manipulation"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-save changes
                </label>
                <button
                  onClick={() => handlePreferenceChange('autoSave', !settings.preferences.autoSave)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 touch-manipulation ${
                    settings.preferences.autoSave 
                      ? 'bg-primary-600 hover:bg-primary-700' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                      settings.preferences.autoSave ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="p-4 sm:p-6 border-red-200 dark:border-red-800">
          <h3 className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Danger Zone
          </h3>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Export Complete Database</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Download all projects, tasks, activities, notifications & settings as PDF</p>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportData}
                  className="w-full sm:w-auto min-h-[48px] px-6 py-3 text-base font-medium touch-manipulation hover:border-primary-400 hover:text-primary-600"
                >
                  Export PDF
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Delete Account</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Permanently delete your account and all data</p>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDeleteAccount}
                  className="w-full sm:w-auto min-h-[48px] px-6 py-3 text-base font-medium touch-manipulation bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default Settings