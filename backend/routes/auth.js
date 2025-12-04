const express = require('express');
const { auth, generateToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin, handleValidationErrors } = require('../middleware/validation');
const User = require('../models/User');
const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('=== REGISTRATION ATTEMPT START ===');
    const { name, email, password, department, studentId, role = 'student' } = req.body;
    
    console.log('Registration attempt:', { name, email, department, studentId, role, password: password ? '[PRESENT]' : '[MISSING]' });

    // Basic validation
    if (!name || !email || !password || !department) {
      console.log('Registration failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and department are required'
      });
    }

    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        ...(studentId ? [{ studentId }] : [])
      ]
    });

    if (existingUser) {
      console.log('Registration failed: User already exists');
      return res.status(400).json({
        success: false,
        message: 'User with this email or student ID already exists'
      });
    }

    // Create user
    console.log('Creating new user...');
    const user = new User({
      name,
      email,
      password,
      department,
      studentId,
      role
    });

    await user.save();
    console.log('User created successfully:', user.email);

    // Generate token
    const token = generateToken(user._id);
    console.log('Generated token for new user:', user.email);

    console.log('=== REGISTRATION ATTEMPT SUCCESS ===');
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('=== REGISTRATION ATTEMPT FAILED ===');
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT START ===');
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password: password ? '[PRESENT]' : '[MISSING]' });

    // Basic validation
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user exists
    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? { id: user._id, email: user.email, isActive: user.isActive } : 'NO USER FOUND');
    
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('Login failed: User not active');
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Validate password
    console.log('Attempting password validation...');
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    console.log('Updating last login...');
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    console.log('Generating token with JWT_SECRET:', process.env.JWT_SECRET ? 'PRESENT' : 'MISSING');
    const token = generateToken(user._id);
    console.log('Generated token for user:', user.email, 'Token:', token ? token.substring(0, 20) + '...' : 'No token');

    // Remove password from response
    user.password = undefined;

    console.log('Login successful for user:', user.email);
    console.log('=== LOGIN ATTEMPT SUCCESS ===');
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('=== LOGIN ATTEMPT FAILED ===');
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Profile get error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, department, avatar } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (department) updateFields.department = department.trim();
    if (avatar !== undefined) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

router.post('/logout', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Task Collaboration Board API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;