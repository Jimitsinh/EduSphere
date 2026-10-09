const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  meetingId: { type: String, required: true },
  liveClass: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveClass' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentEmail: { type: String, required: true },
  studentName: { type: String, default: '' },
  joinTime: { type: Date, default: Date.now },
  leaveTime: { type: Date },
  durationSeconds: { type: Number, default: 0 },
  status: { type: String, enum: ['present', 'partial', 'absent'], default: 'present' }
}, { timestamps: true });

AttendanceSchema.index({ meetingId: 1, student: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
