const path = require('path');
const fs = require('fs');
const util = require('util');
const uploadFile = require('../middleware/upload');
const {
  createUpgradeRole,
  updateUpgradeRoleDocument,
  updateUpgradeRoleStatus,
  findUpgradeRoleById,
  getAllUpgradeRoles,
  deleteUpgradeRole,
  findExistingUpgradeRole,
} = require('../models/upgradeRoleModel');
const { findRolesByUserId } = require('../models/userRolesModel');

const unlinkAsync = util.promisify(fs.unlink);
const upload = uploadFile(path.join(__dirname, '../../public/document-upgrade/'), /jpeg|jpg|png/);

const createUpgradeRoleHandler = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File upload is required' });
    }

    const { id } = req.user;
    const documentUrl = `/public/document-upgrade/${req.file.filename}`;

    try {
      const existingRequest = await findExistingUpgradeRole(id);
      if (existingRequest) {
        await unlinkAsync(path.join(__dirname, '../../', documentUrl));
        return res.status(400).json({ error: 'An upgrade request is already in progress or accepted' });
      }

      const upgradeRole = await createUpgradeRole(id, documentUrl);
      res.status(201).json(upgradeRole);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

const updateUpgradeRoleHandler = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { id } = req.params;
    const { id: userId } = req.user;
    const userRoles = await findRolesByUserId(userId);
    const userRoleNames = userRoles.map((role) => role.name);

    try {
      const upgradeRole = await findUpgradeRoleById(id);

      if (!upgradeRole) {
        return res.status(404).json({ message: 'Upgrade role request not found' });
      }

      if (userRoleNames.includes('Admin')) {
        const { status } = req.body;
        const updatedUpgradeRole = await updateUpgradeRoleStatus(id, status);
        return res.status(200).json(updatedUpgradeRole);
      }

      if (upgradeRole.status === 'reject' || upgradeRole.status === 'accept') {
        return res.status(400).json({ message: 'Cannot update document for rejected or accepted requests' });
      }

      if (req.file) {
        const documentUrl = `/public/document-upgrade/${req.file.filename}`;
        await unlinkAsync(path.join(__dirname, '../../', upgradeRole.document_url));

        const updatedUpgradeRole = await updateUpgradeRoleDocument(id, documentUrl);
        return res.status(200).json(updatedUpgradeRole);
      }

      res.status(400).json({ message: 'Invalid update request' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

const getUpgradeRoleByIdHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const upgradeRequest = await findUpgradeRoleById(id);
    if (!upgradeRequest) {
      return res.status(404).json({ message: 'Upgrade request not found' });
    }
    res.json(upgradeRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllUpgradeRolesHandler = async (req, res) => {
  try {
    const upgradeRoles = await getAllUpgradeRoles();
    res.json(upgradeRoles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUpgradeRoleHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const upgradeRequest = await findUpgradeRoleById(id);
    if (!upgradeRequest) {
      return res.status(404).json({ message: 'Upgrade role request not found' });
    }
    await deleteUpgradeRole(id);
    res.status(204).json();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createUpgradeRoleHandler,
  updateUpgradeRoleHandler,
  getUpgradeRoleByIdHandler,
  getAllUpgradeRolesHandler,
  deleteUpgradeRoleHandler,
};
