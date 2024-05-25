
document.addEventListener("DOMContentLoaded", () => {

function emailValidation() {
    let email = document.getElementById("email").value;
    if (email == "") {
      document.getElementById("error-message").innerHTML = "*please write email*";
      return false;
    } else {
      document.getElementById("error-message").innerHTML = "";
      return true;
    }
}


function showLoadingScreen() {
    const loadingOverlay = document.querySelector(".loading-overlay");
    loadingOverlay.style.display = "flex";
  }

  //Function to hide loading screen
  function hideLoadingScreen() {
    const loadingOverlay = document.querySelector(".loading-overlay");
    loadingOverlay.style.display = "none";
  }

const forgotPasswordForm = document.querySelector("#forgotPasswordForm");
forgotPasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (emailValidation()) {
    showLoadingScreen();
    const formData = new FormData(forgotPasswordForm);
    const email = formData.get("email");
    try {
      const response = await fetch("/forgot-password-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      if (response.ok) {
        window.location.href = "/getotp-forgot-password";
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "An error occurred";
        throw new Error(errorMessage);
      }
    } catch (error) {
      document.querySelector("#error-message").textContent =
        error.message;
      setTimeout(() => {
        document.querySelector("#error-message").textContent = null;
      }, 5000);
    } finally {
      hideLoadingScreen();
    }
  }
});

});