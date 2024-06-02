const { body } = require('express-validator');

const validateProductImageUpload = [
  body('productId').isInt().withMessage('Product ID must be an integer'),
  body('files').custom((value, { req }) => {
    if (!req.files || req.files.length === 0) {
      throw new Error('At least one image file is required');
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    req.files.forEach((file) => {
      if (!validTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only JPG, JPEG, and PNG files are allowed');
      }
    });

    return true;
  }),
];

const validateProductImageDelete = [
  body('productId').isInt().withMessage('Product ID must be an integer'),
  body('imageId').isInt().withMessage('Image ID must be an integer'),
];

module.exports = {
  validateProductImageUpload,
  validateProductImageDelete,
};
