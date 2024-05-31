const { body } = require('express-validator');

const validateUserRole = [
  body('userId').isInt().withMessage('User ID must be an integer'),
  body('roleId').isInt().withMessage('Role ID must be an integer'),
];

module.exports = {
  validateUserRole,
};
