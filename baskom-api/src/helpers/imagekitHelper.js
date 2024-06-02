const ImageKit = require('imagekit');
require('dotenv').config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const uploadImageToImagekit = async (file) => {
  try {
    const response = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: '/Product',
    });
    return {
      fileId: response.fileId,
      url: response.url,
    };
  } catch (error) {
    throw new Error('Failed to upload image to ImageKit');
  }
};

const deleteImageFromImagekit = (url) => {
  const fileId = url.split('/').pop().split('.')[0];
  return new Promise((resolve, reject) => {
    imagekit.deleteFile(fileId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

module.exports = {
  uploadImageToImagekit,
  deleteImageFromImagekit,
};
