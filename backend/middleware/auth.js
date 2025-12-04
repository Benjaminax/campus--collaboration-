const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header received:', authHeader);
    const token = authHeader?.replace('Bearer ', '');
    console.log('Token extracted:', token ? token.substring(0, 20) + '...' : 'No token');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorization check:');
    console.log('User:', req.user ? { id: req.user._id, name: req.user.name, role: req.user.role } : 'No user');
    console.log('Required roles:', roles);
    console.log('User role:', req.user?.role);
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No user found.'
      });
    }
    if (!roles.includes(req.user.role)) {
      console.log(`Access denied. User role "${req.user.role}" not in required roles: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }
    console.log('Authorization successful');
    next();
  };
};
const generateToken = (id) => {
  console.log('generateToken called with id:', id);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
  console.log('JWT_SECRET value (first 10 chars):', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'UNDEFINED');
  
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};
module.exports = {
  auth,
  authorize,
  generateToken
};
