const Course = require("../models/Course");
const Module = require("../models/Module");

// create course
exports.createCourse = async (req, res) => {
  try {
    const { title, description, instructor, price, category } = req.body;
    const course = new Course({
      title,
      description,
      instructor,
      price,
      category,
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("modules")
      .populate("instructor");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("modules")
      .populate("instructor");
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update course
exports.updateCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCourse)
      return res.status(404).json({ message: "Course not found" });
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete course
exports.deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse)
      return res.status(404).json({ message: "Course not found" });
    // delete its modules
    await Module.deleteMany({ course: req.params.id });
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----------------------------------------------------------------------------------
// get instructor courses
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.params.instructorId;

    const courses = await Course.find({ instructor: instructorId })
      .populate("modules")
      .populate("instructor");

    if (!courses || courses.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for this instructor" });
    }

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all courses with pagination
exports.getAllCoursesWithPagination = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (isNaN(page) || page < 1) {
      return res.status(400).json({ error: "Invalid page number" });
    }
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ error: "Invalid limit value" });
    }

    const skip = (page - 1) * limit;

    const totalCourses = await Course.countDocuments();
    const totalPages = Math.ceil(totalCourses / limit);

    const courses = await Course.find()
      .populate("modules")
      .populate("instructor")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalCourses,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all courses with pagination, filtering, and sorting
exports.getAllCoursesWithPFSO = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || "";
    const sortField = req.query.sortBy || "createdAt";
    const sortOrder = req.query.order === "desc" ? -1 : 1;

    // Input validation
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ error: "Invalid page number" });
    }
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ error: "Invalid limit value" });
    }

    const skip = (page - 1) * limit;

    const filter = {};
    if (category) {
      filter.category = { $regex: new RegExp(category, "i") };
    }

    const totalCourses = await Course.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / limit);

    const sort = {};
    sort[sortField] = sortOrder;

    const courses = await Course.find(filter)
      .populate("modules")
      .populate("instructor")
      .skip(skip)
      .limit(limit)
      .sort(sort);

    res.status(200).json({
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalCourses,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// search courses by title or description with pagination
exports.searchCourses = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query cannot be empty" });
    }

    if (isNaN(page) || page < 1) {
      return res.status(400).json({ error: "Invalid page number" });
    }
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ error: "Invalid limit value" });
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
