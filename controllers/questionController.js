const Question = require('../models/Question');

// create question
exports.createQuestion = async (req, res) => {
  try {
    const { assignment, type, questionText, options, correctAnswer, discussionAnswer } = req.body;
    const question = new Question({
      assignment,
      type,
      questionText,
      options,
      correctAnswer,
      discussionAnswer,
    });
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate('assignment');
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('assignment');
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update question
exports.updateQuestion = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedQuestion) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};