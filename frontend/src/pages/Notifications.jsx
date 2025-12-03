import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { 
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  UserGroupIcon,
  FolderIcon,
  ClockIcon,
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { Card, Button, Badge, Avatar } from '../components/ui'
import { AuthContext } from '../contexts/AuthContext'
import api from '../services/api'

const Notifications = () => {
  const { user } = useContext(AuthContext)
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      console.log('Fetching notifications from API...')
      const response = await api.get('/notifications')
      console.log('Notifications API response:', response.data)
      
      // Handle different API response structures - the backend sends data in response.data.data
      const notificationsData = response.data?.data || []
      console.log('Extracted notifications data:', notificationsData)
      console.log('Is array?', Array.isArray(notificationsData))
      
      setNotifications(Array.isArray(notificationsData) ? notificationsData : [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      console.error('Error details:', error.response?.data)
      // Fallback to demo data
      setNotifications(Array.isArray(demoNotifications) ? demoNotifications : [])
    } finally {
      setLoading(false)
    }
  }

  // Demo notifications
  const demoNotifications = [
    {
      id: 1,
      type: 'task_assigned',
      title: 'New Task Assignment',
      message: 'You have been assigned to "Setup User Authentication System" in School Management System project.',
      isRead: false,
      createdAt: '2024-12-20T10:30:00Z',
      actionUrl: '/tasks',
      user: {
        name: 'John Teacher',
        avatar: null
      },
      project: {
        name: 'School Management System'
      }
    },
    {
      id: 2,
      type: 'project_update',
      title: 'Project Status Update',
      message: 'Digital Library Project has been updated to "In Progress" status.',
      isRead: false,
      createdAt: '2024-12-20T09:15:00Z',
      actionUrl: '/projects',
      user: {
        name: 'Library Staff',
        avatar: null
      },
      project: {
        name: 'Digital Library Project'
      }
    },
    {
      id: 3,
      type: 'deadline_reminder',
      title: 'Deadline Reminder',
      message: 'Task "Design Student Dashboard Interface" is due in 2 days.',
      isRead: false,
      createdAt: '2024-12-20T08:00:00Z',
      actionUrl: '/tasks',
      priority: 'high'
    },
    {
      id: 4,
      type: 'team_invite',
      title: 'Team Invitation',
      message: 'You have been invited to join the "Campus Events App" project team.',
      isRead: true,
      createdAt: '2024-12-19T16:45:00Z',
      actionUrl: '/projects',
      user: {
        name: 'Event Coordinator',
        avatar: null
      },
      project: {
        name: 'Campus Events App'
      }
    },
    {
      id: 5,
      type: 'task_completed',
      title: 'Task Completed',
      message: 'Sarah Student has completed "User Interface Design" task.',
      isRead: true,
      createdAt: '2024-12-19T14:20:00Z',
      actionUrl: '/tasks',
      user: {
        name: 'Sarah Student',
        avatar: null
      },
      project: {
        name: 'School Management System'
      }
    },
    {
      id: 6,
      type: 'system_announcement',
      title: 'System Maintenance',
      message: 'Scheduled system maintenance will occur on Sunday, Dec 22nd from 2:00 AM - 4:00 AM GMT.',
      isRead: true,
      createdAt: '2024-12-19T12:00:00Z',
      priority: 'medium'
    },
    {
      id: 7,
      type: 'project_created',
      title: 'New Project Created',
      message: 'A new project "Student Assessment Portal" has been created and you are added as a team member.',
      isRead: true,
      createdAt: '2024-12-18T11:30:00Z',
      actionUrl: '/projects',
      user: {
        name: 'Grade Coordinator',
        avatar: null
      },
      project: {
        name: 'Student Assessment Portal'
      }
    }
  ]

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      setNotifications(prev => 
        Array.isArray(prev) ? prev.map(notif => 
          notif && notif.id === notificationId ? { ...notif, isRead: true } : notif
        ) : []
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // Demo fallback
      setNotifications(prev => 
        Array.isArray(prev) ? prev.map(notif => 
          notif && notif.id === notificationId ? { ...notif, isRead: true } : notif
        ) : []
      )
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read')
      setNotifications(prev => Array.isArray(prev) ? prev.map(notif => notif ? { ...notif, isRead: true } : notif) : [])
    } catch (error) {
      console.error('Error marking all as read:', error)
      // Demo fallback
      setNotifications(prev => Array.isArray(prev) ? prev.map(notif => notif ? { ...notif, isRead: true } : notif) : [])
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      setNotifications(prev => Array.isArray(prev) ? prev.filter(notif => notif && notif.id !== notificationId) : [])
    } catch (error) {
      console.error('Error deleting notification:', error)
      // Demo fallback
      setNotifications(prev => Array.isArray(prev) ? prev.filter(notif => notif && notif.id !== notificationId) : [])
    }
  }

  const getNotificationIcon = (type) => {
    const iconMap = {
      task_assigned: ClockIcon,
      project_update: FolderIcon,
      deadline_reminder: ExclamationCircleIcon,
      team_invite: UserGroupIcon,
      task_completed: CheckCircleIcon,
      system_announcement: InformationCircleIcon,
      project_created: FolderIcon
    }
    return iconMap[type] || BellIcon
  }

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'text-red-600 bg-red-50 border-red-200'
    
    const colorMap = {
      task_assigned: 'text-blue-600 bg-blue-50 border-blue-200',
      project_update: 'text-green-600 bg-green-50 border-green-200',
      deadline_reminder: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      team_invite: 'text-purple-600 bg-purple-50 border-purple-200',
      task_completed: 'text-green-600 bg-green-50 border-green-200',
      system_announcement: 'text-gray-600 bg-gray-50 border-gray-200',
      project_created: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    }
    return colorMap[type] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffInSeconds = Math.floor((now - past) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return past.toLocaleDateString()
  }

  const filteredNotifications = Array.isArray(notifications) ? notifications.filter(notif => {
    if (!notif) return false
    if (filter === 'unread') return !notif.isRead
    if (filter === 'read') return notif.isRead
    return true
  }) : []

  const unreadCount = Array.isArray(notifications) ? notifications.filter(notif => notif && !notif.isRead).length : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BellIcon className="h-8 w-8 mr-3 text-primary-600" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-3">
                {unreadCount}
              </Badge>
            )}
          </motion.h1>
          <motion.p 
            className="text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Stay updated with your projects and tasks
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="flex space-x-3"
        >
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              <span>Mark All Read</span>
            </Button>
          )}
        </motion.div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All', count: Array.isArray(notifications) ? notifications.length : 0 },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'read', label: 'Read', count: Array.isArray(notifications) ? notifications.length - unreadCount : 0 }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              filter === tab.key
                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification, index) => {
          const IconComponent = getNotificationIcon(notification.type)
          const colorClass = getNotificationColor(notification.type, notification.priority)
          
          return (
            <motion.div
              key={notification._id || notification.id || `notification-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <Card className={`p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                !notification.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50/30 dark:bg-primary-900/10' : ''
              }`}>
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ${colorClass}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                          {!notification.isRead && (
                            <span className="inline-block w-2 h-2 bg-primary-600 rounded-full ml-2"></span>
                          )}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          !notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {/* Meta information */}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatTimeAgo(notification.createdAt)}</span>
                          {notification.user && (
                            <span className="flex items-center space-x-1">
                              <Avatar src={notification.user.avatar} size="xs" />
                              <span>{notification.user.name}</span>
                            </span>
                          )}
                          {notification.project && (
                            <span className="flex items-center space-x-1">
                              <FolderIcon className="h-3 w-3" />
                              <span>{notification.project.name}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification._id || notification.id)
                            }}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            title="Mark as Read"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification._id || notification.id)
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action URL */}
                {notification.actionUrl && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href={notification.actionUrl}
                      className="text-xs text-primary-600 hover:text-primary-500 font-medium"
                    >
                      View Details →
                    </a>
                  </div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <BellIcon />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No notifications found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filter === 'unread' 
              ? "You're all caught up! No unread notifications."
              : filter === 'read'
              ? "No read notifications found."
              : "You don't have any notifications yet."
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default Notifications