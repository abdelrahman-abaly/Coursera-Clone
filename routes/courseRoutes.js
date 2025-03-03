const express = require('express');
const courseController = require('../controllers/courseController');
const { getCourseValidator } = require('../Utils/validator/courseValidator');

const router = express.Router();

router.post('/', courseController.createCourse);

router.get('/', courseController.getAllCourses);

router.get('/:id',getCourseValidator, courseController.getCourseById);

router.put('/:id', courseController.updateCourse);

router.delete('/:id', courseController.deleteCourse);

// ----------------------------------------------------------------------
// get instructor courses
// router.get('/instructor/:instructorId', courseController.getInstructorCourses);
// // get all courses with pagination
// router.get('/', courseController.getAllCoursesWithPagination);
// // get all courses with pagination, filtering, and sorting
// router.get('/', courseController.getAllCoursesWithPFSO);
// search courses by title or description with pagination
router.get('/search', courseController.searchCourses);

module.exports = router;

