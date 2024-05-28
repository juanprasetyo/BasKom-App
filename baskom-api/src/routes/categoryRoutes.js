const express = require('express');
const {
  createCategoryHandler,
  getCategoryByIdHandler,
  getAllCategoriesHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const hasRole = require('../middleware/role');

const router = express.Router();

router.post('/categories', auth, hasRole('Penjual'), createCategoryHandler);
router.get('/categories', getAllCategoriesHandler);
router.get('/categories/:id', getCategoryByIdHandler);
router.put('/categories/:id', auth, hasRole(['Admin', 'Penjual']), updateCategoryHandler);
router.delete('/categories/:id', auth, hasRole(['Admin']), deleteCategoryHandler);

module.exports = router;
