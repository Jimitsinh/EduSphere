const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const User = require('./models/User'); // Import User model to attach enrolled students

dotenv.config();

const playlists = [
  { url: "https://youtube.com/playlist?list=PLxCzCOWd7aiH2wwES9vPWsEL6ipTaUSl3", title: "Computer Architecture" },
  { url: "https://youtube.com/playlist?list=PLxCzCOWd7aiHMonh3G6QNKq53C6oNXGrX", title: "Software Engineering" },
  { url: "https://youtube.com/playlist?list=PLxCzCOWd7aiEKtKSIHYusizkESC42diyc", title: "Computer Networks" },
  { url: "https://youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p", title: "Data Structures" },
  { url: "https://youtube.com/playlist?list=PLxCzCOWd7aiFjZP4z1_3Kr3m3J5wu5Q8V", title: "Algorithms" },
  { url: "https://youtube.com/playlist?list=PLxCzCOWd7aiEed7SKZBnC6ypFDWYLRvB2", title: "Discrete Mathematics" }
];

// Helper to convert playlist url to embed url
const getEmbedUrl = (url) => {
  const urlObj = new URL(url);
  const list = urlObj.searchParams.get("list");
  return `https://www.youtube.com/embed/videoseries?list=${list}`;
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edusphere');
    console.log("Connected to DB...");

    const users = await User.find({});
    const enrolledStudents = users.map(u => u._id);

    const newCourses = playlists.map((p, index) => ({
      title: p.title,
      description: `Comprehensive video series on ${p.title}. Explore the playlist directly through the modules.`,
      enrolledStudents: enrolledStudents,
      modules: [
        {
          title: "Introduction & Overview",
          lessons: [
            {
              title: `Full Playlist: ${p.title}`,
              content: "Watch the full course playlist below.",
              durationMins: 120,
              videoUrl: getEmbedUrl(p.url),
              completedBy: []
            }
          ]
        },
        {
          title: "Advanced Topics & Exercises",
          lessons: [
            {
              title: "Practice Set 1",
              content: "Apply the concepts learned in the playlist to solve these problems.",
              durationMins: 45,
              videoUrl: "",
              completedBy: []
            }
          ]
        }
      ]
    }));

    for (const courseData of newCourses) {
      // Upsert to avoid duplicate key errors if run multiple times
      await Course.findOneAndUpdate(
        { title: courseData.title },
        courseData,
        { upsert: true, new: true }
      );
    }

    console.log("Successfully seeded new courses!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
