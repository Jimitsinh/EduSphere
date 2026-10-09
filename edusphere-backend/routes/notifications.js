const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

/**
 * @route GET /api/notifications
 * @desc  Get user notifications
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route PUT /api/notifications/:id/read
 * @desc  Mark notification as read
 * @access Private
 */
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route PUT /api/notifications/read-all
 * @desc  Mark all notifications as read
 * @access Private
 */
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.json({ msg: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
