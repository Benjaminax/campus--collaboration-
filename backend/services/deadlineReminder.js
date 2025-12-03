const mongoose = require('mongoose');
const cron = require('node-cron');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const User = require('../models/User');

class DeadlineReminderService {
  constructor() {
    this.isRunning = false;
  }

  // Start the deadline reminder cron job
  start() {
    if (this.isRunning) {
      console.log('⚠️ Deadline reminder service is already running');
      return;
    }

    // Run every hour to check for deadlines
    this.cronJob = cron.schedule('0 * * * *', async () => {
      console.log('🔔 Running deadline reminder check...');
      await this.checkDeadlines();
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });

    this.isRunning = true;
    console.log('✅ Deadline reminder service started');
  }

  // Stop the cron job
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log('🛑 Deadline reminder service stopped');
    }
  }

  // Check for upcoming deadlines and send notifications
  async checkDeadlines() {
    try {
      const now = new Date();
      
      // Calculate time thresholds
      const oneWeekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
      const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));

      // Find projects with upcoming deadlines
      const projects = await Project.find({
        deadline: { $exists: true, $ne: null },
        status: { $ne: 'completed' }
      }).populate('instructor', 'name email')
        .populate('members.userId', 'name email');

      console.log(`📋 Checking ${projects.length} projects for deadline reminders...`);

      for (const project of projects) {
        if (!project.deadline) continue;

        const deadline = new Date(project.deadline);
        const timeUntilDeadline = deadline.getTime() - now.getTime();

        // Check if we need to send reminders
        await this.checkAndSendReminder(project, deadline, timeUntilDeadline, oneWeekFromNow, 'one_week');
        await this.checkAndSendReminder(project, deadline, timeUntilDeadline, oneDayFromNow, 'one_day');
        await this.checkAndSendReminder(project, deadline, timeUntilDeadline, oneHourFromNow, 'one_hour');
      }

    } catch (error) {
      console.error('❌ Error checking deadlines:', error);
    }
  }

  // Check if reminder should be sent and send it
  async checkAndSendReminder(project, deadline, timeUntilDeadline, threshold, reminderType) {
    try {
      // Check if deadline is within the threshold
      if (deadline <= threshold && timeUntilDeadline > 0) {
        
        // Check if we already sent this type of reminder for this project
        const existingReminder = await Notification.findOne({
          relatedProjectId: project._id,
          type: 'deadline_reminder',
          message: { $regex: this.getReminderPattern(reminderType) },
          createdAt: { $gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } // Within last 2 days
        });

        if (existingReminder) {
          return; // Already sent this reminder recently
        }

        // Get all users associated with the project
        const usersToNotify = new Set();
        
        // Add instructor
        if (project.instructor) {
          usersToNotify.add(project.instructor._id.toString());
        }

        // Add all project members
        if (project.members && project.members.length > 0) {
          project.members.forEach(member => {
            if (member.userId) {
              usersToNotify.add(member.userId._id.toString());
            }
          });
        }

        // Send notification to each user
        for (const userId of usersToNotify) {
          await this.createDeadlineNotification(userId, project, reminderType, timeUntilDeadline);
        }

        console.log(`🔔 Sent ${reminderType} reminder for project "${project.title}" to ${usersToNotify.size} users`);
      }
    } catch (error) {
      console.error(`❌ Error sending ${reminderType} reminder for project ${project.title}:`, error);
    }
  }

  // Create and save deadline notification
  async createDeadlineNotification(userId, project, reminderType, timeUntilDeadline) {
    try {
      const timeLeft = this.formatTimeLeft(timeUntilDeadline);
      const urgencyLevel = this.getUrgencyLevel(reminderType);
      
      const notification = new Notification({
        userId: userId,
        type: 'deadline_reminder',
        title: `Project Deadline ${this.getReminderTitle(reminderType)}`,
        message: `Project "${project.title}" is due in ${timeLeft}. ${this.getReminderMessage(reminderType)}`,
        relatedProjectId: project._id,
        priority: urgencyLevel,
        isRead: false
      });

      await notification.save();
      console.log(`📨 Created ${reminderType} deadline notification for user ${userId}`);
      
    } catch (error) {
      console.error(`❌ Error creating notification for user ${userId}:`, error);
    }
  }

  // Get regex pattern for reminder type
  getReminderPattern(reminderType) {
    switch (reminderType) {
      case 'one_week': return 'due in (1 week|7 days)';
      case 'one_day': return 'due in (1 day|24 hours)';
      case 'one_hour': return 'due in (1 hour|60 minutes)';
      default: return '';
    }
  }

  // Get reminder title based on type
  getReminderTitle(reminderType) {
    switch (reminderType) {
      case 'one_week': return 'Due in 1 Week';
      case 'one_day': return 'Due Tomorrow';
      case 'one_hour': return 'Due in 1 Hour';
      default: return 'Approaching';
    }
  }

  // Get reminder message based on type
  getReminderMessage(reminderType) {
    switch (reminderType) {
      case 'one_week': return 'Start preparing and organizing your tasks.';
      case 'one_day': return 'Please review and finalize your work.';
      case 'one_hour': return 'Final check and submission needed urgently!';
      default: return 'Please check the deadline.';
    }
  }

  // Get urgency level based on reminder type
  getUrgencyLevel(reminderType) {
    switch (reminderType) {
      case 'one_week': return 'low';
      case 'one_day': return 'medium';
      case 'one_hour': return 'high';
      default: return 'medium';
    }
  }

  // Format time left in human readable format
  formatTimeLeft(milliseconds) {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      return 'less than 1 minute';
    }
  }

  // Manual check for testing
  async runManualCheck() {
    console.log('🔧 Running manual deadline check...');
    await this.checkDeadlines();
    console.log('✅ Manual deadline check completed');
  }
}

module.exports = DeadlineReminderService;