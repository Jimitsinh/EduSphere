const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Exam = require('../models/Exam');
const ProctorLog = require('../models/ProctorLog');

// @route   GET /api/exams
// @desc    Get all available exams and completion statuses
router.get('/', auth, async (req, res) => {
  try {
    const exams = await Exam.find();
    
    // Check if user has taken each exam
    const formatted = await Promise.all(exams.map(async (exam) => {
      const log = await ProctorLog.findOne({ student: req.user.id, examTitle: exam.title, isFinished: true });
      
      return {
        _id: exam._id,
        title: exam.title,
        courseName: exam.courseName,
        durationMins: exam.durationMins,
        isProctored: exam.isProctored,
        status: log ? 'Completed' : 'Available',
        violations: log ? log.violationCount : 0,
        score: log ? (log.violationCount >= 3 ? 'Locked' : 'Submitted') : null
      };
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/exams/:id
// @desc    Get a specific exam by ID (for students taking it)
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.id || req.params.id);
    if (!exam) return res.status(404).json({ msg: 'Exam not found' });
    
    // Create/fetch an active proctor log for this exam taking session
    let log = await ProctorLog.findOne({ student: req.user.id, examTitle: exam.title, isFinished: false });
    if (!log) {
      log = new ProctorLog({
        student: req.user.id,
        examTitle: exam.title,
        violations: [],
        violationCount: 0
      });
      await log.save();
    }
    
    res.json({
      exam: {
        _id: exam._id,
        title: exam.title,
        courseName: exam.courseName,
        durationMins: exam.durationMins,
        isProctored: exam.isProctored,
        questions: exam.questions.map(q => ({
          _id: q._id,
          questionText: q.questionText,
          marks: q.marks,
          options: q.options
        }))
      },
      log: {
        violationCount: log.violationCount,
        violations: log.violations
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/exams/violation
// @desc    Log a new proctoring violation event
router.post('/violation', auth, async (req, res) => {
  try {
    const { examTitle, violationType, description } = req.body;
    
    let log = await ProctorLog.findOne({ student: req.user.id, examTitle, isFinished: false });
    if (!log) {
      log = new ProctorLog({
        student: req.user.id,
        examTitle,
        violations: [],
        violationCount: 0
      });
    }
    
    log.violations.push({
      type: violationType,
      description: description || `Violation triggered: ${violationType}`
    });
    log.violationCount = log.violations.length;
    
    // Calculate simulated attention score
    // 100% starts, drops based on violations
    log.averageAttentionScore = Math.max(0, 100 - (log.violationCount * 18));
    
    await log.save();
    
    res.json({
      msg: 'Violation logged',
      violationCount: log.violationCount,
      attentionScore: log.averageAttentionScore
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/exams/submit
// @desc    Submit final answer key or subjective answers for grading
router.post('/submit', auth, async (req, res) => {
  try {
    const { examTitle, answer } = req.body;
    
    let log = await ProctorLog.findOne({ student: req.user.id, examTitle, isFinished: false });
    if (!log) {
      log = new ProctorLog({
        student: req.user.id,
        examTitle,
        violations: [],
        violationCount: 0
      });
    }
    
    log.answerSubmitted = answer;
    log.isFinished = true;
    
    await log.save();
    
    res.json({
      msg: 'Exam submitted successfully',
      violations: log.violationCount,
      attentionScore: log.averageAttentionScore
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
