document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll(".otp-field > input");
    const button = document.querySelector(".verify-otp");
  
    inputs[0].focus();
  
    button.disabled = true;
  
    let resendOtpLink = document.querySelector(".resend-otp");
  
    // Handle resend OTP link click
    resendOtpLink.addEventListener("click", function(event) {
      event.preventDefault();
      Swal.fire({
        title: "Successfully send new OTP",
        icon: "success",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
    }).then(async(result) => {
        if (result.isConfirmed) {
          await fetch("/resendOtp", {
            method: "GET",
          })
        }
    });
    });
  
    // Handle input paste event
    inputs[0].addEventListener("paste", function (event) {
      event.preventDefault(); 
  
      const pastedValue = (event.clipboardData || window.clipboardData).getData("text");
      const otpLength = inputs.length;
  
      for (let i = 0; i < otpLength; i++) {
        if (i < pastedValue.length) {
          inputs[i].value = pastedValue[i];
          inputs[i].removeAttribute("disabled");
          inputs[i].focus();
        } else { 
          inputs[i].value = "";
          inputs[i].focus();
        }
      }
    });
  
    // Handle input keyup event
    inputs.forEach((input, index1) => {
      input.addEventListener("keyup", (e) => {
        const currentInput = input;
        const nextInput = input.nextElementSibling;
        const prevInput = input.previousElementSibling;
  
        if (currentInput.value.length > 1) {
          currentInput.value = "";
          return;
        }
        if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
          nextInput.removeAttribute("disabled");
          nextInput.focus();
        }
  
        if (e.key === "Backspace") {
          inputs.forEach((input, index2) => {
            if (index1 <= index2 && prevInput) {
              input.setAttribute("disabled", true);
              input.value = "";
              prevInput.focus();
            }
          });
        }
  
        button.disabled = ![...inputs].every((input) => input.value);
      });
    });
  //---------------------------------------------------------------------------------------------
  
  var timerDuration = 179; 
  var timer = setInterval(updateTimer, 1000);
  
  function updateTimer() {
    var minutes = Math.floor(timerDuration / 60);
    var seconds = timerDuration % 60;
  
    document.getElementById("timer").textContent = "Time remaining: " + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  
    timerDuration--;
  
    if (timerDuration < 0) {
      clearInterval(timer);
      Swal.fire({
        title: "OTP expired! Try again",
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "/login";
        }
    });
    
      disableOTPFields();
      showResendButton();
    }
  }
  
  function disableOTPFields() {
  var otpFields = document.querySelectorAll('.email-otp-input');
  otpFields.forEach(function (field) {
      field.disabled = true;
  });
  }
  
  function showResendButton() {
  var resendButtonContainer = document.querySelector(".resendButtonContainer");
  resendButtonContainer.style.display = "none";
  }
  
    // ------------------------------------------------------------------------------------------
  
    button.addEventListener("click", async (event) => {
      event.preventDefault();
  
      const otp = Array.from(inputs).map((input) => input.value).join("");
      try {
        const response = await fetch("/verify-forgot-password-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otp }),
        });
  
        if (response.ok) {
          Swal.fire({
            title: "Successfully verified pass",
            icon: "success",
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "/chagePassword";
            }
        });

        } else {
          const errorData = await response.json();
          const errorMessage = errorData.message || "An error occurred";
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.log("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message,
        });
      }
    });
  });
  