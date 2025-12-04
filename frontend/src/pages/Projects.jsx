import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Card, Button, Badge, Avatar } from '../components/ui'
import { AuthContext } from '../contexts/AuthContext'
import api from '../services/api'

const Projects = () => {
  const { user } = useContext(AuthContext)
  const [projects, setProjects] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    category: '',
    dueDate: '',
    priority: 'medium',
    status: 'planning',
    progress: 0
  })

  // Fetch projects from API
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      console.log('Fetching projects from API...')
      const response = await api.get('/projects')
      console.log('Projects API response:', response.data)
      
      // Handle different API response structures
      const projectsData = response.data?.data || response.data?.projects || response.data || []
      console.log('Extracted projects data:', projectsData)
      console.log('Is array?', Array.isArray(projectsData))
      
      // Map database fields to frontend expected fields
      const mappedProjects = Array.isArray(projectsData) ? projectsData.map(project => ({
        ...project,
        id: project._id || project.id,
        name: project.title || project.name || 'Untitled Project',
        category: project.courseCode || project.category || '',
        dueDate: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
        progress: project.progress || 0,
        priority: project.priority || 'medium',
        status: project.status || 'active',
        description: project.description || '',
        members: project.members || []
      })) : []
      
      setProjects(mappedProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
      console.error('Error details:', error.response?.data)
      // Fallback to demo data for development
      setProjects(Array.isArray(demoProjects) ? demoProjects : [])
    } finally {
      setLoading(false)
    }
  }

  // Demo data for development
  const demoProjects = [
    {
      id: 1,
      name: 'School Management System',
      description: 'Comprehensive platform for managing students, teachers, and academic activities',
      status: 'active',
      progress: 75,
      members: [
        { name: 'John Teacher', avatar: null, role: 'teacher' },
        { name: 'Sarah Student', avatar: null, role: 'student' },
        { name: 'Mike Admin', avatar: null, role: 'admin' }
      ],
      dueDate: '2025-12-15',
      category: 'Education Technology',
      priority: 'high'
    },
    {
      id: 2,
      name: 'Digital Library Project',
      description: 'Online library system with book cataloging and borrowing features',
      status: 'planning',
      progress: 25,
      members: [
        { name: 'Library Staff', avatar: null, role: 'teacher' },
        { name: 'Tech Student', avatar: null, role: 'student' }
      ],
      dueDate: '2025-12-30',
      category: 'Library Management',
      priority: 'medium'
    },
    {
      id: 3,
      name: 'Student Assessment Portal',
      description: 'Digital platform for creating and managing student assessments and grades',
      status: 'completed',
      progress: 100,
      members: [
        { name: 'Grade Coordinator', avatar: null, role: 'teacher' },
        { name: 'Assessment Team', avatar: null, role: 'teacher' }
      ],
      dueDate: '2025-11-30',
      category: 'Academic Assessment',
      priority: 'high'
    },
    {
      id: 4,
      name: 'Campus Events App',
      description: 'Mobile application for managing and promoting campus events',
      status: 'active',
      progress: 60,
      members: [
        { name: 'Event Coordinator', avatar: null, role: 'teacher' },
        { name: 'Student Council', avatar: null, role: 'student' },
        { name: 'Marketing Team', avatar: null, role: 'student' }
      ],
      dueDate: '2025-12-20',
      category: 'Campus Life',
      priority: 'medium'
    }
  ]

  // CRUD Operations
  const handleCreateProject = async (e) => {
    e.preventDefault()
    
    // Check if user is authenticated
    if (!user) {
      alert('Please log in to create projects')
      return
    }
    
    console.log('Current user when creating project:', user)
    console.log('User role:', user.role)
    console.log('User permissions check - authenticated:', !!user)
    console.log('Token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing')
    
    // Test authentication before creating project
    try {
      const authTest = await api.get('/auth/profile');
      console.log('Auth test successful:', authTest.data);
    } catch (authError) {
      console.error('Auth test failed:', authError);
      alert('Authentication failed. Please log in again.');
      return;
    }
    
    try {
      const projectData = {
        title: newProject.name.trim(),
        description: newProject.description.trim(),
        courseCode: newProject.category.trim() || undefined,
        deadline: newProject.dueDate ? new Date(newProject.dueDate).toISOString() : undefined,
        status: newProject.status,
        progress: newProject.progress || 0,
        priority: newProject.priority,
        tags: [],
        color: '#3B82F6'
      };
      
      console.log('Creating project with data:', projectData);
      
      // Validate required fields
      if (!projectData.title || projectData.title.length < 3) {
        alert('Project title must be at least 3 characters long');
        return;
      }
      
      const response = await api.post('/projects', projectData)
      
      console.log('Project creation response:', response.data);
      
      // Handle the response structure from the backend
      const newProjectData = response.data?.data || response.data
      setProjects(Array.isArray(projects) ? [...projects, newProjectData] : [newProjectData])
      setShowCreateModal(false)
      setNewProject({ name: '', description: '', category: '', dueDate: '', priority: 'medium', status: 'planning', progress: 0 })
    } catch (error) {
      console.error('Error creating project:', error)
      console.error('Error response:', error.response?.data)
      
      // Handle different error types
      if (error.response?.status === 403) {
        alert('You do not have permission to create projects. Please check your account permissions.')
        return
      } else if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.')
        return
      } else if (error.response?.status === 400) {
        // Show specific validation errors
        const errorData = error.response?.data
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(err => err.msg || err.message || err).join('\n')
          alert(`Validation Error:\n${errorMessages}`)
        } else {
          alert(`Error creating project: ${errorData?.message || 'Invalid data provided'}`)
        }
        return
      }
      
      // Demo fallback for development
      const newProj = {
        id: Date.now(),
        ...newProject,
        status: newProject.status || 'planning',
        progress: newProject.progress || 0,
        members: [{ name: user?.name || 'Current User', avatar: null, role: user?.role || 'student' }]
      }
      setProjects(Array.isArray(projects) ? [...projects, newProj] : [newProj])
      setShowCreateModal(false)
      setNewProject({ name: '', description: '', category: '', dueDate: '', priority: 'medium', status: 'planning', progress: 0 })
    }
  }

  const handleEditProject = async (e) => {
    e.preventDefault()
    try {
      // Map frontend fields back to backend field names
      const projectUpdateData = {
        title: selectedProject.name || selectedProject.title,
        description: selectedProject.description,
        courseCode: selectedProject.category,
        deadline: selectedProject.dueDate,
        priority: selectedProject.priority,
        status: selectedProject.status
      }
      
      console.log('Sending project update:', projectUpdateData)
      const response = await api.put(`/projects/${selectedProject.id || selectedProject._id}`, projectUpdateData)
      
      // Update the local projects array with the response
      const updatedProject = response.data?.data || response.data
      setProjects(Array.isArray(projects) ? projects.map(p => 
        (p.id === selectedProject.id || p._id === selectedProject._id) ? {
          ...updatedProject,
          id: updatedProject._id || updatedProject.id,
          name: updatedProject.title || updatedProject.name,
          category: updatedProject.courseCode || updatedProject.category,
          dueDate: updatedProject.deadline ? new Date(updatedProject.deadline).toISOString().split('T')[0] : ''
        } : p
      ) : [updatedProject])
      
      setShowEditModal(false)
      setSelectedProject(null)
    } catch (error) {
      console.error('Error updating project:', error)
      // Demo fallback
      setProjects(Array.isArray(projects) ? projects.map(p => 
        (p.id === selectedProject.id || p._id === selectedProject._id) ? selectedProject : p
      ) : [selectedProject])
      setShowEditModal(false)
      setSelectedProject(null)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      await api.delete(`/projects/${projectId}`)
      setProjects(Array.isArray(projects) ? projects.filter(p => p.id !== projectId) : [])
    } catch (error) {
      console.error('Error deleting project:', error)
      // Demo fallback
      setProjects(Array.isArray(projects) ? projects.filter(p => p.id !== projectId) : [])
    }
  }

  const openEditModal = (project) => {
    setSelectedProject({ ...project })
    setShowEditModal(true)
  }

  const filteredProjects = Array.isArray(projects) ? projects.filter(project => {
    if (!project) return false
    const projectName = project.name || ''
    const projectDescription = project.description || ''
    const matchesSearch = projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projectDescription.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesFilter
  }) : []

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'primary', label: 'Active' },
      planning: { variant: 'warning', label: 'Planning' },
      completed: { variant: 'success', label: 'Completed' },
      onhold: { variant: 'default', label: 'On Hold' }
    }
    
    const config = statusConfig[status] || statusConfig.active
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    }
    return colors[priority] || colors.medium
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
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
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Projects
          </motion.h1>
          <motion.p 
            className="text-sm md:text-base text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Manage and track your collaborative projects
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
            <span>New Project</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus-ring focus:border-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <FunnelIcon className="h-4 md:h-5 w-4 md:w-5 text-gray-500 dark:text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm md:text-base focus-ring focus:border-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white min-w-[120px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="completed">Completed</option>
            <option value="onhold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              y: -8,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="group"
          >
            <Card className="p-4 md:p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="space-y-3 md:space-y-4 relative z-10">
                {/* Project Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <motion.h3 
                      className="text-base md:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate"
                      whileHover={{ x: 4 }}
                    >
                      {project.name}
                    </motion.h3>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {project.category}
                    </p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 border ${getPriorityColor(project.priority || 'medium')}`}>
                      {(project.priority || 'medium').charAt(0).toUpperCase() + (project.priority || 'medium').slice(1)} Priority
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2 ml-2">
                    {getStatusBadge(project.status)}
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(project)
                        }}
                        className="p-1.5 md:p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Edit Project"
                      >
                        <PencilIcon className="h-3 w-3 md:h-4 md:w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProject(project.id)
                        }}
                        className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Project"
                      >
                        <TrashIcon className="h-3 w-3 md:h-4 md:w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 text-xs md:text-sm line-clamp-2">
                  {project.description}
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progress
                    </span>
                    <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Team Members */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Team:
                    </span>
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((member, idx) => (
                        <Avatar
                          key={idx}
                          src={member.avatar}
                          alt={member.name}
                          size="sm"
                          className="border-2 border-white dark:border-gray-800"
                        />
                      ))}
                      {project.members.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            +{project.members.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Due {new Date(project.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <FolderIcon />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No projects found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new project.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowCreateModal(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white touch-manipulation"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows="3"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white touch-manipulation resize-none"
                  placeholder="Enter project description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Code
                </label>
                <input
                  type="text"
                  value={newProject.category}
                  onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white touch-manipulation"
                  placeholder="e.g., CS101, IT250, WEB301"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white touch-manipulation"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="onhold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Initial Progress (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newProject.progress}
                  onChange={(e) => setNewProject({...newProject, progress: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={newProject.dueDate}
                  onChange={(e) => setNewProject({...newProject, dueDate: e.target.value})}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white touch-manipulation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white touch-manipulation"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                >
                  Create Project
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">Edit Project</h2>
            <form onSubmit={handleEditProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={selectedProject.name}
                  onChange={(e) => setSelectedProject({...selectedProject, name: e.target.value})}
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
                  value={selectedProject.description}
                  onChange={(e) => setSelectedProject({...selectedProject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={selectedProject.category}
                  onChange={(e) => setSelectedProject({...selectedProject, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., CS101, IT250, WEB301"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={selectedProject.status}
                  onChange={(e) => setSelectedProject({...selectedProject, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="onhold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Progress (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={selectedProject.progress}
                  onChange={(e) => setSelectedProject({...selectedProject, progress: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={selectedProject.dueDate}
                  onChange={(e) => setSelectedProject({...selectedProject, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={selectedProject.priority}
                  onChange={(e) => setSelectedProject({...selectedProject, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
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
                  Update Project
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Projects