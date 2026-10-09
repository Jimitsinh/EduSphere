const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'edusphere_secure_key_2026'; // use env if set

/**
 * Generic role‑based access control middleware.
 * Usage: `requireRole(['faculty', 'admin'])`
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Forbidden: insufficient role' });
    }
    next();
  };
}

/**
 * Admin‑only middleware.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin access required' });
  }
  next();
}

module.exports = { requireRole, requireAdmin };
