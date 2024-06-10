const { body, param, query } = require('express-validator');

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
  body('qty').isInt({ gt: -1 }).withMessage('Quantity must be an integer greater than -1'),
];

const validateProductSearch = [
  query('name').optional().isString().withMessage('Name must be a string'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('minPrice').optional().isFloat({ gt: 0 }).withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Maximum price must be a positive number')
    .custom((value, { req }) => {
      if (req.query.minPrice && parseFloat(value) < parseFloat(req.query.minPrice)) {
        throw new Error('Maximum price must be greater than or equal to minimum price');
      }
      return true;
    }),
];

module.exports = {
  validateProductCreation,
  validateProductUpdate,
  validateProductSearch,
};
