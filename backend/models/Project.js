const mongoose = require('mongoose');
const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'member', 'viewer'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  courseCode: {
    type: String,
    trim: true,
    maxlength: [20, 'Course code cannot exceed 20 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [memberSchema],
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  deadline: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});
// Index for better query performance
projectSchema.index({ instructor: 1, status: 1 });
projectSchema.index({ 'members.userId': 1 });
module.exports = mongoose.model('Project', projectSchema);
