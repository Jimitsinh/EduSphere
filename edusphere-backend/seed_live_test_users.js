const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');

async function seedTestUsers() {
  await mongoose.connect('mongodb://127.0.0.1:27017/edusphere');
  console.log('Connected to MongoDB for live class user seeding...');

  let faculty = await User.findOne({ email: 'faculty@edusphere.com' });
  if (!faculty) {
    faculty = await User.create({ email: 'faculty@edusphere.com', name: 'Dr. Aris Thorne', role: 'faculty' });
  }

  let student = await User.findOne({ email: 'student@edusphere.com' });
  if (!student) {
    student = await User.create({ email: 'student@edusphere.com', name: 'Julian Scholar', role: 'student' });
  }

  let unauthStudent = await User.findOne({ email: 'unauthorized_student@edusphere.com' });
  if (!unauthStudent) {
    unauthStudent = await User.create({ email: 'unauthorized_student@edusphere.com', name: 'Unenrolled User', role: 'student' });
  }

  // Create course OS-301 with student enrolled
  let course = await Course.findOne({ code: 'OS-301' });
  if (!course) {
    course = await Course.create({
      code: 'OS-301',
      title: 'Operating Systems: Kernel Architectures',
      description: 'Kernel memory mapping and virtual memory passes.',
      faculty: faculty._id,
      enrolledStudents: [student._id]
    });
  } else {
    if (!course.enrolledStudents.includes(student._id)) {
      course.enrolledStudents.push(student._id);
      await course.save();
    }
  }

  console.log('Test users & course OS-301 seeded successfully:');
  console.log('- Faculty:', faculty.email, faculty._id);
  console.log('- Enrolled Student:', student.email, student._id);
  console.log('- Unauthorized Student:', unauthStudent.email, unauthStudent._id);
  console.log('- Course:', course.code, course._id);

  await mongoose.disconnect();
}

seedTestUsers().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
