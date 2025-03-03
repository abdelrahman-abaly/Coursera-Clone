const Progress = require("../models/Progress");


exports.markVideoAsWatched = async (req, res) => {
  try {
    const { userId, courseId, moduleId, topicId } = req.body;

    const progress = await Progress.findOneAndUpdate(
      { user: userId, course: courseId, "modules.module": moduleId, "modules.topics.topic": topicId },
      { $set: { "modules.$[].topics.$[topic].videoWatched": true } },
      { arrayFilters: [{ "topic.topic": topicId }], new: true }
    );

    if (!progress) return res.status(404).json({ message: "Progress not found" });

    res.json({ message: "Video marked as watched", progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.markAssignmentAsCompleted = async (req, res) => {
  try {
    const { userId, courseId, moduleId, topicId } = req.body;

    const progress = await Progress.findOneAndUpdate(
      { user: userId, course: courseId, "modules.module": moduleId, "modules.topics.topic": topicId },
      { $set: { "modules.$[].topics.$[topic].assignmentCompleted": true } },
      { arrayFilters: [{ "topic.topic": topicId }], new: true }
    );

    if (!progress) return res.status(404).json({ message: "Progress not found" });

    res.json({ message: "Assignment completed", progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.checkTopicCompletion = async (req, res) => {
  try {
    const { userId, courseId, moduleId, topicId } = req.body;

    const progress = await Progress.findOne({ user: userId, course: courseId });
    if (!progress) return res.status(404).json({ message: "Progress not found" });

    const module = progress.modules.find(m => m.module.toString() === moduleId);
    const topic = module.topics.find(t => t.topic.toString() === topicId);

    if (topic.videoWatched && topic.assignmentCompleted) {
      res.json({ message: `✅ Topic ${topicId} completed!` });
    } else {
      res.json({ message: "Topic not yet completed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
