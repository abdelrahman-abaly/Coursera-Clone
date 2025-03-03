const asyncHandler = require("express-async-handler");
const AppError = require("../Utils/appError");
const Assignment = require('../models/Assignment');
const Question = require('../models/Question');
const factory = require('./handlerFactory');

// Create assignment
exports.createAssignment = factory.createOne(Assignment);

// Get all assignments
exports.getAllAssignments = factory.getAll(Assignment, 'Assignment');

// Get assignment by ID
exports.getAssignmentById = factory.getOne(Assignment, ['topic', 'questions']);

// Update assignment
exports.updateAssignment = factory.updateOne(Assignment);

// Delete assignment
exports.deleteAssignment = asyncHandler(async (req, res, next) => {
  const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);

  if (!deletedAssignment) {
    return next(new AppError(`No document for this id ${req.params.id}`, 404));
  }

  // Delete associated questions
  await Question.deleteMany({ assignment: req.params.id });

  res.status(204).send();
});