const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const User = require('../models/User');
const auth = require('../middleware/auth');

/**
 * @route GET /api/search
 * @desc  Global search across Courses, Assignments, Exams, and Faculty
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { q, category, difficulty, page = 1, limit = 10 } = req.query;
    const queryStr = q ? q.trim() : '';

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const regex = new RegExp(queryStr, 'i');

    const courseFilter = {};
    if (queryStr) {
      courseFilter.$or = [
        { title: regex },
        { description: regex },
        { 'modules.title': regex },
        { 'modules.lessons.title': regex }
      ];
    }

    const [courses, assignments, exams, faculty] = await Promise.all([
      Course.find(courseFilter).skip(skip).limit(parseInt(limit, 10)),
      queryStr ? Assignment.find({ $or: [{ title: regex }, { courseName: regex }, { description: regex }] }).limit(5) : [],
      queryStr ? Exam.find({ $or: [{ title: regex }, { courseName: regex }] }).limit(5) : [],
      queryStr ? User.find({ role: 'faculty', $or: [{ name: regex }, { email: regex }] }).select('name email role').limit(5) : []
    ]);

    res.json({
      courses,
      assignments,
      exams,
      faculty,
      query: queryStr,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ msg: 'Server error during search' });
  }
});

module.exports = router;
