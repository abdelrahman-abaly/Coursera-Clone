const asyncHandler = require("express-async-handler");
const AppError = require("../Utils/appError");
const Certification = require('../models/Certification');
const factory = require('./handlerFactory');

// Create certification
exports.createCertification = factory.createOne(Certification);

// Get all certifications
exports.getAllCertifications = factory.getAll(Certification, 'Certification');

// Get certification by ID
exports.getCertificationById = factory.getOne(Certification, ['courses', 'enrolledUsers']);

// Update certification
exports.updateCertification = factory.updateOne(Certification);

// Delete certification
exports.deleteCertification = factory.deleteOne(Certification);

// Enroll user
exports.enrollUser = asyncHandler(async (req, res, next) => {
  const userId = req.body.userId;

  if (!userId) {
    return next(new AppError('Invalid user ID', 400));
  }

  const certification = await Certification.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { enrolledUsers: userId } },
    { new: true }
  ).populate('enrolledUsers');

  if (!certification) {
    return next(new AppError('Certification not found', 404));
  }

  res.status(200).json({ data: certification });
});

// Unenroll user
exports.unenrollUser = asyncHandler(async (req, res, next) => {
  const userId = req.body.userId;

  if (!userId) {
    return next(new AppError('Invalid user ID', 400));
  }

  const certification = await Certification.findByIdAndUpdate(
    req.params.id,
    { $pull: { enrolledUsers: userId } },
    { new: true }
  ).populate('enrolledUsers');

  if (!certification) {
    return next(new AppError('Certification not found', 404));
  }

  res.status(200).json({ data: certification });
});