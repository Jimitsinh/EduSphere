const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submittedAt: { type: Date, default: Date.now },
  submittedText: { type: String, required: true },
  grade: { type: String, default: 'Pending' }
});

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  description: { type: String, required: true },
  dueDateString: { type: String, required: true }, // e.g. "Due today", "Due in 2 days"
  submissions: [SubmissionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);
