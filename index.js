const express = require("express");
const app = express();
const PORT = 3000;
const cors = require("cors");

const mongoose = require("mongoose");
const donenv = require("dotenv");
donenv.config();

const Institution = require("./colleges_schema");

app.use(
  cors({
    origin: "*", // or '*' to allow all
    credentials: true, // if you're sending cookies or auth headers
  })
);
// Middleware (optional)
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log(mongoose.connection.name);
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));


app.post("/api/save-applied-college", async (req, res) => {
  const { name , email , phone , college_id , message } = req.body;
  if (!name || !email || !phone || !college_id) {
    console.error("Missing required fields:", {
      name,
      email,
      phone,
      college_id,
      message,
    });
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }
  console.log(`Form submitted by: ${name}, Email: ${email}, Phone: ${phone}, College ID: ${college_id}`);
  // Schema
  const appliedSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    college_id: String,
    message: String,
  });
  // Model with specific collection name `shiksha_applied_colleges`
  const AppliedCollege = mongoose.model(
    "AppliedCollege",
    appliedSchema,
    "shiksha_applied_colleges"
  );  
  try {
    const newAppliedCollege = new AppliedCollege({
      name,
      email,
      phone,    
      college_id,
      message,
    });
    await newAppliedCollege.save();
    console.log(`Applied college data saved for ${name}.`);
    res.json({
      success: true,
      message: `Form submitted successfully by ${name}`,
    });
  } catch (err) {
    console.error("Error saving applied college data:", err);
    res
      .status(500)
      .json({ success: false, message: "Error saving applied college data." });
  }
});


app.post("/api/submit-counseling-request", async (req, res) => {
  const { fullname, email, phone, interestedCourse } = req.body;
  console.log("Received request body:", req.body);

  if (!fullname || !email || !phone || !interestedCourse) {
    console.error("Missing required fields:", {
      fullname,
      email,
      phone,
      interestedCourse,
    });
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  console.log(
    `Form submitted by: ${fullname}, Email: ${email}, Phone: ${phone}`
  );

  // Schema
  const userSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    phone: String,
    interestedCourse: String,
  });

  // Model with specific collection name `shiksha_data`
  const User = mongoose.model("UserResponse", userSchema, "shiksha_data");

  try {
    const newUser = new User({ fullname, email, phone, interestedCourse });
    await newUser.save();

    console.log(`User ${fullname} saved to database.`);
    res.json({
      success: true,
      message: `Form submitted successfully by ${fullname}`,
    });
  } catch (err) {
    console.error("Error saving user to database:", err);
    res
      .status(500)
      .json({ success: false, message: "Error saving user to database." });
  }
});

app.post("/api/save-response", async (req, res) => {
  const { name, email, phone, state, city, course, message } = req.body;
  console.log("Received request body:", req.body);
  if (!name || !email || !phone || !state || !city || !course) {
    console.error("Missing required fields:", {
      name,
      email,
      phone,
      state,
      city,
      course,
      message,
    });
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  const responseSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    phone: String,
    message: String,
    state: String,
    city: String,
    course: String,
  });
  console.log(
    `Form submitted by: ${name}, Email: ${email}, Phone: ${phone}`
  );

  const Response = mongoose.model(
    "Response",
    responseSchema,
    "shiksha_responses"
  );
  const newResponse = new Response({
    fullname: name,
    email: email,
    phone: phone,
    state: state,
    city: city,
    course: course,
    message: message,
  });
  newResponse
    .save()
    .then(() => {
      console.log(`Response saved successfully: ${name}`);
      res
        .status(200)
        .json({ success: true, message: "Response saved successfully." });
    })
    .catch((err) => {
      console.error("Error saving response:", err);
      res
        .status(500)
        .json({ success: false, message: "Error saving response." });
    });
});

app.get("/api/get-colleges", async (req, res) => {
  const { category, branch } = req.query;

  const regexCategory = category ? new RegExp(category, "i") : /.*/;
  const regexBranch = branch ? new RegExp(branch, "i") : /.*/;

  try {
    const colleges = await Institution.find({
      $and: [
        { "courses_offered.name": regexCategory },
        { field_taught: regexBranch },
      ],
    }).sort({ score: -1 });

    console.log(
      "Data fetched from database:",
      colleges.length,
      "records found."
    );

    return res.status(200).send({ success: true, colleges });
  } catch (err) {
    console.error("Error fetching colleges:", err);
    res
      .status(500)
      .send({ success: false, message: "Error fetching colleges." });
  }
});

app.get("/api/get-college-info", async (req, res) => {
  const collegeId = req.query.id;
  console.log("Received college ID:", collegeId);
  try {
    if (!collegeId) {
      return res
        .status(400)
        .send({ success: false, message: "College ID is required." });
    }

    const college = await Institution.findById(collegeId);
    if (!college) {
      return res
        .status(404)
        .send({ success: false, message: "College not found." });
    }
    console.log("College data fetched:", college);
    res.status(200).send({ success: true, college });
  } catch (err) {
    console.error("Error fetching college info:", err);
    res
      .status(500)
      .send({ success: false, message: "Error fetching college info." });
  }
});

app.get("/api/get-top-list", async (req, res) => {
  const query = req.query.query;
  const course = req.query.course;
  console.log("Received query:", query);

  try {
    if (!query) {
      const regex = course ? new RegExp(course, "i") : /.*/;
      const colleges = await Institution.find({
        $or: [{ "courses_offered.name": { $regex: regex } }],
      })
        .sort({ score: -1 })
        .limit(4);
      console.log(
        "Data fetched from database:",
        colleges.length,
        "records found."
      );
      return res.status(200).send({ success: true, colleges });
    }

    const regex = new RegExp(query, "i");
    console.log("Regex for search:", regex);

    const colleges = await Institution.find({
      $or: [
        { name: regex },
        { type: regex },
        { top_recruiters: { $regex: regex } },
        { acceptance_exams: { $regex: regex } },
        { "location.city": regex },
        { "location.state": regex },
        { "courses_offered.name": { $regex: regex } },
      ],
    })
      .sort({ score: -1 })
      .limit(4);

    console.log("Colleges found:", colleges.length);
    res.status(200).send({ success: true, colleges });
  } catch (err) {
    console.error("Error fetching colleges:", err);
    res
      .status(500)
      .send({ success: false, message: "Error fetching colleges." });
  }
});
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
