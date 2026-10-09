const mongoose = require('mongoose');

const ExamAttemptSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  examTitle: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentEmail: { type: String, required: true },
  answers: { type: Map, of: String },
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  proctorFlagsCount: { type: Number, default: 0 }
}, { timestamps: true });

ExamAttemptSchema.index({ exam: 1, student: 1 });

module.exports = mongoose.model('ExamAttempt', ExamAttemptSchema);
