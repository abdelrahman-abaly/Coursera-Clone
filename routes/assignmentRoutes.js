const express = require('express');
const assignmentController = require('../controllers/assignmentController');
const router = express.Router();

// create assignment
router.post('/', assignmentController.createAssignment);

// get all assignments
router.get('/', assignmentController.getAllAssignments);

// get assignment by ID
router.get('/:id', assignmentController.getAssignmentById);

// update assignment
router.put('/:id', assignmentController.updateAssignment);

// delete assignment
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;