const express = require('express');
const { auth } = require('../middleware/auth');
const { validateComment, handleValidationErrors } = require('../middleware/validation');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const router = express.Router();

const checkTaskAccess = async (taskId, userId) => {
  const task = await Task.findById(taskId).populate('projectId');
  if (!task) return { hasAccess: false, task: null };
  
  const project = task.projectId;
  const hasAccess = project.members.some(member => 
    member.userId.toString() === userId.toString()
  ) || project.instructor.toString() === userId.toString();
  
  return { hasAccess, task };
};

router.post('/', auth, validateComment, handleValidationErrors, async (req, res) => {
  try {
    const { taskId, content, mentions = [] } = req.body;

    // Check if user has access to the task
    const { hasAccess, task } = await checkTaskAccess(taskId, req.user._id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const comment = new Comment({
      taskId,
      userId: req.user._id,
      content,
      mentions
    });

    await comment.save();
    await comment.populate('userId', 'name email avatar');
    await comment.populate('mentions', 'name email');

    // Create notifications for mentions
    if (mentions.length > 0) {
      const mentionNotifications = mentions
        .filter(userId => userId.toString() !== req.user._id.toString())
        .map(userId => ({
          userId,
          type: 'mention',
          title: 'You were mentioned',
          message: `${req.user.name} mentioned you in a comment on "${task.title}"`,
          relatedTaskId: taskId,
          relatedProjectId: task.projectId._id
        }));

      if (mentionNotifications.length > 0) {
        await Notification.insertMany(mentionNotifications);
      }
    }

    // Notify assigned users (except the commenter)
    const assignedNotifications = task.assignedTo
      .filter(userId => 
        userId.toString() !== req.user._id.toString() &&
        !mentions.some(mentionId => mentionId.toString() === userId.toString())
      )
      .map(userId => ({
        userId,
        type: 'comment_added',
        title: 'New Comment',
        message: `${req.user.name} commented on "${task.title}"`,
        relatedTaskId: taskId,
        relatedProjectId: task.projectId._id
      }));

    if (assignedNotifications.length > 0) {
      await Notification.insertMany(assignedNotifications);
    }

    // Log activity
    const activity = new Activity({
      projectId: task.projectId._id,
      userId: req.user._id,
      action: 'comment_added',
      description: `commented on task "${task.title}"`,
      taskId
    });
    await activity.save();

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get comments for a task
// @route   GET /api/comments/task/:taskId
// @access  Private
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if user has access to the task
    const { hasAccess } = await checkTaskAccess(taskId, req.user._id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const skip = (page - 1) * limit;

    const comments = await Comment.find({ taskId, parentComment: null })
      .populate('userId', 'name email avatar')
      .populate('mentions', 'name email')
      .populate({
        path: 'replies',
        populate: {
          path: 'userId',
          select: 'name email avatar'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments({ taskId, parentComment: null });

    res.json({
      success: true,
      count: comments.length,
      total: totalComments,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalComments / limit),
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (Comment owner only)
router.put('/:id', auth, validateComment, handleValidationErrors, async (req, res) => {
  try {
    const { content } = req.body;
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    await comment.populate('userId', 'name email avatar');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Comment owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Reply to a comment
// @route   POST /api/comments/:id/reply
// @access  Private
router.post('/:id/reply', auth, validateComment, handleValidationErrors, async (req, res) => {
  try {
    const { content } = req.body;
    const parentComment = await Comment.findById(req.params.id);
    
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found'
      });
    }

    // Check if user has access to the task
    const { hasAccess, task } = await checkTaskAccess(parentComment.taskId, req.user._id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const reply = new Comment({
      taskId: parentComment.taskId,
      userId: req.user._id,
      content,
      parentComment: parentComment._id
    });

    await reply.save();
    await reply.populate('userId', 'name email avatar');

    // Add reply to parent comment
    parentComment.replies.push(reply._id);
    await parentComment.save();

    // Notify the parent comment author
    if (parentComment.userId.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        userId: parentComment.userId,
        type: 'comment_added',
        title: 'Comment Reply',
        message: `${req.user.name} replied to your comment on "${task.title}"`,
        relatedTaskId: parentComment.taskId,
        relatedProjectId: task.projectId._id
      });
      await notification.save();
    }

    res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      data: reply
    });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;