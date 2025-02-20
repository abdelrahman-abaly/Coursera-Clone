const Module = require('../models/Module');
const Topic = require('../models/Topic');

// create module
exports.createModule = async (req, res) => {
  try {
    const { title, course } = req.body;
    const module = new Module({ title, course });
    await module.save();
    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all modules
exports.getAllModules = async (req, res) => {
  try {
    const modules = await Module.find().populate('topics').populate('course');
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get module by ID
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate('topics').populate('course');
    if (!module) return res.status(404).json({ message: 'Module not found' });
    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update module
exports.updateModule = async (req, res) => {
  try {
    const updatedModule = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedModule) return res.status(404).json({ message: 'Module not found' });
    res.status(200).json(updatedModule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete module
exports.deleteModule = async (req, res) => {
  try {
    const deletedModule = await Module.findByIdAndDelete(req.params.id);
    if (!deletedModule) return res.status(404).json({ message: 'Module not found' });
    // delete its topics
    await Topic.deleteMany({ module: req.params.id });
    res.status(200).json({ message: 'Module deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};