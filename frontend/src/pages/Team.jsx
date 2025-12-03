import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { 
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  UserIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  PaperClipIcon,
  StarIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { Card, Button, Badge, Avatar } from '../components/ui'
import { AuthContext } from '../contexts/AuthContext'
import api from '../services/api'

const Team = () => {
  const { user } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('members')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState([])
  const [studyGroups, setStudyGroups] = useState([])
  const [activities, setActivities] = useState([])

  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      const [membersRes, groupsRes, activitiesRes] = await Promise.all([
        api.get('/team/members'),
        api.get('/team/study-groups'),
        api.get('/team/activities')
      ])
      
      // Handle different API response structures and ensure arrays
      const membersData = membersRes.data?.data?.members || membersRes.data?.members || membersRes.data || []
      const groupsData = groupsRes.data?.data?.groups || groupsRes.data?.groups || groupsRes.data || []
      const activitiesData = activitiesRes.data?.data?.activities || activitiesRes.data?.activities || activitiesRes.data || []
      
      setTeamMembers(Array.isArray(membersData) ? membersData : [])
      setStudyGroups(Array.isArray(groupsData) ? groupsData : [])
      setActivities(Array.isArray(activitiesData) ? activitiesData : [])
    } catch (error) {
      console.error('Error fetching team data:', error)
      // Fallback to demo data
      setTeamMembers(Array.isArray(demoMembers) ? demoMembers : [])
      setStudyGroups(Array.isArray(demoStudyGroups) ? demoStudyGroups : [])
      setActivities(Array.isArray(demoActivities) ? demoActivities : [])
      
      // Optional: Show demo mode notification (only once)
      if (!localStorage.getItem('demoModeNotified')) {
        setTimeout(() => {
          alert('Running in demo mode - using sample data (backend not available)')
          localStorage.setItem('demoModeNotified', 'true')
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  // Demo data for school collaboration
  const demoMembers = [
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@academicCity.edu.gh',
      role: 'teacher',
      department: 'Computer Science',
      specialization: 'Web Development, Database Systems',
      joinedAt: '2023-01-15',
      avatar: null,
      isOnline: true,
      stats: {
        projectsSupervised: 12,
        studentsGuided: 45,
        coursesTeaching: 3
      }
    },
    {
      id: 2,
      name: 'John Student',
      email: 'john.student@student.academicCity.edu.gh',
      role: 'student',
      department: 'Computer Science',
      yearLevel: 'Level 300',
      gpa: 3.67,
      joinedAt: '2023-09-01',
      avatar: null,
      isOnline: true,
      stats: {
        projectsCompleted: 8,
        tasksCompleted: 24,
        collaborations: 12
      }
    },
    {
      id: 3,
      name: 'Mary Asante',
      email: 'mary.asante@student.academicCity.edu.gh',
      role: 'student',
      department: 'Computer Science',
      yearLevel: 'Level 300',
      gpa: 3.89,
      joinedAt: '2023-09-01',
      avatar: null,
      isOnline: false,
      stats: {
        projectsCompleted: 10,
        tasksCompleted: 32,
        collaborations: 15
      }
    },
    {
      id: 4,
      name: 'Prof. Kwame Nkrumah',
      email: 'kwame.nkrumah@academicCity.edu.gh',
      role: 'teacher',
      department: 'Computer Science',
      specialization: 'Machine Learning, Data Science',
      joinedAt: '2020-08-01',
      avatar: null,
      isOnline: false,
      stats: {
        projectsSupervised: 25,
        studentsGuided: 120,
        coursesTeaching: 2
      }
    },
    {
      id: 5,
      name: 'Grace Mensah',
      email: 'grace.mensah@student.academicCity.edu.gh',
      role: 'student',
      department: 'Information Technology',
      yearLevel: 'Level 400',
      gpa: 3.92,
      joinedAt: '2022-09-01',
      avatar: null,
      isOnline: true,
      stats: {
        projectsCompleted: 15,
        tasksCompleted: 45,
        collaborations: 20
      }
    }
  ]

  const demoStudyGroups = [
    {
      id: 1,
      name: 'Web Development Masters',
      description: 'Advanced web development study group focusing on modern frameworks and best practices',
      members: 12,
      category: 'Technical',
      meetingTime: 'Wednesdays, 4:00 PM',
      location: 'CS Lab 2',
      leader: {
        name: 'Dr. Sarah Wilson',
        role: 'teacher'
      },
      isActive: true,
      nextMeeting: '2024-12-25T16:00:00Z'
    },
    {
      id: 2,
      name: 'Data Structures & Algorithms',
      description: 'Study group for mastering DSA concepts and coding interview preparation',
      members: 18,
      category: 'Academic',
      meetingTime: 'Mondays & Fridays, 6:00 PM',
      location: 'Library Study Room A',
      leader: {
        name: 'Grace Mensah',
        role: 'student'
      },
      isActive: true,
      nextMeeting: '2024-12-23T18:00:00Z'
    },
    {
      id: 3,
      name: 'Machine Learning Research Group',
      description: 'Research-focused group exploring ML applications in real-world problems',
      members: 8,
      category: 'Research',
      meetingTime: 'Thursdays, 2:00 PM',
      location: 'AI Lab',
      leader: {
        name: 'Prof. Kwame Nkrumah',
        role: 'teacher'
      },
      isActive: true,
      nextMeeting: '2024-12-26T14:00:00Z'
    },
    {
      id: 4,
      name: 'Final Year Project Support',
      description: 'Support group for final year students working on capstone projects',
      members: 25,
      category: 'Support',
      meetingTime: 'Saturdays, 10:00 AM',
      location: 'Online via Zoom',
      leader: {
        name: 'Dr. Sarah Wilson',
        role: 'teacher'
      },
      isActive: true,
      nextMeeting: '2024-12-28T10:00:00Z'
    }
  ]

  const demoActivities = [
    {
      id: 1,
      type: 'study_session',
      title: 'React Hooks Deep Dive',
      description: 'Intensive session on advanced React hooks patterns',
      organizer: 'Dr. Sarah Wilson',
      participants: 8,
      date: '2024-12-25T16:00:00Z',
      location: 'CS Lab 2',
      status: 'upcoming'
    },
    {
      id: 2,
      type: 'project_review',
      title: 'Mid-semester Project Presentations',
      description: 'Students present their project progress for feedback',
      organizer: 'Prof. Kwame Nkrumah',
      participants: 15,
      date: '2024-12-27T14:00:00Z',
      location: 'Main Auditorium',
      status: 'upcoming'
    },
    {
      id: 3,
      type: 'workshop',
      title: 'Git & GitHub Collaboration Workshop',
      description: 'Hands-on workshop on version control best practices',
      organizer: 'Grace Mensah',
      participants: 20,
      date: '2024-12-23T15:00:00Z',
      location: 'Computer Lab 1',
      status: 'completed'
    },
    {
      id: 4,
      type: 'mentorship',
      title: 'Career Guidance Session',
      description: 'One-on-one mentorship session with industry professionals',
      organizer: 'Dr. Sarah Wilson',
      participants: 5,
      date: '2024-12-24T10:00:00Z',
      location: 'Faculty Office',
      status: 'ongoing'
    }
  ]

  const getRoleBadge = (role) => {
    const config = {
      teacher: { color: 'bg-green-100 text-green-800 border-green-200', icon: AcademicCapIcon },
      student: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: UserIcon },
      admin: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: StarIcon }
    }
    const roleConfig = config[role] || config.student
    const IconComponent = roleConfig.icon
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${roleConfig.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </div>
    )
  }

  const getActivityIcon = (type) => {
    const icons = {
      study_session: BookOpenIcon,
      project_review: ChartBarIcon,
      workshop: UserGroupIcon,
      mentorship: ChatBubbleLeftRightIcon
    }
    return icons[type] || CalendarDaysIcon
  }

  const getActivityColor = (status) => {
    const colors = {
      upcoming: 'border-l-blue-400 bg-blue-50',
      ongoing: 'border-l-green-400 bg-green-50',
      completed: 'border-l-gray-400 bg-gray-50'
    }
    return colors[status] || colors.upcoming
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredMembers = Array.isArray(teamMembers) ? teamMembers.filter(member =>
    member && member.name && member.department &&
    (member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : []

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
            <UserGroupIcon className="h-6 md:h-8 w-6 md:w-8 mr-2 md:mr-3 text-primary-600" />
            Team Collaboration
          </motion.h1>
          <motion.p 
            className="text-sm md:text-base text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Connect, collaborate, and learn together with teachers and students
          </motion.p>
        </div>
      </motion.div>

      {/* Tabs - Mobile responsive with horizontal scroll */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto scrollbar-hide">
          {[
            { id: 'members', label: 'Members', count: teamMembers.length },
            { id: 'groups', label: 'Groups', count: studyGroups.length },
            { id: 'activities', label: 'Activities', count: activities.length }
          ].map((tab, index) => (
            <button
              key={tab.id || `tab-${index}`}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.charAt(0)}</span>
              <span className="ml-1">({tab.count})</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Team Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4 md:space-y-6">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm md:text-base"
            />
          </div>

          {/* Members Grid - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id || member._id || `member-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar src={member.avatar} alt={member.name} size="lg" />
                        {member.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">{member.name}</h3>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{member.department}</p>
                        {member.role === 'student' && (
                          <p className="text-xs text-gray-500">{member.yearLevel} • GPA: {member.gpa}</p>
                        )}
                        {member.role === 'teacher' && (
                          <p className="text-xs text-gray-500 truncate">{member.specialization}</p>
                        )}
                      </div>
                    </div>
                    {getRoleBadge(member.role)}
                  </div>

                  {/* Stats - Compact on mobile */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    {member.role === 'student' ? (
                      <>
                        <div>
                          <p className="text-sm md:text-lg font-semibold text-primary-600">{member.stats?.projectsCompleted || 0}</p>
                          <p className="text-xs text-gray-500">Projects</p>
                        </div>
                        <div>
                          <p className="text-sm md:text-lg font-semibold text-primary-600">{member.stats?.tasksCompleted || 0}</p>
                          <p className="text-xs text-gray-500">Tasks</p>
                        </div>
                        <div>
                          <p className="text-sm md:text-lg font-semibold text-primary-600">{member.stats?.collaborations || 0}</p>
                          <p className="text-xs text-gray-500">Collabs</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm md:text-lg font-semibold text-green-600">{member.stats?.projectsSupervised || 0}</p>
                          <p className="text-xs text-gray-500">Projects</p>
                        </div>
                        <div>
                          <p className="text-sm md:text-lg font-semibold text-green-600">{member.stats?.studentsGuided || 0}</p>
                          <p className="text-xs text-gray-500">Students</p>
                        </div>
                        <div>
                          <p className="text-sm md:text-lg font-semibold text-green-600">{member.stats?.coursesTeaching || 0}</p>
                          <p className="text-xs text-gray-500">Courses</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions - Stack on mobile */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Message</span>
                      <span className="sm:hidden">Chat</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <VideoCameraIcon className="h-4 w-4 mr-1" />
                      Meet
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Study Groups Tab */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Study Groups</h2>
            <Button className="flex items-center space-x-2 w-full sm:w-auto">
              <PlusIcon className="h-5 w-5" />
              <span>Create Group</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {studyGroups.map((group, index) => (
              <motion.div
                key={group.id || group._id || `group-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm md:text-base truncate">{group?.name || 'Unnamed Group'}</h3>
                      <Badge variant="outline" className="text-xs">{group?.category || 'General'}</Badge>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {typeof group?.members === 'number' ? group.members : Array.isArray(group?.members) ? group.members.length : 0}
                      </p>
                      <p className="text-xs text-gray-500">members</p>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{group?.description || 'No description available'}</p>

                  <div className="space-y-2 mb-4 text-xs md:text-sm">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 truncate">{group?.meetingTime || 'TBD'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 truncate">
                        Led by {group.leader?.name || 'Unknown'} ({group.leader?.role || 'Member'})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 truncate">
                        Next: {group?.nextMeeting ? formatDateTime(group.nextMeeting) : 'Not scheduled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button size="sm" className="flex-1">Join Group</Button>
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Recent Activities</h2>
            <Button className="flex items-center space-x-2 w-full sm:w-auto">
              <PlusIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Schedule Activity</span>
              <span className="sm:hidden">Schedule</span>
            </Button>
          </div>

          <div className="space-y-4">
            {activities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type)
              return (
                <motion.div
                  key={activity.id || activity._id || `activity-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-4 md:p-6 border-l-4 ${getActivityColor(activity.status)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 md:space-x-4 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm md:text-base truncate">{activity.title}</h3>
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{activity.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs md:text-sm text-gray-500">
                            <span className="truncate">
                              Organized by {typeof activity.organizer === 'string' ? activity.organizer : activity.organizer?.name || 'Unknown'}
                            </span>
                            <span>{activity.participants} participants</span>
                            <span className="truncate">{formatDateTime(activity.date)}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 truncate">{activity.location}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={activity.status === 'upcoming' ? 'primary' : 
                                activity.status === 'ongoing' ? 'success' : 'default'}
                        className="ml-2 flex-shrink-0"
                      >
                        <span className="hidden sm:inline">
                          {activity.status ? 
                            activity.status.charAt(0).toUpperCase() + activity.status.slice(1) : 
                            'Unknown'
                          }
                        </span>
                        <span className="sm:hidden">
                          {activity.status ? activity.status.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </Badge>
                    </div>

                    {activity.status === 'upcoming' && (
                      <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <Button size="sm" className="flex-1 sm:flex-none">Join Activity</Button>
                        <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                          <span className="hidden sm:inline">Add to Calendar</span>
                          <span className="sm:hidden">Calendar</span>
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Team