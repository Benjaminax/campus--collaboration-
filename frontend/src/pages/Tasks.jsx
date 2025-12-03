import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline'
import { Card, Button, Badge, Avatar } from '../components/ui'
import { AuthContext } from '../contexts/AuthContext'
import api from '../services/api'

const Tasks = () => {
  const { user } = useContext(AuthContext)
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: '',
    estimatedHours: ''
  })

  // Fetch tasks and projects from API
  useEffect(() => {
    fetchTasks()
    fetchProjects()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      console.log('Fetching tasks from API...')
      const response = await api.get('/tasks')
      console.log('Tasks API response:', response.data)
      
      // Handle different API response structures
      const tasksData = response.data?.data || response.data?.tasks || response.data || []
      console.log('Extracted tasks data:', tasksData)
      
      // Map database fields to frontend expected fields
      const mappedTasks = Array.isArray(tasksData) ? tasksData.map(task => ({
        ...task,
        id: task._id || task.id,
        project: task.project || { name: 'Unknown Project' },
        assignedTo: task.assignedTo || [],
        dueDate: task.dueDate || null,
        status: task.status || 'todo',
        priority: task.priority || 'medium'
      })) : []
      
      setTasks(mappedTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      console.error('Error details:', error.response?.data)
      // Fallback to demo data for development
      setTasks(Array.isArray(demoTasks) ? demoTasks : [])
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      console.log('Fetching projects for tasks dropdown...')
      const response = await api.get('/projects')
      console.log('Projects response for tasks:', response.data)
      
      // Handle different API response structures and map fields
      const projectsData = response.data?.data || response.data?.projects || response.data || []
      
      // Map database fields to frontend expected fields (same as Projects page)
      const mappedProjects = Array.isArray(projectsData) ? projectsData.map(project => ({
        ...project,
        id: project._id || project.id,
        name: project.title || project.name || 'Untitled Project',
        title: project.title || project.name || 'Untitled Project',
        category: project.courseCode || project.category || '',
        status: project.status || 'active'
      })) : []
      
      console.log('Mapped projects for tasks:', mappedProjects)
      setProjects(mappedProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
      console.error('Error details:', error.response?.data)
      // Fallback to demo data
      setProjects(Array.isArray(demoProjects) ? demoProjects : [])
    }
  }

  // Demo data for development
  const demoTasks = [
    {
      id: 1,
      title: 'Setup User Authentication System',
      description: 'Implement secure login and registration functionality with JWT tokens',
      status: 'completed',
      priority: 'high',
      projectId: 1,
      projectName: 'School Management System',
      assignedTo: { 
        id: 1, 
        name: 'John Teacher', 
        avatar: null, 
        role: 'teacher' 
      },
      createdBy: { 
        id: 2, 
        name: 'Mike Admin', 
        avatar: null 
      },
      dueDate: '2024-12-20',
      estimatedHours: 8,
      actualHours: 6,
      createdAt: '2024-12-01',
      completedAt: '2024-12-15'
    },
    {
      id: 2,
      title: 'Design Student Dashboard Interface',
      description: 'Create responsive dashboard with grade tracking and assignment management',
      status: 'in-progress',
      priority: 'high',
      projectId: 1,
      projectName: 'School Management System',
      assignedTo: { 
        id: 3, 
        name: 'Sarah Student', 
        avatar: null, 
        role: 'student' 
      },
      createdBy: { 
        id: 1, 
        name: 'John Teacher', 
        avatar: null 
      },
      dueDate: '2024-12-25',
      estimatedHours: 12,
      actualHours: 4,
      createdAt: '2024-12-05',
      progress: 40
    },
    {
      id: 3,
      title: 'Implement Book Catalog System',
      description: 'Build searchable catalog with filtering and sorting capabilities',
      status: 'todo',
      priority: 'medium',
      projectId: 2,
      projectName: 'Digital Library Project',
      assignedTo: { 
        id: 4, 
        name: 'Library Staff', 
        avatar: null, 
        role: 'teacher' 
      },
      createdBy: { 
        id: 2, 
        name: 'Mike Admin', 
        avatar: null 
      },
      dueDate: '2024-12-30',
      estimatedHours: 16,
      actualHours: 0,
      createdAt: '2024-12-10'
    },
    {
      id: 4,
      title: 'Create Assessment Builder',
      description: 'Tool for teachers to create and manage digital assessments',
      status: 'in-progress',
      priority: 'high',
      projectId: 3,
      projectName: 'Student Assessment Portal',
      assignedTo: { 
        id: 5, 
        name: 'Grade Coordinator', 
        avatar: null, 
        role: 'teacher' 
      },
      createdBy: { 
        id: 1, 
        name: 'John Teacher', 
        avatar: null 
      },
      dueDate: '2024-12-28',
      estimatedHours: 20,
      actualHours: 8,
      createdAt: '2024-12-08',
      progress: 60
    },
    {
      id: 5,
      title: 'Setup Event Registration System',
      description: 'Allow students to register for campus events and activities',
      status: 'overdue',
      priority: 'medium',
      projectId: 4,
      projectName: 'Campus Events App',
      assignedTo: { 
        id: 6, 
        name: 'Student Council', 
        avatar: null, 
        role: 'student' 
      },
      createdBy: { 
        id: 7, 
        name: 'Event Coordinator', 
        avatar: null 
      },
      dueDate: '2024-12-18',
      estimatedHours: 10,
      actualHours: 2,
      createdAt: '2024-12-01'
    }
  ]

  const demoProjects = [
    { id: 1, name: 'School Management System' },
    { id: 2, name: 'Digital Library Project' },
    { id: 3, name: 'Student Assessment Portal' },
    { id: 4, name: 'Campus Events App' }
  ]

  // CRUD Operations
  const handleCreateTask = async (e) => {
    e.preventDefault()
    
    console.log('Creating task with data:', newTask)
    console.log('Available projects:', projects)
    
    if (!newTask.projectId) {
      alert('Please select a project')
      return
    }
    
    try {
      // Map frontend fields to backend expected fields
      const taskData = {
        projectId: newTask.projectId, // This should be the MongoDB _id
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
        estimatedHours: newTask.estimatedHours ? parseInt(newTask.estimatedHours) : null,
        assignedTo: [], // Start with empty array, can be assigned later
        tags: []
      }
      
      console.log('Sending task data to API:', taskData)
      
      const response = await api.post('/tasks', taskData)
      console.log('Task creation response:', response.data)
      
      // Handle the response and add to tasks list
      const newTaskFromApi = response.data?.data || response.data
      const mappedNewTask = {
        ...newTaskFromApi,
        id: newTaskFromApi._id || newTaskFromApi.id,
        project: projects.find(p => p.id === newTask.projectId) || { name: 'Unknown Project' }
      }
      
      setTasks(Array.isArray(tasks) ? [...tasks, mappedNewTask] : [mappedNewTask])
      setShowCreateModal(false)
      resetNewTask()
    } catch (error) {
      console.error('Error creating task:', error)
      console.error('Error details:', error.response?.data)
      
      // Show specific error message
      if (error.response?.status === 400) {
        const errorData = error.response?.data
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(err => err.msg || err.message || err).join('\n')
          alert(`Validation Error:\n${errorMessages}`)
        } else {
          alert(`Error creating task: ${errorData?.message || 'Invalid data provided'}`)
        }
        return
      } else if (error.response?.status === 403) {
        alert('You do not have permission to create tasks in this project.')
        return
      }
      
      // Demo fallback
      const project = projects.find(p => p.id === newTask.projectId)
      const newTaskObj = {
        id: Date.now(),
        ...newTask,
        projectName: project?.name || 'Unknown Project',
        project: project || { name: 'Unknown Project' },
        status: 'todo',
        actualHours: 0,
        progress: 0,
        createdBy: { id: user?.id, name: user?.name || 'Current User' },
        assignedTo: [],
        createdAt: new Date().toISOString().split('T')[0]
      }
      setTasks(Array.isArray(tasks) ? [...tasks, newTaskObj] : [newTaskObj])
      setShowCreateModal(false)
      resetNewTask()
    }
  }

  const handleEditTask = async (e) => {
    e.preventDefault()
    try {
      const response = await api.put(`/tasks/${selectedTask.id}`, selectedTask)
      setTasks(Array.isArray(tasks) ? tasks.map(t => t.id === selectedTask.id ? response.data : t) : [response.data])
      setShowEditModal(false)
      setSelectedTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
      // Demo fallback
      setTasks(Array.isArray(tasks) ? tasks.map(t => t.id === selectedTask.id ? selectedTask : t) : [selectedTask])
      setShowEditModal(false)
      setSelectedTask(null)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks(Array.isArray(tasks) ? tasks.filter(t => t.id !== taskId) : [])
    } catch (error) {
      console.error('Error deleting task:', error)
      // Demo fallback
      setTasks(Array.isArray(tasks) ? tasks.filter(t => t.id !== taskId) : [])
    }
  }

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const task = Array.isArray(tasks) ? tasks.find(t => t && t.id === taskId) : null
      if (!task) return
      
      const updatedTask = {
        ...task,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
        progress: newStatus === 'completed' ? 100 : task.progress
      }
      
      const response = await api.put(`/tasks/${taskId}`, updatedTask)
      setTasks(Array.isArray(tasks) ? tasks.map(t => t.id === taskId ? response.data : t) : [response.data])
    } catch (error) {
      console.error('Error updating task status:', error)
      // Demo fallback
      setTasks(Array.isArray(tasks) ? tasks.map(t => t && t.id === taskId ? 
        { 
          ...t, 
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
          progress: newStatus === 'completed' ? 100 : t.progress
        } : t
      ) : [])
    }
  }

  const resetNewTask = () => {
    setNewTask({
      title: '',
      description: '',
      projectId: '',
      dueDate: '',
      priority: 'medium',
      assignedTo: '',
      estimatedHours: ''
    })
  }

  const openEditModal = (task) => {
    setSelectedTask({ ...task })
    setShowEditModal(true)
  }

  // Filter tasks
  const filteredTasks = Array.isArray(tasks) ? tasks.filter(task => {
    if (!task) return false
    const taskTitle = task.title || ''
    const taskDescription = task.description || ''
    const matchesSearch = taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taskDescription.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  }) : []

  // Task status configuration
  const getStatusBadge = (status) => {
    const statusConfig = {
      'todo': { variant: 'default', label: 'To Do', icon: ListBulletIcon },
      'in-progress': { variant: 'primary', label: 'In Progress', icon: ClockIcon },
      'completed': { variant: 'success', label: 'Completed', icon: CheckCircleIcon },
      'overdue': { variant: 'destructive', label: 'Overdue', icon: ExclamationCircleIcon }
    }
    
    const config = statusConfig[status] || statusConfig.todo
    const IconComponent = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    }
    return colors[priority] || colors.medium
  }

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'border-l-gray-400',
      'in-progress': 'border-l-blue-400',
      'completed': 'border-l-green-400',
      'overdue': 'border-l-red-400'
    }
    return colors[status] || colors.todo
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (dueDate, status) => {
    if (status === 'completed') return false
    return new Date(dueDate) < new Date()
  }

  // Task statistics
  const taskStats = {
    total: Array.isArray(tasks) ? tasks.length : 0,
    completed: Array.isArray(tasks) ? tasks.filter(t => t && t.status === 'completed').length : 0,
    inProgress: Array.isArray(tasks) ? tasks.filter(t => t && t.status === 'in-progress').length : 0,
    overdue: Array.isArray(tasks) ? tasks.filter(t => t && (t.status === 'overdue' || isOverdue(t.dueDate, t.status))).length : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.h1 
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ListBulletIcon className="h-6 md:h-8 w-6 md:w-8 mr-2 md:mr-3 text-primary-600" />
            Tasks
          </motion.h1>
          <motion.p 
            className="text-sm md:text-base text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Manage and track individual tasks across all projects
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full md:w-auto"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Task</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Tasks', value: taskStats.total, color: 'bg-blue-500' },
          { label: 'In Progress', value: taskStats.inProgress, color: 'bg-yellow-500' },
          { label: 'Completed', value: taskStats.completed, color: 'bg-green-500' },
          { label: 'Overdue', value: taskStats.overdue, color: 'bg-red-500' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="p-3 md:p-4">
              <div className="flex items-center">
                <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${stat.color} mr-2 md:mr-3 flex-shrink-0`}></div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{stat.label}</p>
                  <p className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus-ring focus:border-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus-ring focus:border-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus-ring focus:border-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            className="group"
          >
            <Card className={`p-6 hover:shadow-lg transition-all duration-300 border-l-4 ${getStatusColor(task.status)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Task Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {task.project?.name || task.projectName || 'Unknown Project'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(task.status)}
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority || 'medium')}`}>
                        {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)}
                      </div>
                    </div>
                  </div>

                  {/* Task Description */}
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {task.description}
                  </p>

                  {/* Task Progress (for in-progress tasks) */}
                  {task.status === 'in-progress' && task.progress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-gray-600 dark:text-gray-400">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Task Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>Assigned to: {task.assignedTo.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span className={isOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : ''}>
                        Due: {formatDate(task.dueDate)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{task.actualHours}h / {task.estimatedHours}h</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  {/* Status Update Buttons */}
                  {task.status !== 'completed' && (
                    <div className="flex space-x-1">
                      {task.status === 'todo' && (
                        <button
                          onClick={() => handleStatusUpdate(task.id, 'in-progress')}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                          title="Start Task"
                        >
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'completed')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        title="Mark Complete"
                      >
                        Complete
                      </button>
                    </div>
                  )}

                  {/* Edit/Delete Buttons */}
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                      title="Edit Task"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Task"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <ListBulletIcon />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No tasks found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new task.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowCreateModal(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              New Task
            </Button>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows="3"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project
                  </label>
                  <select
                    required
                    value={newTask.projectId}
                    onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Project</option>
                    {Array.isArray(projects) ? projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name || project.title || 'Untitled Project'}
                      </option>
                    )) : null}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Hours"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assign To
                </label>
                <input
                  type="text"
                  required
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter assignee name"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Task
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Task</h2>
            <form onSubmit={handleEditTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({...selectedTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows="3"
                  value={selectedTask.description}
                  onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => setSelectedTask({...selectedTask, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => setSelectedTask({...selectedTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedTask.dueDate}
                    onChange={(e) => setSelectedTask({...selectedTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={selectedTask.estimatedHours}
                    onChange={(e) => setSelectedTask({...selectedTask, estimatedHours: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              {selectedTask.status === 'in-progress' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedTask.progress || 0}
                    onChange={(e) => setSelectedTask({...selectedTask, progress: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Actual Hours Spent
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={selectedTask.actualHours || 0}
                  onChange={(e) => setSelectedTask({...selectedTask, actualHours: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update Task
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Tasks