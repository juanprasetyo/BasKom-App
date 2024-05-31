const { body, param } = require('express-validator');

const validateCreateUser = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

const validateUpdateUser = [
  param('id').isInt().withMessage('Invalid user ID'),
  body('name').notEmpty().withMessage('Name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('phoneNumber')
    .matches(/^\+628\d{8,10}$/)
    .withMessage('Phone number must start with +62 and followed by 10 to 12 digits'),
];

module.exports = {
  validateCreateUser,
  validateUpdateUser,
};
