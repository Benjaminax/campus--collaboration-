const express = require('express');
const { auth } = require('../middleware/auth');
const { validateTask, handleValidationErrors } = require('../middleware/validation');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const router = express.Router();

const checkProjectMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  
  return project.members.some(member => 
    member.userId.toString() === userId.toString()
  ) || project.instructor.toString() === userId.toString();
};

router.post('/', auth, validateTask, handleValidationErrors, async (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      priority = 'medium',
      assignedTo = [],
      tags = [],
      dueDate,
      estimatedHours
    } = req.body;

    // Check if user is a member of the project
    const isMember = await checkProjectMembership(projectId, req.user._id);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    const task = new Task({
      projectId,
      title,
      description,
      priority,
      assignedTo,
      createdBy: req.user._id,
      tags,
      dueDate,
      estimatedHours
    });

    await task.save();
    await task.populate([
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' }
    ]);

    // Log activity
    const activity = new Activity({
      projectId,
      userId: req.user._id,
      action: 'task_created',
      description: `created task "${title}"`,
      taskId: task._id
    });
    await activity.save();

    // Create notifications for assigned users
    if (assignedTo.length > 0) {
      const notifications = assignedTo
        .filter(userId => userId.toString() !== req.user._id.toString())
        .map(userId => ({
          userId,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned to task "${title}"`,
          relatedTaskId: task._id,
          relatedProjectId: projectId
        }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, search, limit = 50, sort = '-createdAt' } = req.query;
    const userId = req.user._id;

    // First, find all projects the user is a member of
    const userProjects = await Project.find({
      $or: [
        { 'members.userId': userId },
        { instructor: userId }
      ]
    }).select('_id');

    const projectIds = userProjects.map(project => project._id);

    // Build query for tasks
    let query = { projectId: { $in: projectIds } };

    // Add filters
    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with population
    const tasks = await Task.find(query)
      .populate('projectId', 'name category')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { status, assignee, priority, search } = req.query;
    const { projectId } = req.params;

    // Check if user is a member of the project
    const isMember = await checkProjectMembership(projectId, req.user._id);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let query = { projectId };

    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    if (assignee) {
      query.assignedTo = assignee;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ position: 1, createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar department')
      .populate('createdBy', 'name email avatar department')
      .populate('projectId', 'title');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is a member of the project
    const isMember = await checkProjectMembership(task.projectId._id, req.user._id);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      tags,
      dueDate,
      estimatedHours,
      actualHours,
      position
    } = req.body;

    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is a member of the project
    const isMember = await checkProjectMembership(task.projectId, req.user._id);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Store old values for activity logging
    const oldStatus = task.status;
    const oldAssignedTo = task.assignedTo.map(id => id.toString());

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (status !== undefined) updateFields.status = status;
    if (priority !== undefined) updateFields.priority = priority;
    if (assignedTo !== undefined) updateFields.assignedTo = assignedTo;
    if (tags !== undefined) updateFields.tags = tags;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (estimatedHours !== undefined) updateFields.estimatedHours = estimatedHours;
    if (actualHours !== undefined) updateFields.actualHours = actualHours;
    if (position !== undefined) updateFields.position = position;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate([
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' }
    ]);

    // Log activity
    let activityDescription = `updated task "${updatedTask.title}"`;
    let activityAction = 'task_updated';

    if (status && status !== oldStatus) {
      activityDescription = `moved task "${updatedTask.title}" from ${oldStatus} to ${status}`;
      activityAction = 'task_status_changed';
    }

    const activity = new Activity({
      projectId: task.projectId,
      userId: req.user._id,
      action: activityAction,
      description: activityDescription,
      taskId: task._id,
      oldValue: oldStatus,
      newValue: status
    });
    await activity.save();

    // Create notifications for newly assigned users
    if (assignedTo) {
      const newAssignees = assignedTo.filter(userId => 
        !oldAssignedTo.includes(userId.toString()) &&
        userId.toString() !== req.user._id.toString()
      );

      if (newAssignees.length > 0) {
        const notifications = newAssignees.map(userId => ({
          userId,
          type: 'task_assigned',
          title: 'Task Assigned',
          message: `You have been assigned to task "${updatedTask.title}"`,
          relatedTaskId: task._id,
          relatedProjectId: task.projectId
        }));

        await Notification.insertMany(notifications);
      }

      // Notify about status change if task is completed
      if (status === 'done' && status !== oldStatus) {
        const completionNotifications = updatedTask.assignedTo
          .filter(user => user._id.toString() !== req.user._id.toString())
          .map(user => ({
            userId: user._id,
            type: 'task_status_changed',
            title: 'Task Completed',
            message: `Task "${updatedTask.title}" has been completed`,
            relatedTaskId: task._id,
            relatedProjectId: task.projectId
          }));

        if (completionNotifications.length > 0) {
          await Notification.insertMany(completionNotifications);
        }
      }
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is a member of the project or task creator
    const isMember = await checkProjectMembership(task.projectId, req.user._id);
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    
    if (!isMember && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Log activity
    const activity = new Activity({
      projectId: task.projectId,
      userId: req.user._id,
      action: 'task_deleted',
      description: `deleted task "${task.title}"`,
      taskId: task._id
    });
    await activity.save();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update subtask
// @route   PUT /api/tasks/:id/subtasks/:subtaskId
// @access  Private
router.put('/:id/subtasks/:subtaskId', auth, async (req, res) => {
  try {
    const { isCompleted } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is a member of the project
    const isMember = await checkProjectMembership(task.projectId, req.user._id);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    subtask.isCompleted = isCompleted;
    if (isCompleted) {
      subtask.completedBy = req.user._id;
      subtask.completedAt = new Date();
    } else {
      subtask.completedBy = undefined;
      subtask.completedAt = undefined;
    }

    await task.save();

    res.json({
      success: true,
      message: 'Subtask updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's assigned tasks
// @route   GET /api/tasks/my-tasks
// @access  Private
router.get('/user/my-tasks', auth, async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = { assignedTo: req.user._id };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'title color')
      .sort({ dueDate: 1, priority: -1, createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;