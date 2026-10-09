const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  meetingId: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, default: 'student' },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

ChatMessageSchema.index({ meetingId: 1, timestamp: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
