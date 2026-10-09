const axios = require('axios');

(async () => {
  try {
    const apiBase = 'http://localhost:5050/api/otp';
    const email = 'test@example.com';
    // Request OTP in test mode to receive OTP directly
    const requestRes = await axios.post(`${apiBase}/request`, { email }, { headers: { 'x-test-mode': 'true' } });
    console.log('OTP request response:', requestRes.data);
    const otp = requestRes.data.otp;
    if (!otp) {
      console.error('No OTP returned');
      return;
    }
    // Verify OTP
    const verifyRes = await axios.post('http://localhost:5050/api/otp/verify', { email, otp }, { headers: { 'x-test-mode': 'true' } });
    console.log('OTP verify response:', verifyRes.data);
    const token = verifyRes.data.token;
    // Get current user info
    const meRes = await axios.get('http://localhost:5050/api/auth/me', { headers: { 'x-auth-token': token } });
    console.log('Authenticated user info:', meRes.data);
  } catch (err) {
    console.error('Error during login flow test:', err.response ? err.response.data : err.message);
  }
})();
