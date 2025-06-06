const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Institution Schema
const InstitutionSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      default: 'India',
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      match: /^[0-9]{6}$/, // Validates 6-digit pincode
    },
  },
  established_year: {
    type: Number,
    required: true,
    min: 1850,
    max: new Date().getFullYear(),
  },
  accreditation: {
    type: String,
    required: true,
    trim: true,
  },
  total_students: {
    type: Number,
    required: true,
    min: 100,
    max: 50000,
  },
  admission_process: {
    type: String,
    required: true,
  },
  required_documents: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length >= 1; // Ensure at least one document
      },
      message: 'At least one required document must be specified.'
    },
  },
  contact_info: {
    email: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
    },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, // Validates 10-digit phone number
    },
    address: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true,
      match: /^https?:\/\/[^\s/$.?#].[^\s]*$/, // Basic URL validation
    },
  },
  courses_offered: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      duration: {
        type: Number,
        required: true,
        min: 1,
        max: 7,
      },
      annual_fees: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  eligibility_criteria: [
    {
      course: {
        type: String,
        required: true,
        trim: true,
      },
      eligibility: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
  acceptance_exams: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length >= 1; // Ensure at least one exam
      },
      message: 'At least one acceptance exam must be specified.'
    },
  },
  top_recruiters: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length >= 1; // Ensure at least one recruiter
      },
      message: 'At least one top recruiter must be specified.'
    },
  },
  placements: {
    average_salary: {
      type: Number,
      required: true,
      min: 0,
    },
    highest_salary: {
      type: Number,
      required: true,
      min: 0,
    },
    placement_rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  image_url: {
    type: String,
    required: true,
    match: /^https?:\/\/[^\s/$.?#].[^\s]*$/, // Basic URL validation
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  field_taught: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length >= 1; // Ensure at least one recruiter
      },
      message: 'At least one top recruiter must be specified.'
    },
  },
});

// Create and export the model
module.exports = mongoose.model('Institution', InstitutionSchema);