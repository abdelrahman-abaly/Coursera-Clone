const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (email) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)
            }, message: (obj) => `${obj.value} is not correct`
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (password) {
                return /^([\w\W]+)$/.test(password)
            }, message: (obj) => `${obj.value} is not correct`
        }
    },
    role: {
        type: String,
        enum: ["admin", "superadmin"],
        default: "admin"
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
