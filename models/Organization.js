const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const organizationSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    minLength: 3,
    maxLength: 16,
    unique: true,
  },
  organizationName: {
    type: String,
    required: [true, "Organization name is required"],
    minLength: 3,
    unique: true
  },
  contactPerson: {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minLength: 3,
      maxLength: 16,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minLength: 3,
      maxLength: 16,
    },
    position: {
      type: String,
      required: true
    }
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: {
      validator: function(email) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
      },
      message: props => `${props.value} is not a valid email address`,
    },
  },
  phone: {
    type: String,
    required: false,
    match: [/^[0-9]{11}$/, "Phone number must be 11 digits"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: 8
  },
  logo: {
    type: String,
    default: "default_logo_url",
  },
  description: {
    type: String,
    required: false,
  },
  website: {
    type: String,
    required: false
  },
  address: {
    street: {
      type: String,
      required: [true, "Street address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    zipCode: {
      type: String,
      required: true
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Password hashing middleware
organizationSchema.pre("save", async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp middleware
organizationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
organizationSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
organizationSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Generate password reset token
organizationSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;