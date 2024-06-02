const { body } = require('express-validator');

const validateUpdateProfile = [
  body('name').notEmpty().withMessage('Name cannot be empty'),
  body('address').notEmpty().withMessage('Address cannot be empty'),
  body('phoneNumber')
    .matches(/^\+62\d{10,12}$/)
    .withMessage('Phone number must start with +62 and followed by 10 to 12 digits'),
];

module.exports = {
  validateUpdateProfile,
};
