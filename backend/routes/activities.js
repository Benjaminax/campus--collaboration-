const express = require('express');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const Activity = require('../models/Activity');
const Project = require('../models/Project');
const router = express.Router();

// Helper function to check project membership
const checkProjectMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  
  return project.members.some(member => 
    member.userId.toString() === userId.toString()
  ) || project.instructor.toString() === userId.toString();
};

// @desc    Create a new activity
// @route   POST /api/activities
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { projectId, action, description, metadata = {} } = req.body;

    // Check if user is a member of the project
    const isMember = await checkProjectMembership(projectId, req.user._id);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const activity = new Activity({
      userId: req.user._id,
      projectId,
      action,
      description,
      metadata
    });

    const savedActivity = await activity.save();
    const populatedActivity = await Activity.findById(savedActivity._id)
      .populate('userId', 'name email avatar')
      .populate('projectId', 'title');

    res.status(201).json({
      success: true,
      data: populatedActivity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity'
    });
  }
});

// @desc    Get activities for a project
// @route   GET /api/activities/project/:projectId
// @access  Private
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 50, action, userId } = req.query;
    
    // Check if user is a member of the project
    const isMember = await checkProjectMembership(projectId, req.user._id);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const skip = (page - 1) * limit;
    let query = { projectId };
    
    if (action) {
      query.action = action;
    }
    
    if (userId) {
      query.userId = userId;
    }

    const activities = await Activity.find(query)
      .populate('userId', 'name email avatar')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalActivities = await Activity.countDocuments(query);

    res.json({
      success: true,
      count: activities.length,
      total: totalActivities,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalActivities / limit),
      data: activities
    });
  } catch (error) {
    console.error('Get project activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's recent activities
// @route   GET /api/activities/my-activities
// @access  Private
router.get('/my-activities', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, action } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { userId: req.user._id };
    
    if (action) {
      query.action = action;
    }

    const activities = await Activity.find(query)
      .populate('projectId', 'title color')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalActivities = await Activity.countDocuments(query);

    res.json({
      success: true,
      count: activities.length,
      total: totalActivities,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalActivities / limit),
      data: activities
    });
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get activity statistics for a project
// @route   GET /api/activities/project/:projectId/stats
// @access  Private
router.get('/project/:projectId/stats', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { timeframe = '7' } = req.query; // days
    
    // Check if user is a member of the project
    const isMember = await checkProjectMembership(projectId, req.user._id);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    const pipeline = [
      {
        $match: {
          projectId: mongoose.Types.ObjectId(projectId),
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const activityStats = await Activity.aggregate(pipeline);
    
    // Get most active users
    const userActivityPipeline = [
      {
        $match: {
          projectId: mongoose.Types.ObjectId(projectId),
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$user.name',
          avatar: '$user.avatar'
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ];

    const userStats = await Activity.aggregate(userActivityPipeline);

    res.json({
      success: true,
      data: {
        activityBreakdown: activityStats,
        mostActiveUsers: userStats,
        timeframe: parseInt(timeframe)
      }
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;