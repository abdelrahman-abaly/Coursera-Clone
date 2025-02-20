const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
    },
    video: {
      type: String,
    },
    article: {
      type: String,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
    },
  },
  { timestamps: true }
);

const Topic = mongoose.model("Topic", TopicSchema);
module.exports = Topic;
