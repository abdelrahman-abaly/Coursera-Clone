const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  modules: [
    {
      module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
      completed: { type: Boolean, default: false },
      topics: [
        {
          topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
          videoWatched: { type: Boolean, default: false },
          assignmentCompleted: { type: Boolean, default: false }
        }
      ]
    }
  ]
});

module.exports = mongoose.model("Progress", ProgressSchema);

