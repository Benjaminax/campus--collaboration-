import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  FolderIcon,
  ListBulletIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { Card, Button, Badge, Loading } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

// Chart Components (Simple implementations)
const BarChart = ({ data, title, className = "" }) => {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className={`p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</h4>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-20">
              {item.label}
            </span>
            <div className="flex-1 mx-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-900 dark:text-white w-8 text-right">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const LineChart = ({ data, title, className = "" }) => {
  const maxValue = Math.max(...data.map(d => d.value))
  const width = 300
  const height = 120
  const padding = 20

  const points = data.map((item, index) => {
    const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
    const y = height - padding - ((item.value / maxValue) * (height - 2 * padding))
    return `${x},${y}`
  }).join(' ')

  return (
    <div className={`p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</h4>
      <div className="relative">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          <polyline
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            points={points}
            className="drop-shadow-sm"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {data.map((item, index) => {
            const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
            const y = height - padding - ((item.value / maxValue) * (height - 2 * padding))
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#3B82F6"
                className="drop-shadow-sm"
              />
            )
          })}
        </svg>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          {data.map((item, index) => (
            <span key={index} className="text-center">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const DonutChart = ({ data, title, className = "" }) => {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0)
  let cumulativePercentage = 0
  
  // Return early if no data or total is 0
  if (!data.length || total === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">{title}</h4>
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
        </div>
      </div>
    )
  }
  
  const radius = 45
  const centerX = 60
  const centerY = 60
  const circumference = 2 * Math.PI * radius
  
  return (
    <div className={`p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">{title}</h4>
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="120" height="120" className="transform -rotate-90">
            {data.map((item, index) => {
              const value = item.value || 0
              const percentage = total > 0 ? (value / total) * 100 : 0
              const strokeLength = (percentage / 100) * circumference
              const strokeOffset = cumulativePercentage * circumference / 100
              cumulativePercentage += percentage
              
              const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
              
              return (
                <circle
                  key={index}
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="8"
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={-strokeOffset}
                  className="transition-all duration-300"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{total}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {data.map((item, index) => {
          const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500']
          return (
            <div key={index} className="flex items-center text-xs">
              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2`}></div>
              <span className="text-gray-600 dark:text-gray-400 truncate flex-1">{item.label}</span>
              <span className="font-medium text-gray-900 dark:text-white ml-2">{item.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Analytics() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [projectAnalytics, setProjectAnalytics] = useState([])
  const [timeframe, setTimeframe] = useState('30')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch overall analytics
      const analyticsRes = await api.get('/analytics')
      setAnalytics(analyticsRes.data.data)
      
      // Fetch project analytics if user has projects
      if (analyticsRes.data.data?.projects?.total > 0) {
        // This would be enhanced to fetch individual project analytics
        // For now, we'll use mock data based on the analytics
        const mockProjectData = generateMockProjectData(analyticsRes.data.data)
        setProjectAnalytics(mockProjectData)
      }
      
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      // Set demo data on error
      setAnalytics(getDemoAnalytics())
      setProjectAnalytics(getDemoProjectAnalytics())
    } finally {
      setLoading(false)
    }
  }

  const refreshAnalytics = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
  }

  const generateMockProjectData = (data) => {
    return [
      { label: 'Mon', value: Math.floor(Math.random() * 20) + 5 },
      { label: 'Tue', value: Math.floor(Math.random() * 20) + 8 },
      { label: 'Wed', value: Math.floor(Math.random() * 20) + 12 },
      { label: 'Thu', value: Math.floor(Math.random() * 20) + 7 },
      { label: 'Fri', value: Math.floor(Math.random() * 20) + 15 },
      { label: 'Sat', value: Math.floor(Math.random() * 20) + 3 },
      { label: 'Sun', value: Math.floor(Math.random() * 20) + 2 }
    ]
  }

  const getDemoAnalytics = () => ({
    projects: { total: 8, active: 5, completed: 3, pending: 0 },
    tasks: { total: 23, pending: 8, inProgress: 7, completed: 6, overdue: 2 },
    collaborations: { total: 12, activeProjects: 5 },
    notifications: { total: 45, unread: 6, read: 39 },
    activity: { last30Days: 124, projectsWithActivity: 5 }
  })

  const getDemoProjectAnalytics = () => [
    { label: 'Mon', value: 8 },
    { label: 'Tue', value: 12 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 10 },
    { label: 'Fri', value: 18 },
    { label: 'Sat', value: 5 },
    { label: 'Sun', value: 3 }
  ]

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'active': case 'in-progress': return 'primary'
      case 'pending': return 'warning'
      case 'overdue': return 'danger'
      default: return 'default'
    }
  }

  const calculateTrend = (current, total) => {
    const percentage = total > 0 ? ((current / total) * 100).toFixed(1) : 0
    const isPositive = current > (total * 0.6) // Assume > 60% is positive
    return { percentage, isPositive }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" />
      </div>
    )
  }

  const taskStatusData = analytics ? [
    { label: 'Completed', value: analytics.tasks.completed },
    { label: 'In Progress', value: analytics.tasks.inProgress },
    { label: 'Pending', value: analytics.tasks.pending },
    { label: 'Overdue', value: analytics.tasks.overdue }
  ] : []

  const projectStatusData = analytics ? [
    { label: 'Active', value: analytics.projects.active },
    { label: 'Completed', value: analytics.projects.completed },
    { label: 'Pending', value: analytics.projects.pending }
  ] : []

  const activityData = projectAnalytics

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.h1 
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            📊 Analytics Dashboard
          </motion.h1>
          <motion.p 
            className="text-gray-600 dark:text-gray-400 mt-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Insights into your projects, tasks, and collaboration patterns
          </motion.p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
          </select>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshAnalytics}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          {
            title: 'Total Projects',
            value: analytics?.projects.total || 0,
            icon: FolderIcon,
            color: 'from-blue-600 to-blue-700',
            trend: calculateTrend(analytics?.projects.active || 0, analytics?.projects.total || 0)
          },
          {
            title: 'Active Tasks',
            value: analytics?.tasks.total || 0,
            icon: ListBulletIcon,
            color: 'from-green-600 to-green-700',
            trend: calculateTrend(analytics?.tasks.completed || 0, analytics?.tasks.total || 0)
          },
          {
            title: 'Collaborations',
            value: analytics?.collaborations.total || 0,
            icon: UserGroupIcon,
            color: 'from-purple-600 to-purple-700',
            trend: { percentage: '85.2', isPositive: true }
          },
          {
            title: 'Notifications',
            value: analytics?.notifications.unread || 0,
            icon: BellIcon,
            color: 'from-orange-600 to-orange-700',
            trend: calculateTrend(analytics?.notifications.read || 0, analytics?.notifications.total || 0)
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 md:p-6 bg-gradient-to-br ${stat.color} text-white hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-white/80 text-xs md:text-sm font-medium truncate">{stat.title}</p>
                  <p className="text-xl md:text-3xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2 text-xs">
                    {stat.trend.isPositive ? (
                      <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                    )}
                    <span>{stat.trend.percentage}%</span>
                  </div>
                </div>
                <stat.icon className="h-8 w-8 text-white/60 group-hover:text-white/80 transition-colors" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Task Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <DonutChart 
              data={taskStatusData} 
              title="Task Status Distribution" 
            />
          </Card>
        </motion.div>

        {/* Project Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <BarChart 
              data={projectStatusData} 
              title="Project Status Overview" 
            />
          </Card>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 xl:col-span-1"
        >
          <Card>
            <LineChart 
              data={activityData} 
              title="Weekly Activity Trend" 
            />
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance Metrics
              </h3>
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Project Completion Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">75%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Task Efficiency</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">82%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Collaboration Score</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">68%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">On-time Delivery</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '91%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">91%</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Activity Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Activity Summary
              </h3>
              <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {[
                { action: 'Tasks Completed', count: analytics?.tasks.completed || 6, time: 'This week', icon: CheckCircleIcon, color: 'text-green-600' },
                { action: 'Projects Created', count: 2, time: 'This month', icon: FolderIcon, color: 'text-blue-600' },
                { action: 'Comments Added', count: 15, time: 'Last 7 days', icon: EyeIcon, color: 'text-purple-600' },
                { action: 'Collaborations', count: analytics?.collaborations.total || 12, time: 'Active', icon: UserGroupIcon, color: 'text-orange-600' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.action}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.time}</p>
                    </div>
                  </div>
                  <Badge variant="primary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Goals and Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📈 Insights & Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">💪 Strengths</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span>High task completion rate (82%)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span>Excellent on-time delivery (91%)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span>Active collaboration in teams</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">🎯 Areas for Improvement</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                  <span>Reduce overdue tasks ({analytics?.tasks.overdue || 2} pending)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                  <span>Increase project completion rate</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-blue-500" />
                  <span>Consider breaking large tasks into smaller ones</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default Analytics