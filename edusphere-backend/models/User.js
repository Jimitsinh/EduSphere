const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, default: '' },
    name: { type: String, default: '' },
    role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
    institution: { type: String, default: '' },
    department: { type: String, default: '' },
    bio: { type: String, default: '' },
    studentId: { type: String, default: '' },
    avatar: { type: Number, default: 0 },
    socialLinks: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' },
        portfolio: { type: String, default: '' }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);