# CAMPUS TASK COLLABORATION BOARD

## Project Overview
This is my submission for the 10-day project assessment that started December 3rd, 2025. I decided to choose the Campus Task Collaboration Board because I wanted to build something that could help students work together on their projects more easily.

## Live Deployment Links

**Frontend (GitHub Pages)**: https://benjaminax.github.io/campus--collaboration-/

**Backend (Render)**: https://campus-collaboration.onrender.com

## What This Project Does
The Campus Task Collaboration Board is a web application that helps students and teachers work together on academic projects. It gives everyone a place where they can manage projects, assign tasks, chat in real-time, and see how much progress they've made.

### Main Features I Built

#### User Login and Security
- Students can register and login securely
- JWT authentication that keeps users logged in safely
- Different permissions for Students, Teachers, and Admins
- Password reset when users forget their passwords
- Profile pages where users can upload their photos

#### Project and Task Management
- **Projects**: Users can create, view, edit, and delete projects
- **Tasks**: Full management system for tasks with different statuses (To Do, In Progress, Done)
- **Comments**: People can leave comments on tasks to discuss them
- **Notifications**: The system sends alerts when important things happen
- **Activity Feed**: Shows what everyone has been doing on the project

#### Works on Mobile and Desktop
- Built mobile-first so it works great on phones
- Touch-friendly buttons and menus for mobile users
- Works on computers, tablets, and phones
- Has both dark and light themes that switch automatically

#### Real-time Updates
- Socket.IO makes everything update instantly
- Notifications appear immediately when tasks are assigned
- Activity feed updates live as people work
- Team members can collaborate without refreshing the page

#### Charts and Reports
- Visual charts show project progress
- Analytics to see how productive the team is
- Statistics on completed tasks
- Can export everything as PDF files

### Technology Stack I Used

#### Frontend
- **Framework**: React 19.2.0 with Vite for fast development
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API for user login and themes
- **Animations**: Framer Motion to make things look smooth
- **HTTP Requests**: Axios to talk to the backend with error handling
- **Real-time**: Socket.IO Client for instant updates
- **Navigation**: React Router for moving between pages
- **Forms**: React Hook Form with validation
- **Notifications**: React Hot Toast for popup messages
- **PDF Creation**: jsPDF to export reports

#### Backend
- **Server**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose for data management
- **Authentication**: JWT tokens with bcrypt for secure passwords
- **Real-time**: Socket.IO server for live updates
- **File Upload**: Multer for handling profile pictures
- **Security**: CORS setup for safe cross-origin requests
- **Configuration**: Environment variables for sensitive data
- **Validation**: Express middleware to check request data

### How It's Deployed
- **Frontend**: Hosted on GitHub Pages with automatic deployment
- **Backend**: Running on Render with MongoDB Atlas database
- **Security**: HTTPS enabled on both frontend and backend
- **Performance**: Static files are cached for faster loading

## How to Install and Run Locally

### What You Need First
- Node.js version 16 or newer
- npm package manager
- MongoDB database (can use free MongoDB Atlas)
- Git installed on your computer

### Steps to Set It Up

1. **Get the code**
   ```bash
   git clone https://github.com/Benjaminax/campus--collaboration-.git
   cd campus--collaboration-
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   # Add your MongoDB link and JWT secret key
   
   # Start the server
   npm run dev
   ```

3. **Setup the Frontend**
   ```bash
   cd frontend
   npm install
   
   # Start the development server
   npm run dev
   ```

4. **Open in browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## How to Use the Application

### For Students
1. Create an account with your school email
2. Join projects that teachers create or start your own
3. Work with classmates on assigned tasks
4. Get notifications when tasks are due or updated
5. Download project reports as PDF files

### For Teachers and Admins
1. Create and manage multiple class projects
2. Give tasks to specific students
3. Check progress using the analytics dashboard
4. Control who can access what parts of projects
5. Create detailed reports for grading

## API Endpoints

### User Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Project Management
- `GET /api/projects` - Get all user's projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update existing project
- `DELETE /api/projects/:id` - Delete project

### Task Management
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task or change status
- `DELETE /api/tasks/:id` - Remove task

## Testing and Quality

### How I Tested Everything
- Tested individual components to make sure they work
- Tested API endpoints to ensure they return correct data
- Tested complete user workflows from start to finish
- Checked that it works on different browsers
- Made sure it looks good on phones and tablets

### Making It Fast
- Split code into smaller chunks that load when needed
- Compressed images to load faster
- Cached API responses so repeated requests are quicker
- Optimized database queries to be more efficient
- Used CDN for faster file delivery

## Problems I Faced and How I Fixed Them

1. **Real-time Updates**: Had trouble making changes show up instantly for all users. Fixed it by implementing Socket.IO properly.
2. **Mobile Design**: Initially the site didn't work well on phones. Solved it by designing for mobile first, then scaling up.
3. **User Security**: Needed to make login secure. Implemented JWT tokens with proper expiration times.
4. **Database Speed**: Queries were slow with lots of data. Fixed by adding proper indexes to MongoDB.
5. **Deployment Problems**: Had issues with environment variables. Solved by properly configuring settings for production.

## What I Want to Add Later
- Push notifications for mobile apps
- Better analytics with more detailed reports
- Integration with Google Calendar
- File sharing so teams can upload documents
- Video calls built into the platform

## What I Learned
Working on this project for 10 days taught me a lot about building real applications that people can actually use. I learned how to connect frontend and backend properly, make things work in real-time, and deploy applications so anyone can access them. The time limit was challenging but it helped me focus on what's most important and manage my time better.

## My Information
**Name**: Benjamin Acquah  
**Level**: 300  
**Program**: Computer Science  
**School**: University of Ghana  
**Email**: benjamin.acquah@student.ug.edu.gh  
**GitHub**: [@Benjaminax](https://github.com/Benjaminax)

---

**When I Submitted**: December 12th, 2025  
**How Long It Took**: 10 days (December 3-12, 2025)  
**Points Worth**: 60 marks
