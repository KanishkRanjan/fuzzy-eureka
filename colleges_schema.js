// models/Institution.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: String,
  duration: String,
  fee: Number,
  eligibility: String,
});

const placementSchema = new mongoose.Schema({
  average_salary: Number,
  highest_salary: Number,
  placement_rate: Number,
});

const institutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Private', 'Government', 'Deemed University', 'Public University', 'Autonomous Institution', 'Other'], required: true },

  location: {
    city: String,
    state: String,
    country: String,
    pincode: String,
  },

  established_year: String,
  accreditation: String,
  total_students: Number,

  admission_process: String,
  required_documents: [String],

  contact_info: {
    email: String,
    phone: String,
    address: String,
    website: String,
  },

  courses_offered: [courseSchema],
  eligibility_criteria: {
    BTech: String,
    MBA: String,
    MBBS: String,
    BBA: String,
    BCA: String,
    MTech: String,
    LLB: String,
    BSc: String,
    MSc: String,
    BCom: String,
  },

  acceptance_exams: [String],
  top_recruiters: [String],

  placements: placementSchema,

  image_url: String,
  rating: Number,
  field_taught: [String],

  score: Number,
}, { timestamps: true });

export default mongoose.model("Institution", institutionSchema);
