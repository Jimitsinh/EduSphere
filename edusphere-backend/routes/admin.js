const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const LiveClass = require('../models/LiveClass');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const { requireRole, requireAdmin } = require('../middleware/rbac');

/**
 * @route GET /api/admin/ping
 * @desc  Admin-only test endpoint
 */
router.get('/ping', auth, requireAdmin, (req, res) => {
  res.json({ msg: 'admin access verified', userId: req.user.id, role: req.user.role });
});

/**
 * @route GET /api/admin/faculty-test
 */
router.get('/faculty-test', auth, requireRole(['faculty', 'admin']), (req, res) => {
  res.json({ msg: 'faculty/admin access verified', userId: req.user.id, role: req.user.role });
});

/**
 * @route GET /api/admin/student-test
 */
router.get('/student-test', auth, requireRole(['student', 'faculty', 'admin']), (req, res) => {
  res.json({ msg: 'authenticated access verified', userId: req.user.id, role: req.user.role });
});

/**
 * @route GET /api/admin/stats
 * @desc  Get system-wide statistics for Admin Dashboard
 * @access Admin
 */
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalFaculty, totalCourses, activeClasses, totalExams, totalAssignments] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      Course.countDocuments(),
      LiveClass.countDocuments({ status: 'live' }),
      Exam.countDocuments(),
      Assignment.countDocuments()
    ]);

    res.json({
      totalUsers,
      totalStudents,
      totalFaculty,
      totalCourses,
      activeClasses,
      totalExams,
      totalAssignments
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error fetching admin stats' });
  }
});

/**
 * @route GET /api/admin/users
 * @desc  Get list of all users
 * @access Admin
 */
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route PUT /api/admin/users/:id/role
 * @desc  Update a user's role
 * @access Admin
 */
router.put('/users/:id/role', auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Log admin action
    await AuditLog.create({
      user: req.user.id,
      userEmail: req.user.email,
      action: 'ROLE_UPDATE',
      details: `Updated user ${user.email} role to ${role}`
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route GET /api/admin/audit-logs
 * @desc  Get audit logs
 * @access Admin
 */
router.get('/audit-logs', auth, requireAdmin, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
