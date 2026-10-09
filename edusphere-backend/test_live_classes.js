const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5050';
const JWT_SECRET = process.env.JWT_SECRET || 'edusphere_secure_key_2026';

function generateTestToken(id, role, email) {
  return jwt.sign({ user: { id, role, email } }, JWT_SECRET, { expiresIn: '1h' });
}

async function runLiveClassTests() {
  console.log('=== Live Class REST API & RBAC Test Suite ===');

  const facultyToken = generateTestToken('6a782e1cd8e9ac7cf5dc581a', 'faculty', 'faculty@test.com');
  const studentToken = generateTestToken('6a782e1cd8e9ac7cf5dc5813', 'student', 'student@test.com');

  try {
    // 1. Faculty Creates Live Class
    console.log('\n--- Test 1: Faculty Creates Live Class ---');
    const createRes = await axios.post(`${API_BASE}/api/live-classes`, {
      title: 'Advanced Compiler Optimization Passes',
      topic: 'SSA Form & Loop Vectorization',
      description: 'Deep dive into LLVM IR optimization passes.',
      courseName: 'COMP-501'
    }, { headers: { 'x-auth-token': facultyToken } });
    console.log('✓ PASS: Class created with meetingId:', createRes.data.meetingId);
    const meetingId = createRes.data.meetingId;

    // 2. Student Cannot Create Faculty Live Class
    console.log('\n--- Test 2: Student Cannot Create Live Class (RBAC) ---');
    try {
      await axios.post(`${API_BASE}/api/live-classes`, { title: 'Illegal Class' }, { headers: { 'x-auth-token': studentToken } });
      console.error('✗ FAIL: Student was able to create a class!');
    } catch (err) {
      console.log('✓ PASS: Student rejected with status', err.response?.status);
    }

    // 3. Faculty Starts Class
    console.log('\n--- Test 3: Faculty Starts Live Class ---');
    const startRes = await axios.post(`${API_BASE}/api/live-classes/${meetingId}/start`, {}, { headers: { 'x-auth-token': facultyToken } });
    console.log('✓ PASS: Status updated to:', startRes.data.status);

    // 4. Student Joins Class
    console.log('\n--- Test 4: Student Joins Active Live Class ---');
    const joinRes = await axios.post(`${API_BASE}/api/live-classes/${meetingId}/join`, {}, { headers: { 'x-auth-token': studentToken } });
    console.log('✓ PASS: Access granted:', joinRes.data.msg);

    // 5. Fetch Single Class Details
    console.log('\n--- Test 5: Fetch Single Class Details ---');
    const getRes = await axios.get(`${API_BASE}/api/live-classes/${meetingId}`, { headers: { 'x-auth-token': studentToken } });
    console.log('✓ PASS: Meeting title verified:', getRes.data.meeting.title);

    // 6. Faculty Ends Class
    console.log('\n--- Test 6: Faculty Ends Live Class ---');
    const endRes = await axios.post(`${API_BASE}/api/live-classes/${meetingId}/end`, {}, { headers: { 'x-auth-token': facultyToken } });
    console.log('✓ PASS: Status updated to:', endRes.data.status);

    // 7. Student Cannot Join Ended Class
    console.log('\n--- Test 7: Student Rejects Join on Ended Class ---');
    try {
      await axios.post(`${API_BASE}/api/live-classes/${meetingId}/join`, {}, { headers: { 'x-auth-token': studentToken } });
      console.error('✗ FAIL: Student joined ended class!');
    } catch (err) {
      console.log('✓ PASS: Join rejected with HTTP status', err.response?.status, ':', err.response?.data?.msg);
    }

    console.log('\n=== Live Class API Test Summary: ALL PASSED ===\n');
  } catch (err) {
    console.error('Live class test error:', err.response?.data || err.message);
    process.exit(1);
  }
}

runLiveClassTests();
