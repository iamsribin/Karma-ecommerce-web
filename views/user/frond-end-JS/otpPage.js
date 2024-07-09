document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".otp-field > input");
  const button = document.querySelector(".verify-otp");
  const resendOtpLink = document.querySelector(".resend-otp");
  const resendButtonContainer = document.querySelector(".resendButtonContainer");
  const timerDisplay = document.getElementById("timer");

  inputs[0].focus();
  button.disabled = true;

  let otpAttempts = 0;
  const maxOtpAttempts = 3;
  const otpTimeout = 4 * 60; // 4 minutes
  const resendCooldown = 60; // 1 minutes
  let timerDuration = resendCooldown;
  let otpStartTime = Date.now();
  let totalElapsedTime = 0;
  let timer;

  function updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - otpStartTime) / 1000);
    totalElapsedTime += elapsedTime;
    const remainingTime = resendCooldown - elapsedTime;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    timerDisplay.textContent = `Time remaining: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    if (remainingTime <= 0) {
      clearInterval(timer);
      enableResendButton();
    } else {
      timerDuration--;
    }
  }

  function startTimer() {
    clearInterval(timer);
    timerDuration = resendCooldown;
    timer = setInterval(updateTimer, 1000);
    otpStartTime = Date.now();
  }

  function handleOtpExpiration() {
    Swal.fire({
      title: "OTP expired! Try to sign up again",
      icon: "error",
      showCancelButton: false,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "/login";
      }
    });
    disableOtpFields();
  }

  setTimeout(()=>{
    handleOtpExpiration();
  },5 * 60 *1000)


  function disableOtpFields() {
    inputs.forEach((input) => {
      input.disabled = true;
    });
  }

  function enableResendButton() {
    resendButtonContainer.style.display = "block";
    resendOtpLink.classList.remove("disabled");
  }

  function disableResendButton() {
    resendButtonContainer.style.display = "none";
    resendOtpLink.classList.add("disabled");
  }

  resendOtpLink.addEventListener("click", async (event) => {
    event.preventDefault();
    console.log("otpAttempt",otpAttempts ,"maxOtp", maxOtpAttempts);
    if (otpAttempts < maxOtpAttempts) {
      otpAttempts++;
      totalElapsedTime = 0;
      startTimer();
      disableResendButton();

     const response =  await fetch("/resendOtp", {
        method: "GET",
      });

      if(response.ok){
        Swal.fire({
          title: "Successfully sent new OTP",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });
      }else{
        Swal.fire({
          title: "An error occurred",
          icon: "error",
          showCancelButton: false,
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });
      }
    } else {
      handleOtpExpiration();
    }
  });

  inputs[0].addEventListener("paste", (event) => {
    event.preventDefault();

    const pastedValue = (event.clipboardData || window.clipboardData).getData("text");
    for (let i = 0; i < inputs.length; i++) {
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

  button.addEventListener("click", async (event) => {
    event.preventDefault();

    const otp = Array.from(inputs).map((input) => input.value).join("");
    try {
      const response = await fetch("/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
      });

      if (response.ok) {
        Swal.fire({
          title: "Successfully verified",
          icon: "success",
          showCancelButton: false,
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/";
          }
        });
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "An error occurred";
        throw new Error(errorMessage);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
      });
    }
  });

  startTimer();
});