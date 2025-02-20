const Assignment = require('../models/Assignment');
const Question = require('../models/Question');

// create  assignment
exports.createAssignment = async (req, res) => {
  try {
    const { topic, questions } = req.body;
    const assignment = new Assignment({ topic, questions });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().populate('topic').populate('questions');
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('topic').populate('questions');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const updatedAssignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAssignment) return res.status(404).json({ message: 'Assignment not found' });
    res.status(200).json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!deletedAssignment) return res.status(404).json({ message: 'Assignment not found' });
    //  delete itsquestions
    await Question.deleteMany({ assignment: req.params.id });
    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};