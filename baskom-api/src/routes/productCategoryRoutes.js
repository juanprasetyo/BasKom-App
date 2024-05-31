const express = require('express');
const auth = require('../middleware/auth');
const hasRole = require('../middleware/role');
const { validate } = require('../helpers/validationHelper');
const { validateProductCategory } = require('../validations/productCategoryValidations');
const {
  addProductCategoryHandler,
  deleteProductCategoryHandler,
} = require('../controllers/productCategoryController');

const router = express.Router();

router.post('/product-categories', auth, hasRole('Penjual'), validate(validateProductCategory), addProductCategoryHandler);
router.delete('/product-categories', auth, hasRole('Penjual'), validate(validateProductCategory), deleteProductCategoryHandler);

module.exports = router;
