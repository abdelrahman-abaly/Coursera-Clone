const asyncHandler = require("express-async-handler");
const AppError = require("../Utils/appError");
const Topic = require('../models/Topic');
const Assignment = require('../models/Assignment');
const factory = require('./handlerFactory');

// Create topic
exports.createTopic = factory.createOne(Topic);

// Get all topics
exports.getAllTopics = factory.getAll(Topic, 'Topic');

// Get topic by ID
exports.getTopicById = factory.getOne(Topic, ['module', 'assignment']);

// Update topic
exports.updateTopic = factory.updateOne(Topic);

// Delete topic
exports.deleteTopic = asyncHandler(async (req, res, next) => {
  const deletedTopic = await Topic.findByIdAndDelete(req.params.id);

  if (!deletedTopic) {
    return next(new AppError(`No document for this id ${req.params.id}`, 404));
  }

  // Delete associated assignment
  if (deletedTopic.assignment) {
    await Assignment.deleteOne({ _id: deletedTopic.assignment });
  }

  res.status(204).send();
});