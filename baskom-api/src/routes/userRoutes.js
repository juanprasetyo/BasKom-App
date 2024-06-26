const express = require('express');
const auth = require('../middleware/auth');
const hasRole = require('../middleware/role');
const { validate } = require('../helpers/validationHelper');
const {
  validateCreateUser,
  validateUpdateUser,
} = require('../validations/userValidations');
const {
  createUserHandler,
  updateUserHandler,
  getUserByIdHandler,
  getAllUsersHandler,
  deleteUserHandler,
} = require('../controllers/userController');

const router = express.Router();

router.get('/users', auth, hasRole('Admin'), getAllUsersHandler);
router.post('/users', auth, hasRole('Admin'), validate(validateCreateUser), createUserHandler);
router.get('/users/:id', auth, hasRole('Admin'), getUserByIdHandler);
router.put('/users/:id', auth, hasRole('Admin'), validate(validateUpdateUser), updateUserHandler);
router.delete('/users/:id', auth, hasRole('Admin'), deleteUserHandler);

module.exports = router;
