const multer = require("multer");

// product storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/products/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const upload = multer({ storage: storage });


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





// function removeVariant(button) {
//   const container = document.getElementById("variants-container");
//   const variantToRemove = button.closest(".variant");

//   if (container.contains(variantToRemove) && container.children.length > 1) {
//     container.removeChild(variantToRemove);

//     // Enable delete button for all variants except the first one after removal
//     const deleteButtons = container.querySelectorAll(".delete-variant");
//     deleteButtons.forEach((button, index) => {
//       button.disabled = index === 0;
//     });
//   }
// }