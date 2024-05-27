const express = require('express');
const auth = require('../middleware/auth');
const {
  createUserHandler,
  updateUserHandler,
  getUserByIdHandler,
  getAllUsersHandler,
  deleteUserHandler,
} = require('../controllers/userController');

const router = express.Router();

router.get('/users', auth, getAllUsersHandler);
router.post('/users', createUserHandler);
router.get('/users/:id', auth, getUserByIdHandler);
router.put('/users/:id', auth, updateUserHandler);
router.delete('/users/:id', auth, deleteUserHandler);

module.exports = router;
