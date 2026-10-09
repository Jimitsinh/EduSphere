const mongoose = require('mongoose');

const ViolationItemSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. "tab_switch", "no_face", "multiple_faces", "high_decibel"
  timestamp: { type: Date, default: Date.now },
  description: String
});

const ProctorLogSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examTitle: { type: String, required: true },
  violations: [ViolationItemSchema],
  violationCount: { type: Number, default: 0 },
  averageAttentionScore: { type: Number, default: 100 },
  isFinished: { type: Boolean, default: false },
  answerSubmitted: String
}, { timestamps: true });

module.exports = mongoose.model('ProctorLog', ProctorLogSchema);
