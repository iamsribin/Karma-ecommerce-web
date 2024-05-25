const multer = require("multer");

try {
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/products/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  const upload = multer({ storage: storage });
  module.exports = upload;

} catch (error) {
  console.log("multer error:", error);
}
