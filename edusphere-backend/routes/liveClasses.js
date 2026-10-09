const express = require('express');
const router = express.Router();
const LiveClass = require('../models/LiveClass');
const Attendance = require('../models/Attendance');
const ChatMessage = require('../models/ChatMessage');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

/**
 * Generate a clean, readable unique meeting ID (e.g. EDU-SYS-9F8K2P)
 */
function generateMeetingId(courseName = 'EDU') {
  const prefix = (courseName.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'EDU').toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EDU-${prefix}-${rand}`;
}

/**
 * @route GET /api/live-classes or /api/live
 * @desc  Get all upcoming and live classes (Filtered by enrollment for students)
 * @access Private
 */
router.get(['/', '/all'], auth, async (req, res) => {
  try {
    let query = { status: { $in: ['scheduled', 'live', 'ended', 'completed'] } };

    // For students, filter by enrolled courses if student has enrolled courses
    if (req.user.role === 'student') {
      const enrolledCourses = await Course.find({ enrolledStudents: req.user.id }).select('_id title code');
      if (enrolledCourses.length > 0) {
        const courseIds = enrolledCourses.map(c => c._id);
        const courseCodes = enrolledCourses.map(c => c.code);
        query.$or = [
          { course: { $in: courseIds } },
          { courseId: { $in: courseIds } },
          { courseName: { $in: courseCodes } }
        ];
      }
    }

    const liveClasses = await LiveClass.find(query)
      .populate('faculty', 'name email role')
      .populate('course', 'title code')
      .sort({ scheduledStart: 1, createdAt: -1 });

    res.json(liveClasses);
  } catch (err) {
    console.error('Error fetching live classes:', err.message);
    res.status(500).json({ msg: 'Server error fetching live classes' });
  }
});

/**
 * @route GET /api/live-classes/:id or /api/live/:meetingId
 * @desc  Get single live class details & verify authorization
 * @access Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const meeting = await LiveClass.findOne({
      $or: [{ meetingId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    }).populate('faculty', 'name email role').populate('course', 'title code');

    if (!meeting) {
      return res.status(404).json({ msg: 'Live class not found' });
    }

    // Verify student course enrollment if student
    if (req.user.role === 'student' && meeting.course) {
      const isEnrolled = await Course.exists({ _id: meeting.course, enrolledStudents: req.user.id });
      if (!isEnrolled) {
        // Also check if course has open enrollment
        const courseDoc = await Course.findById(meeting.course);
        if (courseDoc && courseDoc.enrolledStudents && courseDoc.enrolledStudents.length > 0 && !courseDoc.enrolledStudents.includes(req.user.id)) {
          return res.status(403).json({ msg: 'Not authorized: You are not enrolled in this course' });
        }
      }
    }

    res.json({
      meeting,
      userRole: req.user.role,
      userId: req.user.id
    });
  } catch (err) {
    console.error('Error fetching meeting:', err.message);
    res.status(500).json({ msg: 'Server error fetching meeting details' });
  }
});

/**
 * @route POST /api/live-classes or /api/live
 * @desc  Create/Schedule a new live class (Faculty/Admin)
 * @access Faculty, Admin
 */
router.post('/', auth, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const { title, topic, description, courseName, courseId, scheduledStart, scheduledEnd } = req.body;
    if (!title) {
      return res.status(400).json({ msg: 'Title is required for live class' });
    }

    const meetingId = generateMeetingId(courseName || 'SYS');
    const newClass = new LiveClass({
      meetingId,
      title,
      topic: topic || '',
      description: description || '',
      courseName: courseName || 'General',
      course: courseId || null,
      courseId: courseId || null,
      faculty: req.user.id,
      facultyId: req.user.id,
      scheduledStart: scheduledStart ? new Date(scheduledStart) : new Date(),
      scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : new Date(Date.now() + 90 * 60 * 1000),
      status: 'scheduled'
    });

    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    console.error('Error creating live class:', err.message);
    res.status(500).json({ msg: 'Server error creating live class' });
  }
});

/**
 * @route POST /api/live-classes/:id/start or /api/live/:meetingId/start
 * @desc  Start live class (Faculty only)
 * @access Faculty, Admin
 */
router.post(['/:id/start', '/:meetingId/start'], auth, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const meeting = await LiveClass.findOneAndUpdate(
      { $or: [{ meetingId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }] },
      { status: 'live', startedAt: new Date() },
      { new: true }
    );
    if (!meeting) return res.status(404).json({ msg: 'Live class not found' });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ msg: 'Server error starting live class' });
  }
});

/**
 * @route POST /api/live-classes/:id/join or /api/live/:meetingId/join
 * @desc  Join live class (Student/Faculty)
 * @access Private
 */
router.post(['/:id/join', '/:meetingId/join'], auth, async (req, res) => {
  try {
    const meeting = await LiveClass.findOne({
      $or: [{ meetingId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });
    if (!meeting) return res.status(404).json({ msg: 'Live class not found' });

    if (meeting.status === 'ended' || meeting.status === 'completed' || meeting.status === 'cancelled') {
      return res.status(409).json({ msg: 'This live class has already ended' });
    }

    // Verify enrollment for students
    if (req.user.role === 'student' && meeting.course) {
      const courseDoc = await Course.findById(meeting.course);
      if (courseDoc && courseDoc.enrolledStudents && courseDoc.enrolledStudents.length > 0 && !courseDoc.enrolledStudents.includes(req.user.id)) {
        return res.status(403).json({ msg: 'Not authorized: You are not enrolled in this course' });
      }
    }

    res.json({ msg: 'Access granted to live class', meetingId: meeting.meetingId, status: meeting.status });
  } catch (err) {
    res.status(500).json({ msg: 'Server error joining live class' });
  }
});

/**
 * @route POST /api/live-classes/:id/leave or /api/live/:meetingId/leave
 * @desc  Leave live class
 * @access Private
 */
router.post(['/:id/leave', '/:meetingId/leave'], auth, async (req, res) => {
  try {
    res.json({ msg: 'Successfully left live class' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error leaving live class' });
  }
});

/**
 * @route POST /api/live-classes/:id/end or /api/live/:meetingId/end
 * @desc  End live class (Faculty only)
 * @access Faculty, Admin
 */
router.post(['/:id/end', '/:meetingId/end'], auth, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const meeting = await LiveClass.findOneAndUpdate(
      { $or: [{ meetingId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }] },
      { status: 'ended', endedAt: new Date(), activeParticipantsCount: 0 },
      { new: true }
    );
    if (!meeting) return res.status(404).json({ msg: 'Live class not found' });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ msg: 'Server error ending live class' });
  }
});

/**
 * @route GET /api/live-classes/:id/attendance or /api/live/:meetingId/attendance
 * @desc  Get attendance records for a live class
 * @access Faculty, Admin
 */
router.get(['/:id/attendance', '/:meetingId/attendance'], auth, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const meeting = await LiveClass.findOne({
      $or: [{ meetingId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });
    const meetingId = meeting ? meeting.meetingId : req.params.id;

    const attendance = await Attendance.find({ meetingId })
      .populate('student', 'email name role')
      .sort({ joinTime: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ msg: 'Server error fetching attendance' });
  }
});

/**
 * @route GET /api/live-classes/:id/chat or /api/live/:meetingId/chat
 * @desc  Get chat history for a live class
 * @access Private
 */
router.get(['/:id/chat', '/:meetingId/chat'], auth, async (req, res) => {
  try {
    const meeting = await LiveClass.findOne({
      $or: [{ meetingId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });
    const meetingId = meeting ? meeting.meetingId : req.params.id;

    const messages = await ChatMessage.find({ meetingId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Server error fetching chat' });
  }
});

module.exports = router;
