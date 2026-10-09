const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  marks: { type: Number, default: 10 },
  options: [String], // Empty for subjective text answers
  correctAnswer: String // Index or text key for validation
});

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  durationMins: { type: Number, default: 45 },
  isProctored: { type: Boolean, default: false },
  questions: [QuestionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);
