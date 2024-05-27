const express = require('express');
const {
  createUpgradeRoleHandler,
  updateUpgradeRoleHandler,
  getUpgradeRoleByIdHandler,
  getAllUpgradeRolesHandler,
  deleteUpgradeRoleHandler,
} = require('../controllers/upgradeRoleController');
const auth = require('../middleware/auth');
const hasRole = require('../middleware/role');

const router = express.Router();

router.post('/upgrade-roles', auth, hasRole('User'), createUpgradeRoleHandler);
router.get('/upgrade-roles', auth, hasRole('Admin'), getAllUpgradeRolesHandler);
router.put('/upgrade-roles/:id', auth, hasRole(['User', 'Admin']), updateUpgradeRoleHandler);
router.get('/upgrade-roles/:id', auth, hasRole(['User', 'Admin']), getUpgradeRoleByIdHandler);
router.delete('/upgrade-roles/:id', auth, hasRole('User'), deleteUpgradeRoleHandler);

module.exports = router;
