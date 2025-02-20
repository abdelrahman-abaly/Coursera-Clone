// const fs = require("fs");
const usersModel = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let createUsers = async (req, res) => {
  let newUser = req.body;

  try {
    const savedUser = await usersModel.create(newUser);

    res.json({ message: "success", data: savedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

let readAllUsers = async (req, res) => {
  try {
    let users = await usersModel.find();

    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

let readUserById = async (req, res) => {
  let { id } = req.params;

  try {
    let user = await usersModel.findById(id);

    if (user) {
      res.status(200).json({ message: "success", data: user });
    } else {
      res.status(404).json({ message: "not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

let updateUser = async (req, res) => {
  let { id } = req.params;

  let updates = req.body;

  try {
    let updatedUser = await usersModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (updatedUser) {
      res.status(200).json({ message: "success", data: updatedUser });
    } else {
      res.status(404).json({ message: "NOT FOUND" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

let deleteUser = async (req, res) => {
  let { id } = req.params;

  try {
    let deleteUser = await usersModel.findByIdAndDelete(id);

    if (deleteUser) {
      res.status(200).json({ message: "User DELETED Successfully" });
    } else {
      res.status(404).json({ message: "User NOT Found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

let login = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "You Must Provide Email and Password" });
  }

  let user = await usersModel.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ message: "Invalid Email Or Password" });
  }

  let isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.status(401).json({ message: "Invalid Email Or Password" });
  }

  let token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.status(200).json({ token: token });
};

let updatePassword = async (req, res) => {
  let { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "You Must Provide Current Password and New Password" });
  }

  let user = await usersModel.findById(req.id);

  let isValid = await bcrypt.compare(currentPassword, user.password);

  if (!isValid) {
    return res
      .status(401)
      .json({ status: "fail", message: "Invalid Current Password" });
  }

  user.password = newPassword;

  await user.save();

  let token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.SECRET,
    { expiresIn: "1h" }
  );

  res.status(200).json({ token: token });
};

module.exports = {
  createUsers,
  readAllUsers,
  readUserById,
  updateUser,
  deleteUser,
  login,
  updatePassword,
};
