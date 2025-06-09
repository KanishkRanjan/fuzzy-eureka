import express from "express";
const app = express();
const PORT = 3000;
import cors from "cors";

import mongoose from "mongoose";

import serverless from "serverless-http";

import Institution from "./colleges_schema.js";

import connectDB from "./connection.js";

app.use(
  cors({
    origin: "*", // or '*' to allow all
    credentials: true, // if you're sending cookies or auth headers
  })
);
// Middleware (optional)
app.use(express.json());

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.get("/", (req, res) => {
  res.send("Welcome to the Shiksha API!");
});

app.post("/api/save-applied-college", async (req, res) => {
  const { name, email, phone, college_id, message } = req.body;
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
  console.log(
    `Form submitted by: ${name}, Email: ${email}, Phone: ${phone}, College ID: ${college_id}`
  );
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
  console.log(`Form submitted by: ${name}, Email: ${email}, Phone: ${phone}`);

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
  const { category, branch, search } = req.query;

  if (search) {
    console.log("Search query received:", search);
    const regex = new RegExp(search, "i");
    try {
      const colleges = await Institution.find({
        $or: [
          { name: regex },
          { "location.city": regex },
          { "location.state": regex },
          { "courses_offered.name": { $regex: regex } },
        ],
      }).sort({ score: -1 });

      console.log(
        "Data fetched from database:",
        colleges.length,
        "records found."
      );
      if (colleges.length !== 0)
        return res.status(200).send({ success: true, colleges });
    } catch (err) {
      console.error("Error fetching colleges:", err);
      return res
        .status(500)
        .send({ success: false, message: "Error fetching colleges." });
    }
  }

  const regexCategory = category ? new RegExp(category, "i") : /.*/;
  const regexBranch = branch ? new RegExp(branch, "i") : /.*/;

  console.log("Received query parameters:", { category, branch });
  try {
    const colleges = await Institution.find({
      "eligibility_criteria.name": { $regex: regexCategory },
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

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  subject: String,
  message: String,
});
const Contact = mongoose.model("Contact", contactSchema, "shiksha_contact");


app.post("/api/submit-contact-form", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  console.log("Received contact form data:", req.body);

  if (!name || !email || !phone || !subject) {
    console.error("Missing required fields:", {
      name,
      email,
      phone,
      subject,
      message,
    });

    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });
    await newContact.save();

    console.log(`Contact form submitted by ${name}.`);
    res.json({
      success: true,
      message: `Form submitted successfully by ${name}`,
    });
  } catch (err) {
    console.error("Error saving contact form data:", err);
    res
      .status(500)
      .json({ success: false, message: "Error saving contact form data." });
  }
});
app.get("/api/get-showcase", async (req, res) => {
  const colleges_id = [
    "6845e51eb08f37b2f3cb7ff8", // RV College of Engineering
    "6845e51eb08f37b2f3cb7ffa", // BMS College of Engineering
    "6845e51db08f37b2f3cb7ff6", // MS Ramaiah Institute of Technology
    "6845e51fb08f37b2f3cb8006", // Dayananda Sagar College of Engineering
    "6845e520b08f37b2f3cb800e", // Bangalore Institute of Technology
    "6845e520b08f37b2f3cb8010", // BMS Institute of Technology and Management
    "6845e51fb08f37b2f3cb8002", // Nitte Meenakshi Institute of Technology
  ].map(id => new mongoose.Types.ObjectId(id)); // convert to ObjectId

  try {
    const colleges = await Institution.find({ _id: { $in: colleges_id } })
      .sort({ score: -1 });
    console.log("Showcase colleges fetched:", colleges.length);
    res.status(200).send({ success: true, colleges });
  } catch (err) {
    console.error("Error fetching showcase colleges:", err);
    res.status(500).send({ success: false, message: "Error fetching showcase colleges." });
  }
});
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// export default serverless(app);
