const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Assignment = require('../models/Assignment');

// @route   GET /api/assignments
// @desc    Get all assignments and user's completion status
router.get('/', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find();
    
    const formatted = assignments.map(a => {
      // Find user submission
      const userSub = a.submissions.find(sub => sub.student.toString() === req.user.id);
      
      return {
        _id: a._id,
        title: a.title,
        courseName: a.courseName,
        description: a.description,
        due: a.dueDateString,
        status: userSub ? 'Submitted' : 'Not started',
        grade: userSub ? userSub.grade : null,
        submittedText: userSub ? userSub.submittedText : null
      };
    });
    
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/assignments/submit
// @desc    Submit an assignment
router.post('/submit', auth, async (req, res) => {
  try {
    const { assignmentId, submittedText } = req.body;
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });
    
    // Check if user already submitted
    const existingIndex = assignment.submissions.findIndex(sub => sub.student.toString() === req.user.id);
    
    if (existingIndex > -1) {
      assignment.submissions[existingIndex].submittedText = submittedText;
      assignment.submissions[existingIndex].submittedAt = Date.now();
    } else {
      assignment.submissions.push({
        student: req.user.id,
        submittedText
      });
    }
    
    await assignment.save();
    
    res.json({ msg: 'Assignment submitted successfully', status: 'Submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
