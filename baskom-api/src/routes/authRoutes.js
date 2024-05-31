const express = require('express');
const { validate } = require('../helpers/validationHelper');
const { validateRegister, validateLogin } = require('../validations/authValidations');
const { registerHandler, loginHandler } = require('../controllers/authController');

const router = express.Router();

router.post('/register', validate(validateRegister), registerHandler);
router.post('/login', validate(validateLogin), loginHandler);

module.exports = router;
