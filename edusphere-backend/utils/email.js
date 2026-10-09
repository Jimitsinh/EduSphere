const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * Creates nodemailer transporter using standard transactional SMTP settings.
 */
function getTransporter() {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }

  return null;
}

/**
 * Send transactional email using SMTP or API Key (Resend / SendGrid / Postmark).
 * @param {string} to Recipient email address
 * @param {string} subject Email subject
 * @param {string} text Plain text body
 * @param {string} html HTML body
 */
async function sendMail(to, subject, text, html) {
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const defaultFrom = process.env.SMTP_USER ? `EduSphere <${process.env.SMTP_USER}>` : (resendKey ? 'EduSphere <onboarding@resend.dev>' : 'EduSphere <no-reply@edusphere.com>');
  const from = process.env.SMTP_FROM || process.env.RESEND_FROM || process.env.EMAIL_FROM || defaultFrom;

  // 1. Try SMTP Transporter first (Gmail, SendGrid, etc. — can send to any recipient)
  const transporter = getTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html: html || text
      });
      console.log('OTP Email sent via SMTP:', info.messageId);
      return info;
    } catch (smtpErr) {
      console.error('SMTP send failed:', smtpErr.message);
      // Fall through to Resend API if available
    }
  }

  // 2. Fallback to Resend HTTP API if API key is provided
  if (resendKey) {
    try {
      const res = await axios.post(
        'https://api.resend.com/emails',
        {
          from: resendKey ? 'EduSphere <onboarding@resend.dev>' : from,
          to: [to],
          subject,
          text,
          html: html || text
        },
        {
          headers: { Authorization: `Bearer ${resendKey}` }
        }
      );
      console.log('OTP Email sent via Resend API');
      return res.data;
    } catch (apiErr) {
      console.error('Resend API Error:', JSON.stringify(apiErr.response?.data || apiErr.message));
      throw apiErr;
    }
  }

  // 3. No provider available
  console.log('No email provider configured:', { to, subject });
  throw new Error('No email provider configured');
}

/**
 * Helper to check if any email provider is configured
 */
function isEmailConfigured() {
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const smtpHost = (process.env.SMTP_HOST || '').trim();
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();

  // In production we require a real provider. In development we allow missing config.
  if (process.env.NODE_ENV === 'production') {
    return !!(resendKey || (smtpHost && smtpUser && smtpPass));
  }
  // Development / test environment – treat as configured (will use dummy flow).
  return true;
}

/**
 * Safe backend-only email health check
 */
async function checkEmailHealth() {
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendKey) {
    return { emailConfigured: true, provider: 'resend' };
  }
  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.verify();
      return { emailConfigured: true, provider: 'smtp' };
    } catch (err) {
      console.error('SMTP Health check verification failed:', err.message);
      return { emailConfigured: false, provider: 'smtp', error: 'Email service configuration is invalid.' };
    }
  }
  return { emailConfigured: false, provider: 'none', error: 'No transactional email provider or SMTP configured.' };
}

module.exports = { sendMail, isEmailConfigured, checkEmailHealth };
