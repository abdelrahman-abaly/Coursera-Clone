const express = require('express');
const certificationController = require('../controllers/certificationController');
const router = express.Router();

router.post('/', certificationController.createCertification);

router.get('/', certificationController.getAllCertifications);

router.get('/:id', certificationController.getCertificationById);

router.put('/:id', certificationController.updateCertification);

router.delete('/:id', certificationController.deleteCertification);

router.put('/:id/enroll', certificationController.enrollUser);

router.put('/:id/unenroll', certificationController.unenrollUser);

module.exports = router;