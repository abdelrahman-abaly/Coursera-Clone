const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let customerSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    minLength: 3,
    maxLength: 16,
    unique: true,
  },
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
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: {
      validator: function (email) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
      },
      message: (obj) => `${obj.value} is not a valid email address`,
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
    minLength: 6,
    maxLength: 16,
  },
  profilePicture: {
    type: String,
    default: "default_profile_picture_url",
  },
  bio: {
    type: String,
    required: false,
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
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
// hashing the password with hashmethod
customerSchema.pre("save", async function (next) {
  let salt = await bcrypt.genSalt(10);
  let hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
