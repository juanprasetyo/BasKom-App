const multer = require('multer');
const path = require('path');

const uploadFile = (destination, fileFilter) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  const fileFilterFn = (req, file, cb) => {
    if (!file.mimetype.match(fileFilter)) {
      return cb(new Error('File format not supported'), false);
    }
    cb(null, true);
  };

  return multer({ storage, fileFilter: fileFilterFn }).single('file');
};

module.exports = uploadFile;
