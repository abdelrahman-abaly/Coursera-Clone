const asyncHandler = require("express-async-handler");
const AppError = require("../Utils/appError");
const Module = require('../models/Module');
const Topic = require('../models/Topic');
const factory = require('./handlerFactory');

// Create module
exports.createModule = factory.createOne(Module);

// Get all modules
exports.getAllModules = factory.getAll(Module, 'Module');

// Get module by ID
exports.getModuleById = factory.getOne(Module, ['topics', 'course']);

// Update module
exports.updateModule = factory.updateOne(Module);

// Delete module
exports.deleteModule = asyncHandler(async (req, res, next) => {
  const deletedModule = await Module.findByIdAndDelete(req.params.id);

  if (!deletedModule) {
    return next(new AppError(`No document for this id ${req.params.id}`, 404));
  }

  // Delete associated topics
  await Topic.deleteMany({ module: req.params.id });

  res.status(204).send();
});