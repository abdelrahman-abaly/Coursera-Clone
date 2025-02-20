const mongoose = require('mongoose');

// Define the Certification schema
const CertificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: 10,
      maxlength: 500,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', 
        required: true,
      },
    ],
    enrolledUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
      },
    ],
  },
  { timestamps: true } 
);

const Certification = mongoose.model('Certification', CertificationSchema);
module.exports = Certification;