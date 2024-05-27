const express = require('express');
const auth = require('../middleware/auth');
const hasRole = require('../middleware/role');
const { addUserRoleHandler, removeUserRoleHandler } = require('../controllers/userRolesController');

const router = express.Router();

router.post('/user/roles/add', auth, hasRole('Admin'), addUserRoleHandler);
router.delete('/user/roles/delete', auth, hasRole('Admin'), removeUserRoleHandler);

module.exports = router;
