const { findRolesByUserId } = require('../models/userRolesModel');

const hasRole = (roles) => async (req, res, next) => {
  const { id } = req.user;
  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  try {
    const userRoles = await findRolesByUserId(id);
    const userRoleNames = userRoles.map((role) => role.name);

    const hasRequiredRole = requiredRoles.some((role) => userRoleNames.includes(role));
    if (!hasRequiredRole) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

module.exports = hasRole;
