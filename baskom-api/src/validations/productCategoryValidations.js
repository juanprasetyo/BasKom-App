const { body } = require('express-validator');

const validateProductCategory = [
  body('productId').isInt().withMessage('Product ID must be an integer'),
  body('categoryId').isInt().withMessage('Category ID must be an integer'),
];

module.exports = {
  validateProductCategory,
};
