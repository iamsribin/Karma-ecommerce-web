const multer = require("multer");

// product storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error('Incorrect file type');
    error.code = 'INCORRECT_FILETYPE';
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB limit
  },
});


//user profile storage
    const userProfileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/userProfile/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const profileUpload = multer({ storage: userProfileStorage });
 
  module.exports = {
    upload,
    profileUpload,
  }

