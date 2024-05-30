const express = require('express');
const auth = require('../middleware/auth');
const hasRole = require('../middleware/role');
const {
  addProductCategoryHandler,
  deleteProductCategoryHandler,
} = require('../controllers/productCategoryController');

const router = express.Router();

router.post('/product-categories', auth, hasRole('Penjual'), addProductCategoryHandler);
router.delete('/product-categories', auth, hasRole('Penjual'), deleteProductCategoryHandler);

module.exports = router;
