import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BookOpenIcon, 
  UserGroupIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  BellIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { Card } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import ConnectionTest from '../components/ConnectionTest'

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0, completed: 0 },
    tasks: { total: 0, pending: 0, completed: 0, overdue: 0 },
    collaborations: { total: 0 },
    notifications: { unread: 0 }
  })
  const [recentProjects, setRecentProjects] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch analytics data
      const analyticsResponse = await api.get('/analytics')
      setStats(analyticsResponse.data.data || stats)

      // Fetch recent projects
      const projectsResponse = await api.get('/projects?limit=5&sort=-createdAt')
      setRecentProjects(projectsResponse.data.data?.projects || [])

      // Fetch recent tasks
      const tasksResponse = await api.get('/tasks?limit=5&sort=-createdAt')
      setRecentTasks(tasksResponse.data.data?.tasks || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set fallback data for demo
      setStats({
        projects: { total: 8, active: 5, completed: 3 },
        tasks: { total: 23, pending: 12, completed: 11, overdue: 2 },
        collaborations: { total: 15 },
        notifications: { unread: 4 }
      })
      setRecentProjects([
        {
          _id: '1',
          title: 'Web Development Course',
          description: 'Building a full-stack web application for the final project',
          status: 'active',
          deadline: '2025-12-15'
        },
        {
          _id: '2',
          title: 'Mobile App Design',
          description: 'UI/UX design for educational mobile application',
          status: 'active',
          deadline: '2025-12-20'
        }
      ])
      setRecentTasks([
        {
          _id: '1',
          title: 'Complete API documentation',
          status: 'pending',
          priority: 'high',
          project: { title: 'Web Development Course' }
        },
        {
          _id: '2',
          title: 'Review pull request',
          status: 'completed',
          priority: 'medium',
          project: { title: 'Mobile App Design' }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getUserRole = () => {
    if (user?.email?.includes('@student.')) return 'Student'
    if (user?.email?.includes('@teacher.') || user?.email?.includes('@professor.')) return 'Teacher'
    if (user?.role === 'instructor') return 'Instructor'
    return user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User'
  }

  const handleCardClick = (cardType) => {
    switch(cardType) {
      case 'projects':
        navigate('/projects')
        break
      case 'team':
        navigate('/team')
        break
      case 'tasks':
        navigate('/tasks')
        break
      case 'analytics':
        navigate('/analytics')
        break
      default:
        break
    }
  }

  const recentActivity = [
    { user: 'Sarah Johnson', action: 'completed task', target: 'User Authentication', time: '2 hours ago' },
    { user: 'Mike Chen', action: 'commented on', target: 'API Design', time: '4 hours ago' },
    { user: 'Emily Davis', action: 'created project', target: 'Frontend Redesign', time: '6 hours ago' },
  ]

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-4 md:p-8 text-white shadow-xl relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-secondary-400/20"></div>
        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-8 md:-translate-y-16 translate-x-8 md:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-full translate-y-8 md:translate-y-12 -translate-x-8 md:-translate-x-12"></div>
        
        <div className="relative z-10">
          <motion.h1 
            className="text-xl md:text-3xl font-bold mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {getGreeting()}, {user?.name}! 👋
          </motion.h1>
          <motion.p 
            className="text-primary-100 text-sm md:text-base"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Here's what's happening with your projects today.
          </motion.p>
        </div>
      </motion.div>

      {/* Connection Test - Temporary for testing */}
      <ConnectionTest />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[
          { title: 'Active Projects', value: stats.projects.active.toString(), icon: '📊', color: 'from-primary-500 to-accent-500', delay: 0.1, action: 'projects' },
          { title: 'Team Members', value: '28', icon: '👥', color: 'from-emerald-500 to-teal-500', delay: 0.2, action: 'team' },
          { title: 'Pending Tasks', value: stats.tasks.pending.toString(), icon: '⏰', color: 'from-orange-500 to-amber-500', delay: 0.3, action: 'tasks' },
          { title: 'Completed', value: stats.tasks.completed.toString(), icon: '✅', color: 'from-purple-500 to-pink-500', delay: 0.4, action: 'analytics' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: stat.delay,
              duration: 0.5,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick(stat.action)}
            className={`bg-gradient-to-br ${stat.color} rounded-xl md:rounded-2xl p-3 md:p-6 text-white shadow-lg hover:shadow-xl cursor-pointer group relative overflow-hidden transition-all duration-200`}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-white/10 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-white/80 text-xs md:text-sm font-medium truncate">{stat.title}</p>
                <motion.p 
                  className="text-xl md:text-3xl font-bold mt-1"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: stat.delay + 0.2, duration: 0.3 }}
                >
                  {stat.value}
                </motion.p>
                <motion.p
                  className="text-white/60 text-xs mt-1 hidden md:block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: stat.delay + 0.4 }}
                >
                  {index === 0 ? '+2.1%' : index === 1 ? '+12.5%' : index === 2 ? '-2.4%' : '+8.2%'} from last week
                </motion.p>
              </div>
              <motion.div 
                className="text-2xl md:text-4xl group-hover:scale-110 transition-transform duration-200 flex-shrink-0"
                whileHover={{ rotate: 10 }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: stat.delay + 0.1, type: "spring" }}
              >
                {stat.icon}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Projects */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              Recent Projects
            </h3>
            <motion.button
              onClick={() => navigate('/projects')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium transition-colors"
            >
              View All →
            </motion.button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {recentProjects.length > 0 ? recentProjects.map((project, index) => (
                <motion.div 
                  key={project._id || index} 
                  onClick={() => navigate('/projects')}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 md:p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer border border-transparent hover:border-primary-200 dark:hover:border-primary-700"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base truncate">
                      {project.title || project.name}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {project.description || 'No description available'}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
                      <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Status: {project.status}
                      </span>
                      {project.deadline && (
                        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          Due: {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8">
                  <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No recent projects</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3 md:space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="h-6 w-6 md:h-8 md:w-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.user}</span>
                    {' '}{activity.action}{' '}
                    <span className="font-medium truncate">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard