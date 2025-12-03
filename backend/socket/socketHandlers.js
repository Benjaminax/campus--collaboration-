const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');

const socketHandlers = (socket, io) => {
  console.log('User connected:', socket.user.name, '(', socket.user.email, ')');
  
  socket.userId = socket.user._id.toString();
  
  const joinUserProjects = async () => {
    try {
      const userProjects = await Project.find({
        $or: [
          { instructor: socket.userId },
          { 'members.userId': socket.userId }
        ]
      }).select('_id name');
      
      userProjects.forEach(project => {
        socket.join(`project_${project._id}`);
        console.log(`User ${socket.user.name} joined project room: ${project.name}`);
      });
      
      userProjects.forEach(project => {
        socket.to(`project_${project._id}`).emit('user-online', {
          userId: socket.userId,
          userName: socket.user.name,
          userAvatar: socket.user.avatar,
          timestamp: new Date()
        });
      });
      
    } catch (error) {
      console.error('Error joining user projects:', error);
    }
  };
  
  joinUserProjects();
  
  socket.on('join-project', async (data) => {
    try {
      const { projectId } = data;
      
      const project = await Project.findById(projectId);
      if (!project) return;
      
      const isMember = project.members.some(member => 
        member.userId.toString() === socket.userId
      ) || project.instructor.toString() === socket.userId;
      
      if (isMember) {
        socket.join(`project_${projectId}`);
        socket.emit('joined-project', { projectId, projectName: project.name });
        
        socket.to(`project_${projectId}`).emit('user-joined-project', {
          userId: socket.userId,
          userName: socket.user.name,
          userAvatar: socket.user.avatar,
          timestamp: new Date()
        });
        
        console.log(`User ${socket.user.name} joined project: ${project.name}`);
      }
    } catch (error) {
      console.error('Error joining project:', error);
    }
  });
  
  socket.on('leave-project', (data) => {
    const { projectId } = data;
    socket.leave(`project_${projectId}`);
    
    socket.to(`project_${projectId}`).emit('user-left-project', {
      userId: socket.userId,
      userName: socket.user.name,
      timestamp: new Date()
    });
    
    console.log(`User ${socket.user.name} left project room`);
  });

  socket.on('task-update', async (data) => {
    try {
      const { projectId, taskId, action } = data;
      
      const project = await Project.findById(projectId);
      if (!project) return;
      
      const isMember = project.members.some(member => 
        member.userId.toString() === socket.userId
      ) || project.instructor.toString() === socket.userId;
      
      if (!isMember) return;
      
      socket.to(`project_${projectId}`).emit('task-updated', {
        action,
        taskId,
        updatedBy: {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });

      console.log(`Task ${action} broadcasted for project ${projectId}`);
    } catch (error) {
      console.error('Error handling task update:', error);
    }
  });

  socket.on('comment-added', async (data) => {
    try {
      const { projectId, taskId, comment } = data;
      
      const project = await Project.findById(projectId);
      if (!project) return;

      const isMember = project.members.some(member => 
        member.userId.toString() === socket.userId
      ) || project.instructor.toString() === socket.userId;

      if (!isMember) return;

      socket.to(`project_${projectId}`).emit('new-comment', {
        taskId,
        comment,
        addedBy: {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });

      console.log(`Comment added broadcasted for task ${taskId}`);
    } catch (error) {
      console.error('Error handling comment addition:', error);
    }
  });

  socket.on('project-update', async (data) => {
    try {
      const { projectId, action, project, userId } = data;
      
      socket.to(`project_${projectId}`).emit('project-updated', {
        action,
        project,
        updatedBy: {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });

      console.log(`Project ${action} broadcasted for project ${projectId}`);
    } catch (error) {
      console.error('Error handling project update:', error);
    }
  });

  socket.on('typing-start', (data) => {
    const { projectId, taskId } = data;
    socket.to(`project_${projectId}`).emit('user-typing', {
      taskId,
      user: {
        id: socket.userId,
        name: socket.user.name
      }
    });
  });

  socket.on('typing-stop', (data) => {
    const { projectId, taskId } = data;
    socket.to(`project_${projectId}`).emit('user-stopped-typing', {
      taskId,
      userId: socket.userId
    });
  });

  socket.on('notification-read', (data) => {
    const { notificationId } = data;
    socket.emit('notification-acknowledged', { notificationId });
  });

  socket.on('status-update', async (data) => {
    try {
      const { status } = data;
      
      const userProjects = await Project.find({
        $or: [
          { instructor: socket.userId },
          { 'members.userId': socket.userId }
        ]
      }).select('_id');

      userProjects.forEach(project => {
        socket.to(`project_${project._id}`).emit('user-status-changed', {
          userId: socket.userId,
          userName: socket.user.name,
          status,
          timestamp: new Date()
        });
      });

      console.log(`User ${socket.user.name} status changed to ${status}`);
    } catch (error) {
      console.error('Error handling status update:', error);
    }
  });

  socket.on('disconnect', async (reason) => {
    try {
      console.log(`User ${socket.user.name} disconnected: ${reason}`);
      
      const userProjects = await Project.find({
        $or: [
          { instructor: socket.userId },
          { 'members.userId': socket.userId }
        ]
      }).select('_id');

      userProjects.forEach(project => {
        socket.to(`project_${project._id}`).emit('user-offline', {
          userId: socket.userId,
          userName: socket.user.name,
          timestamp: new Date()
        });
      });
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error for user', socket.user.name, ':', error);
  });
};

module.exports = socketHandlers;