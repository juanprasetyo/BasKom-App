const {
  createUser,
  updateUser,
  findUserById,
  getAllUsers,
  deleteUser,
  findUserByIdWithRole,
  findUserByEmail,
} = require('../models/userModel');
const { addUserRole } = require('../models/userRolesModel');

const createUserHandler = async (req, res) => {
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

const updateUserHandler = async (req, res) => {
  const { id } = req.params;
  const { name, address, phoneNumber } = req.body;

  try {
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let newAvatar = user.avatar;
    if (name && name !== user.name) {
      newAvatar = `https://ui-avatars.com/api/?background=random&size=512&name=${encodeURIComponent(name)}`;
    }

    const updatedUser = await updateUser(id, name, address, phoneNumber, newAvatar);
    res.json(updatedUser);
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
    res.status(204).send();
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
