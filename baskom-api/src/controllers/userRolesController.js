const { addUserRole, removeUserRole } = require('../models/userRolesModel');

const addUserRoleHandler = async (req, res) => {
  const { userId, roleId } = req.body;

  try {
    const userRole = await addUserRole(userId, roleId);
    res.status(201).json(userRole);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeUserRoleHandler = async (req, res) => {
  const { userId, roleId } = req.body;

  if (roleId === 1) {
    return res.status(400).json({ message: 'Default role cannot be removed' });
  }

  try {
    await removeUserRole(userId, roleId);
    res.status(200).json({ message: 'Role removed from user successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addUserRoleHandler,
  removeUserRoleHandler,
};
