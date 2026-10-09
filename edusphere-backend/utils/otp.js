const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a 6‑digit numeric OTP.
 * Returns plain OTP (string) and its bcrypt hash.
 */
function generateOtp() {
  const otp = crypto.randomInt(100000, 1000000).toString(); // 6‑digit
  const otpHash = bcrypt.hashSync(otp, 10);
  return { otp, otpHash };
}

/**
 * Verify a submitted OTP against the stored hash.
 * Returns true if matches, false otherwise.
 */
function verifyOtp(plainOtp, hash) {
  return bcrypt.compareSync(plainOtp, hash);
}

module.exports = { generateOtp, verifyOtp };
