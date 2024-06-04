
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

  function validateNameLength(name) {
    return name.trim().length < 4;
  }

  function validateCouponCode(code) {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5}$/;
    return !regex.test(code);
  }

  function validateNotEmpty(value) {
    return value.trim().length === 0;
  }

  function isNegativeValue(value) {
    return parseFloat(value) <= 0;
  }

  function validateStartDateBeforeEndDate(startDate, endDate) {
    return new Date(startDate) >= new Date(endDate);
  }

  function validateForm() {
    let isValid = true;

    isValid &= validateField(
      "name",
      "error-message-name",
      (value) => validateNotEmpty(value) || validateNameLength(value),
      "*Please enter a valid name with at least 4 characters*"
    );

    isValid &= validateField(
      "couponCode",
      "error-message-coupon-code",
      (value) => validateNotEmpty(value) || validateCouponCode(value),
      "*Please enter a valid coupon code with 5 characters, one uppercase letter, one lowercase letter, one special character, and one number*"
    );

    isValid &= validateField(
      "expiryDate",
      "error-message-expiry-date",
      validateNotEmpty,
      "Please enter the expiry date."
    );

    isValid &= validateField(
      "startDate",
      "error-message-start-date",
      validateNotEmpty,
      "Please enter the start date."
    );

    const startDate = document.getElementById("startDate").value;
    const expiryDate = document.getElementById("expiryDate").value;

    isValid &= validateField(
      "startDate",
      "error-message-start-date",
      (value) => validateStartDateBeforeEndDate(value, expiryDate),
      "Start date must be before the expiry date."
    );

    isValid &= validateField(
      "minAmount",
      "error-message-min-amount",
      (value) => isNegativeValue(value),
      "Please enter a positive minimum amount."
    );

    isValid &= validateField(
      "maximumUses",
      "error-message-maxUse-code",
      (value) => isNegativeValue(value),
      "Please enter a positive minimum amount."
    );


    isValid &= validateField(
      "offerAmount",
      "error-message-offer-amount",
      (value) => validateNotEmpty(value) || isNegativeValue(value),
      "Please enter a positive offer amount."
    );

    return isValid;
  }

  const fieldsToValidate = [
    {
      fieldId: "name",
      errorMessageId: "error-message-name",
      validationFn: (value) =>
        validateNotEmpty(value) || validateNameLength(value),
      errorMessage: "*Please enter a valid name with at least 4 characters*",
    },
    {
      fieldId: "couponCode",
      errorMessageId: "error-message-coupon-code",
      validationFn: (value) =>
        validateNotEmpty(value) || validateCouponCode(value),
      errorMessage:
        "*Please enter a valid coupon code with 5 characters, one uppercase letter, one lowercase letter, one special character, and one number*",
    },
    {
      fieldId: "expiryDate",
      errorMessageId: "error-message-expiry-date",
      validationFn: validateNotEmpty,
      errorMessage: "Please enter the expiry date.",
    },
    {
      fieldId: "startDate",
      errorMessageId: "error-message-start-date",
      validationFn: validateNotEmpty,
      errorMessage: "Please enter the start date.",
    },
    {
      fieldId: "minAmount",
      errorMessageId: "error-message-min-amount",
      validationFn: (value) => isNegativeValue(value),
      errorMessage: "Please enter a positive minimum amount.",
    },
    {
      fieldId: "maximumUses",
      errorMessageId: "error-message-maxUse-code",
      validationFn: (value) => isNegativeValue(value),
      errorMessage: "Please enter a positive minimum amount.",
    },
    {
      fieldId: "offerAmount",
      errorMessageId: "error-message-offer-amount",
      validationFn: (value) =>
        validateNotEmpty(value) || isNegativeValue(value),
      errorMessage: "Please enter a positive offer amount.",
    },
  ];

  fieldsToValidate.forEach(
    ({ fieldId, errorMessageId, validationFn, errorMessage }) => {
      document.getElementById(fieldId).addEventListener("input", function () {
        validateField(fieldId, errorMessageId, validationFn, errorMessage);
      });
    }
  );

  const addCuponForm = document.querySelector("#addCouponForm");
  addCuponForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (validateForm()) {
      const formData = new FormData(addCuponForm);
      const name = formData.get("name");
      const couponCode = formData.get("couponCode");
      const expiryDate = formData.get("expiryDate");
      const startDate = formData.get("startDate");
      const minimumPurchaseAmount = formData.get("minimumPurchaseAmount");
      const offerAmount = formData.get("offerAmount");
      const maximumUses = formData.get("maximumUses");
      const inputField = document.querySelector('#name');
      const id = inputField.getAttribute("data_id");

      console.log("id",id);
      try {
        const response = await fetch(`/admin/edit-coupon/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            couponCode,
            expiryDate,
            startDate,
            minimumPurchaseAmount,
            offerAmount,
            maximumUses,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          Swal.fire({
            title: `coupon code "${data.coupon.couponCode}" successfully edited `,
            icon: "success",
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          }).then(async (result) => {
            if (result.isConfirmed) {
              window.location.href = "/admin/coupens";
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
        }
      } catch (error) {
        console.log(error);
        Swal.fire({
          title: "An error occurred",
          icon: "error",
          showCancelButton: false,
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });
      }
    }
  });
