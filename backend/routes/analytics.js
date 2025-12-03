const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { timeframe = 30 } = req.query;

    // Calculate date range
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    // Get user's projects
    const userProjects = await Project.find({
      $or: [
        { 'members.userId': userId },
        { instructor: userId }
      ]
    });

    const projectIds = userProjects.map(p => p._id);

    // Projects statistics
    const totalProjects = userProjects.length;
    const activeProjects = userProjects.filter(p => p.status === 'active').length;
    const completedProjects = userProjects.filter(p => p.status === 'completed').length;

    // Tasks statistics
    const userTasks = await Task.find({
      $or: [
        { assignedTo: userId },
        { createdBy: userId },
        { projectId: { $in: projectIds } }
      ]
    });

    const totalTasks = userTasks.length;
    const pendingTasks = userTasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = userTasks.filter(t => t.status === 'in-progress').length;
    const completedTasks = userTasks.filter(t => t.status === 'completed').length;
    const overdueTasks = userTasks.filter(t => {
      if (t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    // Collaborations (unique users in user's projects)
    const allMembers = new Set();
    userProjects.forEach(project => {
      project.members.forEach(member => {
        if (member.userId.toString() !== userId.toString()) {
          allMembers.add(member.userId.toString());
        }
      });
      if (project.instructor && project.instructor.toString() !== userId.toString()) {
        allMembers.add(project.instructor.toString());
      }
    });

    // Notifications statistics
    const totalNotifications = await Notification.countDocuments({ userId });
    const unreadNotifications = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });

    // Activity statistics (timeframe)
    const recentActivities = await Activity.countDocuments({
      projectId: { $in: projectIds },
      createdAt: { $gte: daysAgo }
    });

    // Weekly activity breakdown for charts
    const weeklyActivity = await Activity.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Task completion trend
    const taskCompletionTrend = await Task.aggregate([
      {
        $match: {
          $or: [
            { assignedTo: userId },
            { createdBy: userId },
            { projectId: { $in: projectIds } }
          ],
          updatedAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$updatedAt"
              }
            },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Performance metrics
    const performanceMetrics = {
      projectCompletionRate: totalProjects > 0 ? (completedProjects / totalProjects * 100).toFixed(1) : 0,
      taskEfficiency: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
      collaborationScore: allMembers.size > 0 ? Math.min((allMembers.size / 10 * 100), 100).toFixed(1) : 0,
      onTimeDelivery: totalTasks > 0 ? ((totalTasks - overdueTasks) / totalTasks * 100).toFixed(1) : 0
    };

    // Additional statistics for instructors/admins
    let adminStats = {};
    if (userRole === 'instructor' || userRole === 'admin') {
      const totalUsers = await User.countDocuments({ isActive: true });
      const totalSystemProjects = await Project.countDocuments();
      const totalSystemTasks = await Task.countDocuments();
      const totalComments = await Comment.countDocuments();

      adminStats = {
        systemOverview: {
          totalUsers,
          totalProjects: totalSystemProjects,
          totalTasks: totalSystemTasks,
          totalComments
        }
      };
    }

    // Response data structure
    const analyticsData = {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        pending: totalProjects - activeProjects - completedProjects
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks
      },
      collaborations: {
        total: allMembers.size,
        activeProjects: activeProjects
      },
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications,
        read: totalNotifications - unreadNotifications
      },
      activity: {
        lastPeriod: recentActivities,
        projectsWithActivity: projectIds.length,
        weeklyBreakdown: weeklyActivity,
        timeframe: parseInt(timeframe)
      },
      performance: performanceMetrics,
      trends: {
        taskCompletion: taskCompletionTrend
      },
      ...adminStats
    };

    res.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.get('/projects/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    // Check if user has access to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const hasAccess = project.members.some(member => 
      member.userId.toString() === userId.toString()
    ) || project.instructor.toString() === userId.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get project tasks
    const projectTasks = await Task.find({ projectId });
    const projectComments = await Comment.find({ 
      taskId: { $in: projectTasks.map(t => t._id) }
    });
    const projectActivities = await Activity.find({ projectId })
      .sort({ createdAt: -1 })
      .limit(20);

    const projectAnalytics = {
      project: {
        title: project.title,
        status: project.status,
        progress: project.progress,
        memberCount: project.members.length
      },
      tasks: {
        total: projectTasks.length,
        completed: projectTasks.filter(t => t.status === 'completed').length,
        inProgress: projectTasks.filter(t => t.status === 'in-progress').length,
        pending: projectTasks.filter(t => t.status === 'pending').length
      },
      engagement: {
        totalComments: projectComments.length,
        recentActivities: projectActivities.length,
        lastActivity: projectActivities[0]?.createdAt || null
      }
    };

    res.json({
      success: true,
      data: projectAnalytics
    });

  } catch (error) {
    console.error('Project analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project analytics'
    });
  }
});

// @desc    Get team analytics and collaboration insights
// @route   GET /api/analytics/team
// @access  Private
router.get('/team', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeframe = 30 } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));
    
    // Get user's projects
    const userProjects = await Project.find({
      $or: [
        { 'members.userId': userId },
        { instructor: userId }
      ]
    }).populate('members.userId', 'name email avatar')
      .populate('instructor', 'name email avatar');
    
    // Team activity analysis
    const teamStats = {
      totalCollaborators: 0,
      activeCollaborators: 0,
      projectsByTeamSize: {},
      collaborationFrequency: {},
      topCollaborators: []
    };
    
    const collaboratorMap = new Map();
    
    userProjects.forEach(project => {
      const teamSize = project.members.length + (project.instructor ? 1 : 0);
      teamStats.projectsByTeamSize[teamSize] = (teamStats.projectsByTeamSize[teamSize] || 0) + 1;
      
      project.members.forEach(member => {
        if (member.userId._id.toString() !== userId.toString()) {
          const collaboratorId = member.userId._id.toString();
          if (collaboratorMap.has(collaboratorId)) {
            collaboratorMap.set(collaboratorId, {
              ...collaboratorMap.get(collaboratorId),
              projectCount: collaboratorMap.get(collaboratorId).projectCount + 1
            });
          } else {
            collaboratorMap.set(collaboratorId, {
              user: member.userId,
              projectCount: 1,
              role: member.role
            });
          }
        }
      });
    });
    
    teamStats.totalCollaborators = collaboratorMap.size;
    teamStats.topCollaborators = Array.from(collaboratorMap.values())
      .sort((a, b) => b.projectCount - a.projectCount)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: teamStats
    });
    
  } catch (error) {
    console.error('Team analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team analytics'
    });
  }
});

// @desc    Get productivity insights
// @route   GET /api/analytics/productivity
// @access  Private
router.get('/productivity', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeframe = 30 } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));
    
    // Task completion patterns by day of week
    const taskCompletionPattern = await Task.aggregate([
      {
        $match: {
          $or: [
            { assignedTo: userId },
            { createdBy: userId }
          ],
          status: 'completed',
          updatedAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$updatedAt' },
          count: { $sum: 1 },
          avgHours: { $avg: '$estimatedHours' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Monthly progress tracking
    const monthlyProgress = await Task.aggregate([
      {
        $match: {
          $or: [
            { assignedTo: userId },
            { createdBy: userId }
          ],
          createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 3 months
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Priority distribution
    const priorityDistribution = await Task.aggregate([
      {
        $match: {
          $or: [
            { assignedTo: userId },
            { createdBy: userId }
          ]
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        weeklyPattern: taskCompletionPattern,
        monthlyProgress: monthlyProgress,
        priorityDistribution: priorityDistribution,
        timeframe: parseInt(timeframe)
      }
    });
    
  } catch (error) {
    console.error('Productivity analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch productivity analytics'
    });
  }
});

module.exports = router;