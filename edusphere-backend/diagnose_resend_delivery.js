const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const resendKey = (process.env.RESEND_API_KEY || '').trim();
const smtpFrom = process.env.SMTP_FROM;
const resendFrom = process.env.RESEND_FROM;
const emailFrom = process.env.EMAIL_FROM;

const defaultFrom = resendKey ? 'EduSphere <onboarding@resend.dev>' : 'EduSphere <no-reply@edusphere.com>';
const senderInUse = smtpFrom || resendFrom || emailFrom || defaultFrom;

let senderSource = 'hardcoded fallback';
if (smtpFrom) senderSource = 'SMTP_FROM';
else if (resendFrom) senderSource = 'RESEND_FROM';
else if (emailFrom) senderSource = 'EMAIL_FROM';

console.log('=== SENDER CONFIGURATION DIAGNOSIS ===');
console.log('Sender Source:', senderSource);
console.log('Sender Address Currently Being Used:', senderInUse);
console.log('API Key Present:', !!resendKey);

async function testResendDelivery(emailLabel, recipientEmail) {
  console.log(`\n=== TESTING RESEND DELIVERY FOR ${emailLabel} (${recipientEmail}) ===`);
  try {
    const res = await axios.post(
      'https://api.resend.com/emails',
      {
        from: senderInUse,
        to: [recipientEmail],
        subject: 'EduSphere Real Delivery Test',
        html: '<p>Testing Resend live inbox delivery for EduSphere OTP.</p>'
      },
      {
        headers: { Authorization: `Bearer ${resendKey}` }
      }
    );

    console.log('Resend HTTP Status:', res.status);
    console.log('Resend Accepted Email:', true);
    console.log('Resend Message ID:', res.data.id || 'N/A');
    console.log('Exact Error Message: NONE');
    return { status: res.status, accepted: true, messageId: res.data.id, error: null };
  } catch (err) {
    const status = err.response?.status || 'NETWORK_ERROR';
    const errData = err.response?.data || {};
    const exactMsg = errData.message || err.message;
    const name = errData.name || 'Error';

    console.log('Resend HTTP Status:', status);
    console.log('Resend Accepted Email:', false);
    console.log('Resend Message ID: NONE');
    console.log('Resend Error Name:', name);
    console.log('Exact Error Message:', exactMsg);
    return { status, accepted: false, messageId: null, error: exactMsg, name };
  }
}

async function runDiagnosis() {
  const studentResult = await testResendDelivery('STUDENT', '2403031057005@paruluniversity.ac.in');
  const facultyResult = await testResendDelivery('FACULTY', 'jimitsinhataliya25@gmail.com');

  console.log('\n=== DIAGNOSIS SUMMARY ===');
  console.log('Sender:', senderInUse);
  console.log('Sender Source:', senderSource);
  console.log('Student Delivery (2403031057005@paruluniversity.ac.in):', studentResult.accepted ? 'ACCEPTED (Message ID: ' + studentResult.messageId + ')' : 'REJECTED (' + studentResult.error + ')');
  console.log('Faculty Delivery (jimitsinhataliya25@gmail.com):', facultyResult.accepted ? 'ACCEPTED (Message ID: ' + facultyResult.messageId + ')' : 'REJECTED (' + facultyResult.error + ')');
}

runDiagnosis();
