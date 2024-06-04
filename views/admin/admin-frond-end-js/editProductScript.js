// Declare cropper globally
let cropper ;

// Utility function to check if a string contains only spaces
function isOnlySpaces(str) {
  return str.trim().length === 0;
}

// Function to validate individual fields
function validateField(fieldId, errorMessageId, validationFn, errorMessage) {
  const field = document.getElementById(fieldId);
  const errorMessageElement = document.getElementById(errorMessageId);
  if (validationFn(field.value)) {
    errorMessageElement.innerHTML = errorMessage;
    return false;
  } else {
    errorMessageElement.innerHTML = "";
    return true;
  }
}

//validation for quality checking
function validateQualityChecking() {
  const qualityCheckYes = document.getElementById("qualityCheckYes");
  const qualityCheckNo = document.getElementById("qualityCheckNo");
  const errorMessageElement = document.getElementById(
    "error-message-quality-checking"
  );

  if (!qualityCheckYes.checked && !qualityCheckNo.checked) {
    errorMessageElement.innerHTML =
      "Please select an option for quality checking.";
    return false;
  } else {
    errorMessageElement.innerHTML = "";
    return true;
  }
}

//vallidation for offer
function validateOfferAndExpiryDate() {
  const offerAmount = document.getElementById("offer-amount").value;
  const expiryDate = document.getElementById("offer-expiry-date").value;
  const errorMessageOfferAmount = document.getElementById(
    "error-message-product-offer"
  );
  const errorMessageExpiryDate = document.getElementById(
    "error-message-product-offer-date"
  );

  if (offerAmount !== "") {
    if (offerAmount <= 0) {
      errorMessageOfferAmount.innerHTML =
        "Offer amount must be a positive number.";
      return false;
    } else if (expiryDate === "") {
      errorMessageExpiryDate.innerHTML = "Please enter the offer expiry date.";
      return false;
    } else {
      errorMessageOfferAmount.innerHTML = "";
      errorMessageExpiryDate.innerHTML = "";
      return true;
    }
  } else {
    errorMessageOfferAmount.innerHTML = "";
    errorMessageExpiryDate.innerHTML = "";
    return true;
  }
}

// Form validation function
function validateForm() {
  let isValid = true;

  isValid &= validateField(
    "name",
    "error-message-product-name",
    isOnlySpaces,
    "*Please enter a valid product name*"
  );
  isValid &= validateField(
    "description",
    "error-message-description",
    isOnlySpaces,
    "Please enter a valid description."
  );
  isValid &= validateField(
    "quantity",
    "error-message-quantity",
    (value) => value === "" || parseInt(value) <= 0,
    "Please enter a positive quantity."
  );
  isValid &= validateField(
    "basePrice",
    "error-message-base-price",
    (value) => value === "" || parseInt(value) <= 0,
    "Please enter a positive base price."
  );
  isValid &= validateField(
    "width",
    "error-message-width",
    (value) => value === "" || parseInt(value) <= 0,
    "Please enter a positive width."
  );
  isValid &= validateField(
    "height",
    "error-message-height",
    (value) => value === "" || parseInt(value) <= 0,
    "Please enter a positive height."
  );
  isValid &= validateField(
    "weight",
    "error-message-weight",
    (value) => value === "" || parseInt(value) <= 0,
    "Please enter a positive weight."
  );
  isValid &= validateQualityChecking();
  // isValid &= validateField("offerPrice", "error-message-offer-price", (value) => value === "" || parseInt(value) <= 0, "Please enter a positive offer price.");
  isValid &= validateField(
    "brand",
    "error-message-brand",
    (value) => value === "Select brand",
    "Please select a brand."
  );
  isValid &= validateField(
    "category",
    "error-message-category",
    (value) => value === "Select category",
    "Please select a category."
  );
//   isValid &= validateField(
//     "productImage1",
//     "error-message-image1",
//     (value) => value === "",
//     "Please select at least one image."
//   );
//   isValid &= validateField(
//     "productImage2",
//     "error-message-image2",
//     (value) => value === "",
//     "Please select at least one image."
//   );
//   isValid &= validateField(
//     "productImage3",
//     "error-message-image3",
//     (value) => value === "",
//     "Please select at least one image."
//   );
  isValid &= validateOfferAndExpiryDate();
  return !!isValid;
}

// Event listeners for input fields to remove error messages while typing
const fieldsToValidate = [
  {
    fieldId: "name",
    errorMessageId: "error-message-product-name",
    validationFn: isOnlySpaces,
    errorMessage: "*Please enter a valid product name*",
  },
  {
    fieldId: "description",
    errorMessageId: "error-message-description",
    validationFn: isOnlySpaces,
    errorMessage: "Please enter a valid description.",
  },
  {
    fieldId: "quantity",
    errorMessageId: "error-message-quantity",
    validationFn: (value) => value === "" || parseInt(value) <= 0,
    errorMessage: "Please enter a positive quantity.",
  },
  {
    fieldId: "basePrice",
    errorMessageId: "error-message-base-price",
    validationFn: (value) => value === "" || parseInt(value) <= 0,
    errorMessage: "Please enter a positive base price.",
  },
  {
    fieldId: "width",
    errorMessageId: "error-message-width",
    validationFn: (value) => value === "" || parseInt(value) <= 0,
    errorMessage: "Please enter a positive height.",
  },
  {
    fieldId: "height",
    errorMessageId: "error-message-height",
    validationFn: (value) => value === "" || parseInt(value) <= 0,
    errorMessage: "Please enter a positive height.",
  },
  {
    fieldId: "weight",
    errorMessageId: "error-message-weight",
    validationFn: (value) => value === "" || parseInt(value) <= 0,
    errorMessage: "Please enter a positive weight.",
  },
  // { fieldId: "offerPrice", errorMessageId: "error-message-offer-price", validationFn: (value) => value === "" || parseInt(value) <= 0, errorMessage: "Please enter a positive offer price." },
  {
    fieldId: "brand",
    errorMessageId: "error-message-brand",
    validationFn: (value) => value === "Select brand",
    errorMessage: "Please select a brand.",
  },
  {
    fieldId: "category",
    errorMessageId: "error-message-category",
    validationFn: (value) => value === "Select category",
    errorMessage: "Please select a category.",
  },
//   {
//     fieldId: "productImage1",
//     errorMessageId: "error-message-image1",
//     validationFn: (value) => value === "",
//     errorMessage: "Please select at least one image.",
//   },
//   {
//     fieldId: "productImage2",
//     errorMessageId: "error-message-image2",
//     validationFn: (value) => value === "",
//     errorMessage: "Please select at least one image.",
//   },
//   {
//     fieldId: "productImage3",
//     errorMessageId: "error-message-image3",
//     validationFn: (value) => value === "",
//     errorMessage: "Please select at least one image.",
//   },
];

fieldsToValidate.forEach(
  ({ fieldId, errorMessageId, validationFn, errorMessage }) => {
    document.getElementById(fieldId).addEventListener("input", function () {
      validateField(fieldId, errorMessageId, validationFn, errorMessage);
    });
  }
);

// Event listener for form submission
document
  .getElementById("productForm")
  .addEventListener("submit", function (event) {
    if (!validateForm()) {
      event.preventDefault();
    }
  });

//###################### cropp image ###############################

  // let cropper ;
function previewImage(event, imagePreviewId) {
  const reader = new FileReader();
  reader.onload = function () {
    const imagePreview = document.getElementById(imagePreviewId);
    if (imagePreview) {
      imagePreview.src = reader.result;
      imagePreview.classList.add("img-fluid");
      initCropper(imagePreview);
    } else {
      console.error("Image preview element not found.");
    }
  };
  reader.readAsDataURL(event.target.files[0]);
}

// Initialize cropper
function initCropper(imageElement) {
  if (imageElement && imageElement.tagName.toLowerCase() === "img") {
    cropper = new Cropper(imageElement, {
      aspectRatio: 1,
      viewMode: 1,
    });
  } else {
    console.log("Invalid image element");
  }
}

document.querySelector("#productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (validateForm()) {
    try {
      if (cropper) {
        const croppedCanvas = cropper.getCroppedCanvas();
        croppedCanvas.toBlob(async (blob) => {
          const formData = new FormData(document.getElementById("productForm"));

          // Get the selected file input container
          const cropBoxData = cropper.getCropBoxData();
          const selectedFileInputContainer = cropBoxData.viewMode === 1
            ? document.getElementById("imagePreview1").parentElement
            : cropBoxData.viewMode === 2
              ? document.getElementById("imagePreview2").parentElement
              : document.getElementById("imagePreview3").parentElement;

          // Get the selected file input
          const selectedFileInput = selectedFileInputContainer.querySelector('input[type="file"]');

          // Set the blob only for the selected file input
          formData.set(selectedFileInput.id, blob, `croppedImage${selectedFileInput.id.slice(-1)}.png`);
          const inputField = document.querySelector("#name");
          const id = inputField.getAttribute("data_id")

          const response = await fetch(`/admin/edit-product/${id}`, {
            method: "PATCH",
            body: formData,
          });
               const data = response.json();
          if (response.ok) {
            Swal.fire({
              title: "Successfully edited Product",
              icon: "success",
              showCancelButton: false,
              confirmButtonColor: "#3085d6",
              confirmButtonText: "OK",
            }).then(async (result) => {
              if (result.isConfirmed) {
                window.location.href = "/admin/add-product";
              }
            });
          } else {
            Swal.fire({
              title: data.message,
              icon: "error",
              showCancelButton: false,
              confirmButtonColor: "#3085d6",
              confirmButtonText: "OK",
            });
            console.log("An error occurred", response);
          }
        }, "image/png");
      } else {
        // Submit the form if no cropping is needed
        document.getElementById("productForm").submit();
      }
    } catch (error) {
      console.log("Add product error:", error);
    }
  }
});
















// Handle form submission    
// document.querySelector("#productForm").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   if (validateForm()) {
//     try {
//       if (cropper) {
//         const croppedCanvas = cropper.getCroppedCanvas();
//         croppedCanvas.toBlob(async (blob) => {
//           const formData = new FormData(document.getElementById("productForm"));
//           formData.set("productImage1", blob,"croppedImage1.png"); 
//           formData.set("productImage2", blob,"croppedImage2.png");
//           formData.set("productImage3", blob,"croppedImage3.png");

//           const response = await fetch("/admin/add-product", {
//             method: "POST",
//             body: formData,
//           });

//           if (response.ok) {
//             Swal.fire({
//               title: "Successfully Added Product",
//               icon: "success",
//               showCancelButton: false,
//               confirmButtonColor: "#3085d6",
//               confirmButtonText: "OK",
//             }).then(async (result) => {
//               if (result.isConfirmed) {
//                 window.location.href = "/admin/add-product";
//               }
//             });
//           } else {
//             Swal.fire({
//               title: "Successfully send new OTP",
//               icon: "error",
//               showCancelButton: false,
//               confirmButtonColor: "#3085d6",
//               confirmButtonText: "OK",
//             });
//             console.log("An error occurred", response);
//           }
//         }, "image/png");
//       } else {
//         // Submit the form if no cropping is needed
//         document.getElementById("productForm").submit();
//       }
//     } catch (error) {
//       console.log("Add product error:", error);
//     }
//   }
// });


// Handle form submission
// document.querySelector("#productForm").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   if (validateForm()) {
//     try {
//       if (cropper) {
//         const croppedCanvas = cropper.getCroppedCanvas();
//         croppedCanvas.toBlob(async (blob) => {
//           const formData = new FormData(document.getElementById("productForm"));

//           // Get the selected file input
//           const selectedFileInput = cropper.getCropBoxData().viewMode === 1
//             ? document.getElementById("productImage1")
//             : cropper.getCropBoxData().viewMode === 2
//               ? document.getElementById("productImage2")
//               : document.getElementById("productImage3");

//           // Set the blob only for the selected file input
//           formData.set(selectedFileInput.id, blob, `croppedImage${selectedFileInput.id.slice(-1)}.png`);

//           const response = await fetch("/admin/add-product", {
//             method: "POST",
//             body: formData,
//           });

//           if (response.ok) {
//             Swal.fire({
//               title: "Successfully Added Product",
//               icon: "success",
//               showCancelButton: false,
//               confirmButtonColor: "#3085d6",
//               confirmButtonText: "OK",
//             }).then(async (result) => {
//               if (result.isConfirmed) {
//                 window.location.href = "/admin/add-product";
//               }
//             });
//           } else {
//             Swal.fire({
//               title: "An error occurred",
//               icon: "error",
//               showCancelButton: false,
//               confirmButtonColor: "#3085d6",
//               confirmButtonText: "OK",
//             });
//             console.log("An error occurred", response);
//           }
//         }, "image/png");
//       } else {
//         // Submit the form if no cropping is needed
//         document.getElementById("productForm").submit();
//       }
//     } catch (error) {
//       console.log("Add product error:", error);
//     }
//   }
// });