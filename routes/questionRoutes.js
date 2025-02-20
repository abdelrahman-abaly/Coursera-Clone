const express = require('express');
const questionController = require('../controllers/questionController');
const router = express.Router();

// create question
router.post('/', questionController.createQuestion);

// get all questions
router.get('/', questionController.getAllQuestions);

// get question by ID
router.get('/:id', questionController.getQuestionById);

// update question
router.put('/:id', questionController.updateQuestion);

// delete question
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;