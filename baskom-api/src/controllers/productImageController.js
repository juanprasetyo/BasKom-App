const { uploadImageToImagekit } = require('../helpers/imagekitHelper');
const { addImage, findImageById } = require('../models/imageModel');
const { addProductImage, deleteProductImage } = require('../models/productImageModel');
const { findProductById } = require('../models/productModel');

const uploadProductImagesHandler = async (req, res) => {
  const { id: userId } = req.user;
  const { productId } = req.body;
  const { files } = req;

  try {
    const product = await findProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to add images to this product' });
    }

    const uploadPromises = files.map(
      (file) => uploadImageToImagekit(file),
    );
    const uploadResponses = await Promise.all(uploadPromises);

    const imagePromises = uploadResponses.map(
      (uploadResponse) => addImage({ fileId: uploadResponse.fileId, url: uploadResponse.url }),
    );
    const images = await Promise.all(imagePromises);

    const productImagePromises = images.map((image) => addProductImage(productId, image.id));
    await Promise.all(productImagePromises);

    res.status(201).json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProductImageHandler = async (req, res) => {
  const { id: userId } = req.user;
  const { productId, imageId } = req.body;

  try {
    const product = await findProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete images from this product' });
    }

    const image = await findImageById(imageId);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    await deleteProductImage(productId, imageId);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadProductImagesHandler,
  deleteProductImageHandler,
};
