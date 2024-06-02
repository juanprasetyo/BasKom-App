const {
  updateUser,
  findUserById,
  findUserByIdWithRole,
} = require('../models/userModel');

const getProfileHandler = async (req, res) => {
  const { id } = req.user;

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

const updateProfileHandler = async (req, res) => {
  const { id } = req.user;
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

module.exports = {
  getProfileHandler,
  updateProfileHandler,
};
