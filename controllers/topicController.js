const Topic = require('../models/Topic');
const Assignment = require('../models/Assignment');

// create topic
exports.createTopic = async (req, res) => {
  try {
    const { title, module, video, article, assignment } = req.body;
    const topic = new Topic({ title, module, video, article, assignment });
    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all topics
exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find().populate('module').populate('assignment');
    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get topic by ID
exports.getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('module').populate('assignment');
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update topic
exports.updateTopic = async (req, res) => {
  try {
    const updatedTopic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTopic) return res.status(404).json({ message: 'Topic not found' });
    res.status(200).json(updatedTopic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete topic
exports.deleteTopic = async (req, res) => {
  try {
    const deletedTopic = await Topic.findByIdAndDelete(req.params.id);
    if (!deletedTopic) return res.status(404).json({ message: 'Topic not found' });
    // delete its assignment
    await Assignment.deleteOne({ _id: deletedTopic.assignment });
    res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};