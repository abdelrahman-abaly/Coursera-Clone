const Certification = require('../models/Certification');
const Course = require('../models/Course');
const User = require('../models/user');


exports.createCertification = async (req, res, next) => {
  try {
    const { title, description, courses, enrolledUsers } = req.body;

    if (!Array.isArray(courses) || !courses.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ error: 'Invalid course IDs' });
    }
    if (!Array.isArray(enrolledUsers) || !enrolledUsers.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }

    const certification = new Certification({
      title,
      description,
      courses,
      enrolledUsers,
    });

    await certification.save();
    res.status(201).json(certification);
  } catch (error) {
    next(error); 
  }
};

exports.getAllCertifications = async (req, res, next) => {
  try {
    const certifications = await Certification.find()
      .populate('courses') 
      .populate('enrolledUsers'); 

    res.status(200).json(certifications);
  } catch (error) {
    next(error); 
  }
};

exports.getCertificationById = async (req, res, next) => {
  try {
    const certification = await Certification.findById(req.params.id)
      .populate('courses') 
      .populate('enrolledUsers');

    if (!certification) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    res.status(200).json(certification);
  } catch (error) {
    next(error); 
  }
};

exports.updateCertification = async (req, res, next) => {
  try {
    const updatedCertification = await Certification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } 
    );

    if (!updatedCertification) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    res.status(200).json(updatedCertification);
  } catch (error) {
    next(error); 
  }
};

exports.deleteCertification = async (req, res, next) => {
  try {
    const deletedCertification = await Certification.findByIdAndDelete(req.params.id);

    if (!deletedCertification) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    res.status(200).json({ message: 'Certification deleted successfully' });
  } catch (error) {
    next(error); 
  }
};

exports.enrollUser = async (req, res, next) => {
  try {
    const userId = req.body.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const certification = await Certification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { enrolledUsers: userId } }, 
      { new: true }
    ).populate('enrolledUsers'); 

    if (!certification) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    res.status(200).json(certification);
  } catch (error) {
    next(error); 
  }
};

exports.unenrollUser = async (req, res, next) => {
  try {
    const userId = req.body.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const certification = await Certification.findByIdAndUpdate(
      req.params.id,
      { $pull: { enrolledUsers: userId } }, 
      { new: true }
    ).populate('enrolledUsers'); 

    if (!certification) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    res.status(200).json(certification);
  } catch (error) {
    next(error); 
  }
};