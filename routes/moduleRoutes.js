const express = require('express');
const moduleController = require('../controllers/moduleController');
const router = express.Router();

// create module
router.post('/', moduleController.createModule);

// get all modules
router.get('/', moduleController.getAllModules);

// get module by ID
router.get('/:id', moduleController.getModuleById);

// update  module
router.put('/:id', moduleController.updateModule);

// delete module
router.delete('/:id', moduleController.deleteModule);

module.exports = router;