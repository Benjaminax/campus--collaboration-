const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { validateProject, handleValidationErrors } = require('../middleware/validation');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const router = express.Router();

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Student/Instructor/Admin)
router.post('/', auth, authorize('student', 'instructor', 'admin'), validateProject, handleValidationErrors, async (req, res) => {
  try {
    console.log('Creating project with data:', req.body);
    console.log('User creating project:', req.user._id, req.user.name);
    
    const { title, description, courseCode, deadline, tags, color } = req.body;
    
    const project = new Project({
      title,
      description,
      courseCode,
      instructor: req.user._id, // Creator becomes instructor regardless of role
      deadline,
      tags: tags || [],
      color: color || '#3B82F6',
      members: [{
        userId: req.user._id,
        role: req.user.role === 'admin' ? 'owner' : 
              req.user.role === 'instructor' ? 'owner' : 'member',
        joinedAt: new Date()
      }]
    });

    await project.save();
    console.log('Project saved successfully:', project._id);
    
    await project.populate('instructor', 'name email');
    await project.populate('members.userId', 'name email avatar');

    // Log activity
    const activity = new Activity({
      projectId: project._id,
      userId: req.user._id,
      action: 'project_created',
      description: `created project "${title}"`
    });
    await activity.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Project with this title already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('Getting projects for user:', req.user._id, req.user.name);
    
    const { status, search } = req.query;
    let query = {
      $or: [
        { instructor: req.user._id },
        { 'members.userId': req.user._id }
      ]
    };

    console.log('Project query:', JSON.stringify(query, null, 2));

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query)
      .populate('instructor', 'name email')
      .populate('members.userId', 'name email avatar')
      .sort({ updatedAt: -1 });

    console.log(`Found ${projects.length} projects for user`);
    projects.forEach(p => console.log(`- ${p.title} (${p._id})`));

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('members.userId', 'name email avatar department');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is a member or instructor
    const isMember = project.members.some(member => 
      member.userId._id.toString() === req.user._id.toString()
    ) || project.instructor._id.toString() === req.user._id.toString();

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Owner/Instructor)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, name, description, status, deadline, dueDate, tags, color, courseCode, category, priority } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const isOwner = project.members.some(member => 
      member.userId.toString() === req.user._id.toString() && member.role === 'owner'
    );
    const isInstructor = project.instructor.toString() === req.user._id.toString();

    if (!isOwner && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateFields = {};
    // Handle both title and name fields
    if (title || name) updateFields.title = title || name;
    if (description !== undefined) updateFields.description = description;
    if (status) updateFields.status = status;
    // Handle both deadline and dueDate fields
    if (deadline || dueDate) updateFields.deadline = deadline || dueDate;
    // Handle both courseCode and category fields
    if (courseCode || category) updateFields.courseCode = courseCode || category;
    if (tags) updateFields.tags = tags;
    if (color) updateFields.color = color;
    if (priority) updateFields.priority = priority;

    console.log('Updating project with fields:', updateFields);

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('instructor', 'name email')
     .populate('members.userId', 'name email avatar');

    // Log activity
    const activity = new Activity({
      projectId: project._id,
      userId: req.user._id,
      action: 'project_updated',
      description: `updated project "${updatedProject.title}"`
    });
    await activity.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Owner/Instructor)
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const isOwner = project.members.some(member => 
      member.userId.toString() === req.user._id.toString() && member.role === 'owner'
    );
    const isInstructor = project.instructor.toString() === req.user._id.toString();

    if (!isOwner && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if user is already a member
    const existingMember = project.members.find(member => 
      member.userId.toString() === userId
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    project.members.push({
      userId,
      role,
      joinedAt: new Date()
    });

    await project.save();
    await project.populate('members.userId', 'name email avatar');

    // Create notification for new member
    const notification = new Notification({
      userId,
      type: 'project_invitation',
      title: 'Added to Project',
      message: `You have been added to project "${project.title}"`,
      relatedProjectId: project._id
    });
    await notification.save();

    // Log activity
    const activity = new Activity({
      projectId: project._id,
      userId: req.user._id,
      action: 'member_added',
      description: `added a new member to the project`
    });
    await activity.save();

    res.json({
      success: true,
      message: 'Member added successfully',
      data: project
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Owner/Instructor)
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const isOwner = project.members.some(member => 
      member.userId.toString() === req.user._id.toString() && member.role === 'owner'
    );
    const isInstructor = project.instructor.toString() === req.user._id.toString();

    if (!isOwner && !isInstructor && req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove member
    project.members = project.members.filter(member => 
      member.userId.toString() !== req.params.userId
    );

    await project.save();

    // Log activity
    const activity = new Activity({
      projectId: project._id,
      userId: req.user._id,
      action: 'member_removed',
      description: `removed a member from the project`
    });
    await activity.save();

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner/Instructor)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const isOwner = project.members.some(member => 
      member.userId.toString() === req.user._id.toString() && member.role === 'owner'
    );
    const isInstructor = project.instructor.toString() === req.user._id.toString();

    if (!isOwner && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;