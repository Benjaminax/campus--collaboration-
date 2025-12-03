const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: [
      'task_created',
      'task_updated',
      'task_status_changed',
      'task_assigned',
      'task_completed',
      'comment_added',
      'file_uploaded',
      'project_created',
      'project_updated',
      'member_added',
      'member_removed'
    ],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});
// Index for better query performance
activitySchema.index({ projectId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL
module.exports = mongoose.model('Activity', activitySchema);
