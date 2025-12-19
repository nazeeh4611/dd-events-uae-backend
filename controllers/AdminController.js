import Admin from '../Models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/* ==================== HELPERS ==================== */

const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' }
  );
};

/* ==================== AUTH ==================== */

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email and password' 
      });
    }

    // Check if admin exists
    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ 
        success: false,
        message: 'Admin already exists with this email' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'admin'
    });

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: adminResponse
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Find admin
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(admin);

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: adminResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      admin
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* ==================== PROFILE ==================== */

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({ 
      success: true, 
      admin 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      admin 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide old and new password'
      });
    }

    const admin = await Admin.findById(req.user.id).select('+password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Old password is incorrect' 
      });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* ==================== SUPER ADMIN ==================== */

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json({ 
      success: true, 
      count: admins.length,
      admins 
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({ 
      success: true, 
      message: 'Admin deleted successfully' 
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/* ==================== DASHBOARD ==================== */

export const getDashboardStats = async (req, res) => {
  try {
    const totalAdmins = await Admin.countDocuments();

    res.json({
      success: true,
      stats: {
        totalAdmins
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};