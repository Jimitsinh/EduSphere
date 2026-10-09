const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'edusphere_secure_key_2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({ email, password: hashedPassword, role: role || 'student' });
        await user.save();

        // Generate JWT Token
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, role: user.role });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            // Auto-register for prototype demo purposes
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user = new User({ email, password: hashedPassword, role: 'student' });
            await user.save();
        } else {
            // Validate password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Generate JWT Token
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, role: user.role });
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

/**
 * @route POST /api/auth/google
 * @desc  Verify Google ID token, find or create user, return JWT
 */
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ msg: 'Google credential required' });
        }

        if (!GOOGLE_CLIENT_ID) {
            return res.status(500).json({ msg: 'Google OAuth not configured on server' });
        }

        const client = new OAuth2Client(GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const googlePayload = ticket.getPayload();
        const { email, name, sub: googleId } = googlePayload;

        if (!email) {
            return res.status(400).json({ msg: 'Could not retrieve email from Google' });
        }

        // Find or create user
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                email,
                name: name || '',
                password: '', // No password for Google OAuth users
                role: 'student',
            });
            await user.save();
        } else if (!user.name && name) {
            user.name = name;
            await user.save();
        }

        const jwtPayload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '2h' });
        return res.json({ token, role: user.role, email: user.email, name: user.name });
    } catch (err) {
        console.error('Google auth error:', err.message);
        return res.status(401).json({ msg: 'Invalid Google credential' });
    }
});

/**
 * Helper to derive clean display name from email if not explicitly set
 */
function getDerivedName(email, existingName) {
    if (existingName && existingName.trim()) return existingName.trim();
    if (!email) return 'Scholar';
    const local = email.split('@')[0];
    const clean = local.replace(/[\._\-]/g, ' ').replace(/\d+/g, '').trim();
    if (clean) {
        return clean.split(/\s+/).filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    }
    return local;
}

/**
 * @route GET /api/auth/me
 * @desc  Get current user info from JWT
 * @access Private
 */
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const derivedName = getDerivedName(user.email, user.name);
        const institution = user.institution || (user.email.includes('@paruluniversity') ? 'Parul University' : 'Metropolitan Institute of Arts & Sciences');
        const department = user.department || 'Compiler Design & Database Systems';
        const studentId = user.studentId || `EDU-${user.id.slice(-5).toUpperCase()}`;

        res.json({
            id: user.id,
            email: user.email,
            name: user.name || derivedName,
            role: user.role,
            institution,
            department,
            bio: user.bio || 'Honours-track researcher specialising in compiler optimisations, concurrent database indexing, and AI-driven educational systems.',
            studentId,
            avatar: typeof user.avatar === 'number' ? user.avatar : 0,
            socialLinks: user.socialLinks || {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route PUT /api/auth/profile
 * @desc  Update current user's profile details
 * @access Private
 */
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, institution, department, bio, studentId, avatar, socialLinks } = req.body;
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (institution !== undefined) updateFields.institution = institution;
        if (department !== undefined) updateFields.department = department;
        if (bio !== undefined) updateFields.bio = bio;
        if (studentId !== undefined) updateFields.studentId = studentId;
        if (avatar !== undefined) updateFields.avatar = avatar;
        if (socialLinks !== undefined) updateFields.socialLinks = socialLinks;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const derivedName = getDerivedName(updatedUser.email, updatedUser.name);
        res.json({
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name || derivedName,
            role: updatedUser.role,
            institution: updatedUser.institution || (updatedUser.email.includes('@paruluniversity') ? 'Parul University' : 'Metropolitan Institute of Arts & Sciences'),
            department: updatedUser.department || 'Compiler Design & Database Systems',
            bio: updatedUser.bio || 'Honours-track researcher specialising in compiler optimisations, concurrent database indexing, and AI-driven educational systems.',
            studentId: updatedUser.studentId || `EDU-${updatedUser.id.slice(-5).toUpperCase()}`,
            avatar: typeof updatedUser.avatar === 'number' ? updatedUser.avatar : 0,
            socialLinks: updatedUser.socialLinks || {}
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;