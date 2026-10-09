const axios = require('axios');

(async () => {
  try {
    const apiBase = 'http://localhost:5050/api/otp';
    const email = 'test3@example.com';
    // Request OTP (no test mode header)
    const requestRes = await axios.post(`${apiBase}/request`, { email });
    console.log('OTP request response:', requestRes.data);
    const otp = requestRes.data.otp;
    if (!otp) {
      console.error('No OTP returned – maybe email not configured');
      return;
    }
    // Verify OTP
    const verifyRes = await axios.post('http://localhost:5050/api/otp/verify', { email, otp });
    console.log('OTP verify response:', verifyRes.data);
    const token = verifyRes.data.token;
    // Get current user info
    const meRes = await axios.get('http://localhost:5050/api/auth/me', { headers: { 'x-auth-token': token } });
    console.log('Authenticated user info:', meRes.data);
  } catch (err) {
    console.error('Error during login flow test:', err.response ? err.response.data : err.message);
  }
})();
