const express = require('express');
const auth = require('../middleware/auth');
const { validate } = require('../helpers/validationHelper');
const {
  validateUpdateProfile,
} = require('../validations/profileValidations');
const {
  getProfileHandler,
  updateProfileHandler,
} = require('../controllers/profileController');

const router = express.Router();

router.get('/profile', auth, getProfileHandler);
router.put('/profile', auth, validate(validateUpdateProfile), updateProfileHandler);

module.exports = router;
