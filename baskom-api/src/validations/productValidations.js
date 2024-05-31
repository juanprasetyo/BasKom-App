const { body, param } = require('express-validator');

const validateProductCreation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
  body('qty').isInt({ gt: 0 }).withMessage('Quantity must be an integer greater than 0'),
  body('categoryIds').isArray({ min: 1 }).withMessage('At least one category ID is required'),
];

const validateProductUpdate = [
  param('id').isInt().withMessage('Invalid product ID'),
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
  body('qty').isInt({ gt: 0 }).withMessage('Quantity must be an integer greater than 0'),
  body('categoryIds').isArray({ min: 1 }).withMessage('At least one category ID is required'),
];

module.exports = {
  validateProductCreation,
  validateProductUpdate,
};
