const asyncHandler = require("express-async-handler");
const AppError = require("../Utils/appError");
const Course = require("../models/Course");
const Module = require("../models/Module");
const factory = require('./handlerFactory');

// Create course
exports.createCourse = factory.createOne(Course);

// Get all courses
exports.getAllCourses = factory.getAll(Course, 'Course');

// Get course by ID
exports.getCourseById = factory.getOne(Course, ['modules', 'instructor']);

// Update course
exports.updateCourse = factory.updateOne(Course);

// Delete course
exports.deleteCourse = factory.deleteOne(Course);

// Search courses by title or description with pagination
exports.searchCourses = asyncHandler(async (req, res, next) => {
  const query = req.query.query?.trim();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (!query || query === "") {
    return next(new AppError("Search query cannot be empty", 400));
  }

  if (isNaN(page) || page < 1) {
    return next(new AppError("Invalid page number", 400));
  }
  if (isNaN(limit) || limit < 1) {
    return next(new AppError("Invalid limit value", 400));
  }

  const searchQuery = {
    $or: [
      { title: { $regex: new RegExp(query, "i") } },
      { description: { $regex: new RegExp(query, "i") } },
    ],
  };

  const skip = (page - 1) * limit;

  const totalResults = await Course.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalResults / limit);

  const courses = await Course.find(searchQuery)
    .populate("modules")
    .populate("instructor")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    currentPage: page,
    totalPages: totalPages,
    totalResults: totalResults,
    data: courses,
  });
});