const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { createUser, findUserByEmail } = require('../models/userModel');
const { addUserRole } = require('../models/userRolesModel');

dotenv.config();

const registerHandler = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

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
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Email not registered' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerHandler, loginHandler };
