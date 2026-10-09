const mongoose = require('mongoose');

const LiveClassSchema = new mongoose.Schema({
  meetingId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  topic: { type: String, default: '' },
  description: { type: String, default: '' },
  courseName: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facultyName: { type: String, default: 'Faculty' },
  scheduledStart: { type: Date, default: Date.now },
  scheduledEnd: { type: Date },
  startedAt: { type: Date },
  endedAt: { type: Date },
  status: { type: String, enum: ['scheduled', 'live', 'ended', 'completed', 'cancelled'], default: 'scheduled' },
  activeParticipantsCount: { type: Number, default: 0 }
}, { timestamps: true });

LiveClassSchema.index({ status: 1 });
LiveClassSchema.index({ courseName: 1 });

module.exports = mongoose.model('LiveClass', LiveClassSchema);
