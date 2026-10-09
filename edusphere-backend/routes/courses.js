const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');

// @route   GET /api/courses
// @desc    Get all courses with progress for current user
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find();
    
    // Format response to calculate student's individual progress percentage
    const formatted = courses.map(course => {
      let totalLessons = 0;
      let completedLessons = 0;
      
      const modules = course.modules.map(mod => {
        const lessons = mod.lessons.map(lesson => {
          const isCompleted = lesson.completedBy.includes(req.user.id);
          totalLessons++;
          if (isCompleted) completedLessons++;
          
          return {
            _id: lesson._id,
            title: lesson.title,
            content: lesson.content,
            durationMins: lesson.durationMins,
            videoUrl: lesson.videoUrl,
            isCompleted
          };
        });
        
        return {
          _id: mod._id,
          title: mod.title,
          lessons
        };
      });
      
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        progress: progressPercent,
        modules
      };
    });
    
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/courses/complete-lesson
// @desc    Mark a specific lesson as completed for the current user
router.post('/complete-lesson', auth, async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    
    let lessonFound = false;
    for (let mod of course.modules) {
      for (let lesson of mod.lessons) {
        if (lesson._id.toString() === lessonId) {
          lessonFound = true;
          // Add student to completedBy array if not already present
          if (!lesson.completedBy.includes(req.user.id)) {
            lesson.completedBy.push(req.user.id);
          }
          break;
        }
      }
    }
    
    if (!lessonFound) return res.status(404).json({ msg: 'Lesson not found' });
    
    await course.save();
    
    // Recalculate progress for response
    let totalLessons = 0;
    let completedLessons = 0;
    for (let mod of course.modules) {
      for (let lesson of mod.lessons) {
        totalLessons++;
        if (lesson.completedBy.includes(req.user.id)) {
          completedLessons++;
        }
      }
    }
    
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    res.json({ msg: 'Lesson marked complete', progress: progressPercent });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
