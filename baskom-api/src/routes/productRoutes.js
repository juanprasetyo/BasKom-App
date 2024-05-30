const express = require('express');

const router = express.Router();
const {
  addProductHandler,
  getAllProductsHandler,
  getAllProductsByUserIdHandler,
  getProductByIdHandler,
  updateProductHandler,
  deleteProductHandler,
} = require('../controllers/productController');

const auth = require('../middleware/auth');
const hasRole = require('../middleware/role');

router.post('/products', auth, hasRole('Penjual'), addProductHandler);
router.get('/products', getAllProductsHandler);
router.get('/products/user', auth, hasRole('Penjual'), getAllProductsByUserIdHandler);
router.get('/products/:id', getProductByIdHandler);
router.put('/products/:id', auth, hasRole('Penjual'), updateProductHandler);
router.delete('/products/:id', auth, hasRole('Penjual'), deleteProductHandler);

module.exports = router;
