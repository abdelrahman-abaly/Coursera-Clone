const express = require('express');
const topicController = require('../controllers/topicController');
const router = express.Router();

// create topic
router.post('/', topicController.createTopic);

// get all topics
router.get('/', topicController.getAllTopics);

// get topic by ID
router.get('/:id', topicController.getTopicById);

// update topic
router.put('/:id', topicController.updateTopic);

// delete topic
router.delete('/:id', topicController.deleteTopic);

module.exports = router;