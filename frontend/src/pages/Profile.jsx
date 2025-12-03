import React, { useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { 
  UserCircleIcon,
  PencilIcon,
  CameraIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Card, Button, Badge, Avatar } from '../components/ui'
import { AuthContext } from '../contexts/AuthContext'
import api from '../services/api'

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    role: user?.role || 'student',
    department: user?.department || '',
    yearLevel: user?.yearLevel || '',
    skills: user?.skills || [],
    socialLinks: user?.socialLinks || {
      linkedin: '',
      github: '',
      twitter: ''
    }
  })
  const [newSkill, setNewSkill] = useState('')

  // Demo user data
  const defaultUser = {
    id: 1,
    name: 'John Student',
    email: 'john.student@academicCity.edu.gh',
    phone: '+233 20 123 4567',
    location: 'Accra, Ghana',
    bio: 'Computer Science student passionate about web development and collaborative learning. Always eager to work on exciting projects and learn new technologies.',
    role: 'student',
    department: 'Computer Science',
    yearLevel: 'Level 300',
    joinedAt: '2023-09-01',
    avatar: null,
    skills: ['React', 'JavaScript', 'Node.js', 'Python', 'Git', 'MongoDB', 'Tailwind CSS'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johnstudent',
      github: 'https://github.com/johnstudent',
      twitter: 'https://twitter.com/johnstudent'
    },
    stats: {
      projectsCompleted: 8,
      tasksCompleted: 24,
      collaborations: 12,
      hoursLogged: 156
    }
  }

  const userProfile = user || defaultUser

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      const response = await api.put('/users/profile', editedProfile)
      updateUser(response.data)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      // Demo fallback - just update the context
      updateUser({ ...user, ...editedProfile })
      setIsEditing(false)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !editedProfile.skills.includes(newSkill.trim())) {
      setEditedProfile({
        ...editedProfile,
        skills: [...editedProfile.skills, newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setEditedProfile({
      ...editedProfile,
      skills: editedProfile.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const handleCancel = () => {
    setEditedProfile({
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone || '',
      location: userProfile.location || '',
      bio: userProfile.bio || '',
      role: userProfile.role,
      department: userProfile.department || '',
      yearLevel: userProfile.yearLevel || '',
      skills: userProfile.skills || [],
      socialLinks: userProfile.socialLinks || { linkedin: '', github: '', twitter: '' }
    })
    setIsEditing(false)
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800 border-blue-200',
      teacher: 'bg-green-100 text-green-800 border-green-200',
      admin: 'bg-purple-100 text-purple-800 border-purple-200'
    }
    return colors[role] || colors.student
  }

  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
            className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Profile
          </motion.h1>
          <motion.p 
            className="text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Manage your personal information and preferences
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2"
            >
              <PencilIcon className="h-5 w-5" />
              <span>Edit Profile</span>
            </Button>
          ) : (
            <div className="flex space-x-3">
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <XMarkIcon className="h-5 w-5" />
                <span>Cancel</span>
              </Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <CheckCircleIcon className="h-5 w-5" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <Avatar 
                src={userProfile.avatar} 
                alt={userProfile.name}
                size="xl"
                className="mx-auto"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
                  <CameraIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                  className="w-full text-center text-xl font-semibold border-0 border-b-2 border-gray-200 focus:border-primary-500 bg-transparent outline-none"
                />
                <input
                  type="text"
                  value={editedProfile.bio}
                  onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                  placeholder="Bio"
                  className="w-full text-center text-gray-600 dark:text-gray-400 border-0 border-b border-gray-200 focus:border-primary-500 bg-transparent outline-none"
                />
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {userProfile.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {userProfile.bio}
                </p>
              </div>
            )}

            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(userProfile.role)}`}>
              <ShieldCheckIcon className="h-4 w-4 mr-1" />
              {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Projects</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{userProfile.stats?.projectsCompleted || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Tasks</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{userProfile.stats?.tasksCompleted || 0}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Details Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Contact Information */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <EnvelopeIcon className="h-5 w-5 mr-2 text-primary-600" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{userProfile.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{userProfile.phone || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{userProfile.location || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Member Since
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatJoinDate(userProfile.joinedAt || '2024-01-01')}
                </p>
              </div>
            </div>
          </Card>

          {/* Academic Information */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-primary-600" />
              Academic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.department}
                    onChange={(e) => setEditedProfile({...editedProfile, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{userProfile.department || 'Not specified'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year Level
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.yearLevel}
                    onChange={(e) => setEditedProfile({...editedProfile, yearLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Level</option>
                    <option value="Level 100">Level 100</option>
                    <option value="Level 200">Level 200</option>
                    <option value="Level 300">Level 300</option>
                    <option value="Level 400">Level 400</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Staff">Staff</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white">{userProfile.yearLevel || 'Not specified'}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BriefcaseIcon className="h-5 w-5 mr-2 text-primary-600" />
              Skills & Technologies
            </h4>
            
            {isEditing && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add a skill"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <Button onClick={handleAddSkill} size="sm">Add</Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(isEditing ? editedProfile.skills : userProfile.skills || []).map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 ${
                    isEditing ? 'pr-1' : ''
                  }`}
                >
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 p-1 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  )}
                </motion.div>
              ))}
              {(isEditing ? editedProfile.skills : userProfile.skills || []).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">No skills added yet</p>
              )}
            </div>
          </Card>

          {/* Social Links */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Social Links
            </h4>
            <div className="space-y-3">
              {['linkedin', 'github', 'twitter'].map((platform) => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                    {platform}
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editedProfile.socialLinks[platform]}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        socialLinks: {
                          ...editedProfile.socialLinks,
                          [platform]: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder={`https://${platform}.com/username`}
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {userProfile.socialLinks?.[platform] || 'Not provided'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile