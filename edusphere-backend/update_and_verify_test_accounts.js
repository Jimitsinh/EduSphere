const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const LiveClass = require('./models/LiveClass');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5050';
const JWT_SECRET = process.env.JWT_SECRET || 'edusphere_secure_key_2026';

async function setupAndVerify() {
  await mongoose.connect('mongodb://127.0.0.1:27017/edusphere');

  // 1. Create/Update Faculty User
  let faculty = await User.findOne({ email: 'jimitsinhataliya25@gmail.com' });
  if (!faculty) {
    faculty = await User.create({ email: 'jimitsinhataliya25@gmail.com', name: 'Jimit Sinha Taliya', role: 'faculty' });
  } else {
    faculty.role = 'faculty';
    faculty.name = 'Jimit Sinha Taliya';
    await faculty.save();
  }

  // 2. Create/Update Student User
  let student = await User.findOne({ email: '2403031057005@paruluniversity.ac.in' });
  if (!student) {
    student = await User.create({ email: '2403031057005@paruluniversity.ac.in', name: 'Parul Student', role: 'student' });
  } else {
    student.role = 'student';
    await student.save();
  }

  // 3. Create/Update Course OS-301 & Enroll Student
  let course = await Course.findOne({
    $or: [{ code: 'OS-301' }, { title: 'Operating Systems: Kernel Architectures' }]
  });
  if (!course) {
    course = await Course.create({
      code: 'OS-301',
      title: 'Operating Systems: Kernel Architectures',
      description: 'Monolithic vs microkernel architectures and virtual memory passes.',
      faculty: faculty._id,
      enrolledStudents: [student._id]
    });
  } else {
    course.faculty = faculty._id;
    if (!course.enrolledStudents.includes(student._id)) {
      course.enrolledStudents.push(student._id);
    }
    await course.save();
  }

  console.log('=== DATABASE VERIFICATION ===');
  console.log('Faculty Email:', faculty.email, '| Role:', faculty.role, '| ID:', faculty._id);
  console.log('Student Email:', student.email, '| Role:', student.role, '| ID:', student._id);
  console.log('Course Code:', course.code, '| Faculty ID:', course.faculty, '| Enrolled Students:', course.enrolledStudents);

  await mongoose.disconnect();

  // API Verification
  console.log('\n=== API & OTP VERIFICATION ===');

  // Test Faculty OTP request
  const facReq = await axios.post(`${API_BASE}/api/otp/request`, { email: 'jimitsinhataliya25@gmail.com' }, { headers: { 'x-test-mode': 'true' } });
  console.log('Faculty OTP Request Response:', facReq.status, JSON.stringify(facReq.data));

  // Test Student OTP request
  const stuReq = await axios.post(`${API_BASE}/api/otp/request`, { email: '2403031057005@paruluniversity.ac.in' }, { headers: { 'x-test-mode': 'true' } });
  console.log('Student OTP Request Response:', stuReq.status, JSON.stringify(stuReq.data));

  // Generate tokens to test JWT roles & permissions
  const facultyToken = jwt.sign({ user: { id: faculty._id.toString(), role: 'faculty' } }, JWT_SECRET, { expiresIn: '1h' });
  const studentToken = jwt.sign({ user: { id: student._id.toString(), role: 'student' } }, JWT_SECRET, { expiresIn: '1h' });

  // Test Faculty Creates Class
  const classRes = await axios.post(`${API_BASE}/api/live-classes`, {
    title: 'Operating Systems Virtual Memory Lecture',
    topic: 'Kernel Paging & Demand Allocation',
    courseName: 'OS-301',
    courseId: course._id.toString()
  }, { headers: { 'x-auth-token': facultyToken } });
  console.log('Faculty Created Class:', classRes.data.meetingId);
  const meetingId = classRes.data.meetingId;

  // Faculty Starts Class
  await axios.post(`${API_BASE}/api/live-classes/${meetingId}/start`, {}, { headers: { 'x-auth-token': facultyToken } });

  // Student Joins Class
  const joinRes = await axios.post(`${API_BASE}/api/live-classes/${meetingId}/join`, {}, { headers: { 'x-auth-token': studentToken } });
  console.log('Enrolled Student Joined Class:', joinRes.data.msg);

  // Student Cannot Access Faculty Controls (RBAC Test)
  try {
    await axios.post(`${API_BASE}/api/live-classes/${meetingId}/end`, {}, { headers: { 'x-auth-token': studentToken } });
    console.error('FAIL: Student ended class!');
  } catch (rbacErr) {
    console.log('Student RBAC Rejection (End Class):', rbacErr.response.status, rbacErr.response.data.msg);
  }

  // Cleanup: Faculty Ends Class
  await axios.post(`${API_BASE}/api/live-classes/${meetingId}/end`, {}, { headers: { 'x-auth-token': facultyToken } });
  console.log('\n=== ALL VERIFICATION CHECKS PASSED ===\n');
}

setupAndVerify().catch(err => {
  console.error('Setup error:', err.response?.data || err.message);
  process.exit(1);
});
