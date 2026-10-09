const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  durationMins: { type: Number, default: 15 },
  videoUrl: { type: String },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [LessonSchema]
});

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String },
  modules: [ModuleSchema],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
