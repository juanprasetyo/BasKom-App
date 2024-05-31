const express = require('express');
const auth = require('../middleware/auth');
const hasRole = require('../middleware/role');
const { validate } = require('../helpers/validationHelper');
const { validateUserRole } = require('../validations/userRolesValidations');
const { addUserRoleHandler, removeUserRoleHandler } = require('../controllers/userRolesController');

const router = express.Router();

router.post('/user/roles/add', auth, hasRole('Admin'), validate(validateUserRole), addUserRoleHandler);
router.delete('/user/roles/delete', auth, hasRole('Admin'), validate(validateUserRole), removeUserRoleHandler);

module.exports = router;
