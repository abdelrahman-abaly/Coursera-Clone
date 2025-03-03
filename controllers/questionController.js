const Question = require('../models/Question');
const factory = require('./handlerFactory');

// Create question
exports.createQuestion = factory.createOne(Question);

// Get all questions
exports.getAllQuestions = factory.getAll(Question, 'Question');

// Get question by ID
exports.getQuestionById = factory.getOne(Question, ['assignment']);

// Update question
exports.updateQuestion = factory.updateOne(Question);

// Delete question
exports.deleteQuestion = factory.deleteOne(Question);