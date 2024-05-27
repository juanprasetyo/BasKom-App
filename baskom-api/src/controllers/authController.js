const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { createUser, findUserByEmailWithRoles } = require('../models/userModel');
const { addUserRole } = require('../models/userRolesModel');

dotenv.config();

const registerHandler = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const user = await createUser(name, email, password);
    await addUserRole(user.id, 1);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginHandler = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmailWithRoles(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = { id: user.id, email: user.email, roles: user.roles };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerHandler, loginHandler };
