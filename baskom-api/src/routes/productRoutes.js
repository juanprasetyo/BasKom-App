const express = require('express');
const { validate } = require('../helpers/validationHelper');
const {
  validateProductCreation,
  validateProductUpdate,
  validateProductSearch,
} = require('../validations/productValidations');
const {
  addProductHandler,
  getAllProductsHandler,
  searchProductsHandler,
  getAllProductsByUserIdHandler,
  getProductByIdHandler,
  updateProductHandler,
  deleteProductHandler,
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const hasRole = require('../middleware/role');

const router = express.Router();

router.post('/products', auth, hasRole('Penjual'), validate(validateProductCreation), addProductHandler);
router.get('/products', getAllProductsHandler);
router.get('/products/search', validate(validateProductSearch), searchProductsHandler);
router.get('/products/user', auth, hasRole('Penjual'), getAllProductsByUserIdHandler);
router.get('/products/:id', getProductByIdHandler);
router.put('/products/:id', auth, hasRole('Penjual'), validate(validateProductUpdate), updateProductHandler);
router.delete('/products/:id', auth, hasRole('Penjual'), deleteProductHandler);

module.exports = router;
