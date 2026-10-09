const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String, default: '' },
  action: { type: String, required: true },
  ipAddress: { type: String, default: '' },
  details: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

AuditLogSchema.index({ user: 1, action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
