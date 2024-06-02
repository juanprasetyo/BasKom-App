const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const hasRole = require('../middleware/role');
const { validate } = require('../helpers/validationHelper');
const { validateProductImageUpload, validateProductImageDelete } = require('../validations/productImageValidations');
const {
  uploadProductImagesHandler,
  deleteProductImageHandler,
} = require('../controllers/productImageController');

const router = express.Router();
const upload = multer();

router.post('/product-images', auth, hasRole('Penjual'), upload.array('files'), validate(validateProductImageUpload), uploadProductImagesHandler);
router.delete('/product-images', auth, hasRole('Penjual'), validate(validateProductImageDelete), deleteProductImageHandler);

module.exports = router;
