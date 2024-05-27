const {
  createUser,
  updateUser,
  findUserById,
  getAllUsers,
  deleteUser,
  findUserByIdWithRole,
} = require('../models/userModel');

const createUserHandler = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const user = await createUser(name, email, password);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUserHandler = async (req, res) => {
  const { id } = req.params;
  const {
    name, address, phoneNumber, avatar,
  } = req.body;

  if (!name && !address && !phoneNumber && !avatar) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
    const user = await updateUser(id, name, address, phoneNumber, avatar);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserByIdHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await findUserByIdWithRole(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllUsersHandler = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUserHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await deleteUser(id);
    res.status(204).json();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createUserHandler,
  updateUserHandler,
  getUserByIdHandler,
  getAllUsersHandler,
  deleteUserHandler,
};
