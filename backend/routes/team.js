const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const router = express.Router();

router.get('/members', auth, async (req, res) => {
  try {
    const { search, department, role } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query.department = department;
    }

    if (role) {
      query.role = role;
    }

    const members = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ name: 1 })
      .limit(50);

    res.json({
      success: true,
      count: members.length,
      data: {
        members
      }
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members'
    });
  }
});

router.get('/study-groups', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find projects where user is a member or instructor
    const groups = await Project.find({
      $or: [
        { 'members.userId': userId },
        { instructor: userId }
      ]
    })
    .populate('instructor', 'name email avatar')
    .populate('members.userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json({
      success: true,
      count: groups.length,
      data: {
        groups
      }
    });
  } catch (error) {
    console.error('Get study groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch study groups'
    });
  }
});

// @desc    Get team activities
// @route   GET /api/team/activities
// @access  Private
router.get('/activities', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Get projects where user is involved
    const userProjects = await Project.find({
      $or: [
        { 'members.userId': userId },
        { instructor: userId }
      ]
    }).select('_id');
    
    const projectIds = userProjects.map(p => p._id);
    
    // Get activities for these projects
    const activities = await Activity.find({
      projectId: { $in: projectIds }
    })
    .populate('userId', 'name email avatar')
    .populate('projectId', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    res.json({
      success: true,
      count: activities.length,
      data: {
        activities
      }
    });
  } catch (error) {
    console.error('Get team activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team activities'
    });
  }
});

router.post('/study-groups', auth, async (req, res) => {
  try {
    const { title, description, courseCode, deadline, tags, color, memberIds = [] } = req.body;

    // Validate required fields
    if (!title || !description || !courseCode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, courseCode'
      });
    }

    const project = new Project({
      title,
      description,
      courseCode,
      instructor: req.user._id,
      deadline,
      tags: tags || [],
      color: color || '#3B82F6',
      members: [
        {
          userId: req.user._id,
          role: 'owner',
          joinedAt: new Date()
        }
      ]
    });

    // Add additional members if provided
    if (memberIds.length > 0) {
      const additionalMembers = memberIds.map(memberId => ({
        userId: memberId,
        role: 'member',
        joinedAt: new Date()
      }));
      project.members.push(...additionalMembers);
    }

    const savedProject = await project.save();
    const populatedProject = await Project.findById(savedProject._id)
      .populate('instructor', 'name email avatar')
      .populate('members.userId', 'name email avatar');

    // Create activity log
    await new Activity({
      userId: req.user._id,
      projectId: savedProject._id,
      action: 'create_project',
      description: `Created study group "${title}"`
    }).save();

    res.status(201).json({
      success: true,
      data: populatedProject
    });
  } catch (error) {
    console.error('Create study group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create study group'
    });
  }
});

module.exports = router;