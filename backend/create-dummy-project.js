const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User');
const Activity = require('./models/Activity');

// Load environment variables
require('dotenv').config();

async function createDummyProject() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'kojoben29@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found with email: kojoben29@gmail.com');
      return;
      
    }

    console.log('👤 Found user:', user.name, `(${user.email})`);

    // Create a dummy project
    const project = new Project({
      title: 'Web Development Portfolio',
      description: 'A comprehensive portfolio website showcasing various web development projects using modern technologies like React, Node.js, and MongoDB.',
      courseCode: 'WEB301',
      instructor: user._id,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      tags: ['React', 'Node.js', 'Portfolio', 'Web Development'],
      color: '#3B82F6',
      status: 'active',
      members: [{
        userId: user._id,
        role: 'owner',
        joinedAt: new Date()
      }]
    });

    await project.save();
    console.log('✅ Project created successfully:', project._id);
    
    // Populate the project data
    await project.populate('instructor', 'name email');
    await project.populate('members.userId', 'name email avatar');

    // Log activity
    const activity = new Activity({
      projectId: project._id,
      userId: user._id,
      action: 'project_created',
      description: `created project "${project.title}"`
    });
    await activity.save();
    console.log('✅ Activity logged');

    // Display project details
    console.log('\n📋 Project Details:');
    console.log(`   Title: ${project.title}`);
    console.log(`   Description: ${project.description}`);
    console.log(`   Course Code: ${project.courseCode}`);
    console.log(`   Instructor: ${project.instructor.name} (${project.instructor.email})`);
    console.log(`   Status: ${project.status}`);
    console.log(`   Members: ${project.members.length}`);
    console.log(`   Deadline: ${project.deadline}`);
    console.log(`   Created: ${project.createdAt}`);
    console.log(`   ID: ${project._id}`);

    // Create another project for variety
    const project2 = new Project({
      title: 'Mobile Task Manager',
      description: 'A React Native mobile application for managing daily tasks and productivity tracking with real-time synchronization.',
      courseCode: 'MOB201',
      instructor: user._id,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      tags: ['React Native', 'Mobile', 'Productivity', 'Task Management'],
      color: '#10B981',
      status: 'active',
      members: [{
        userId: user._id,
        role: 'owner',
        joinedAt: new Date()
      }]
    });

    await project2.save();
    await project2.populate('instructor', 'name email');
    await project2.populate('members.userId', 'name email avatar');

    // Log activity for second project
    const activity2 = new Activity({
      projectId: project2._id,
      userId: user._id,
      action: 'project_created',
      description: `created project "${project2.title}"`
    });
    await activity2.save();

    console.log('\n📋 Second Project Details:');
    console.log(`   Title: ${project2.title}`);
    console.log(`   Description: ${project2.description}`);
    console.log(`   Course Code: ${project2.courseCode}`);
    console.log(`   Status: ${project2.status}`);
    console.log(`   ID: ${project2._id}`);

    console.log('\n🎉 Successfully created 2 dummy projects for Benjamin Acheampong!');
    
  } catch (error) {
    console.error('❌ Error creating dummy project:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createDummyProject();