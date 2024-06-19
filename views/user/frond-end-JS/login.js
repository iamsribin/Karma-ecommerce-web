document.addEventListener("DOMContentLoaded", () => {
  const signUpButton = document.getElementById("signUp");
  const signInButton = document.getElementById("signIn");
  const container = document.getElementById("container");

  signUpButton.addEventListener("click", () => {
    container.classList.add("right-panel-active");
  });

  signInButton.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
  });

  //signup validation
  function signupValidation() {
    let user = document.getElementById("user").value;
    let email = document.getElementById("email").value;
    let password1 = document.getElementById("password1").value;
    let password2 = document.getElementById("password2").value;
    if (user == "") {
      document.getElementById("userSpan").innerHTML =
        "*please write your name*";
      return false;
    }
    if (user.length < 3) {
      document.getElementById("userSpan").innerHTML =
        "*please write more than two character*";
      return false;
    }
    if (!isNaN(user)) {
      document.getElementById("userSpan").innerHTML =
        "*please write Alphabets only*";
      return false;
    }
    if (user.length < 3) {
      document.getElementById("userSpan").innerHTML =
        "*please write more than two character *";
      return false;
    }
    if(user[0] == " "){
      document.getElementById("userSpan").innerHTML =
        "*please remove the space*";
      return false;
    } else {
      document.getElementById("userSpan").innerHTML = "";
    }
    if (email == "") {
      document.getElementById("emailSpan").innerHTML = "*please write email*";
      return false;
    } else {
      document.getElementById("emailSpan").innerHTML = "";
    }

    if (password1 == "") {
      document.getElementById("passwordSpan").innerHTML =
        "*please write your password*";
      return false;
    }
    if (password1.length < 8) {
      document.getElementById("passwordSpan").innerHTML =
        "*please write password Atleast 8 charaters*";
      return false;
    }
    if (password1.search(/[0-9]/) == -1) {
      document.getElementById("passwordSpan").innerHTML =
        "*please write password Atleast 1 Numberic character";
      return false;
    }
    if (password1.search(/[a-z]/) == -1) {
      document.getElementById("passwordSpan").innerHTML =
        "*please write password Atleast 1 lower case character";
      return false;
    }
    if (password1.search(/[A-Z]/) == -1) {
      document.getElementById("passwordSpan").innerHTML =
        "*please write password Atleast 1 upper case character";
      return false;
    }
    if (password1.search(/[!\@\#\$\%\^\&\*\(\)\_\-\+\=\<\>\,\?]/) == -1) {
      document.getElementById("passwordSpan").innerHTML =
        "*please write password Atleast 1 special symbol in the character";
      return false;
    } else {
      document.getElementById("passwordSpan").innerHTML = "";
    }
    if (password2 !== password1) {
      document.getElementById("password2Span").innerHTML =
        "*password not macthes";
    } else {
      document.getElementById("password2Span").innerHTML = "";
      return true;
    }
  }

  //sign in
  function signInValidation() {
    let email = document.getElementById("emailIn").value;
    let password1 = document.getElementById("passwordIn").value;

    if (email == "") {
      document.getElementById("emailSignIn").innerHTML = "*please write email*";
      return false;
    } else {
      document.getElementById("emailSignIn").innerHTML = "";
    }
    if (password1 == "") {
      document.getElementById("passwordSignIn").innerHTML =
        "*please write your password*";
      return false;
    }
    if (password1.length < 8) {
      document.getElementById("passwordSignIn").innerHTML =
        "*please write password Atleast 8 charaters*";
      return false;
    }
    if (password1.search(/[0-9]/) == -1) {
      document.getElementById("passwordSignIn").innerHTML =
        "*please write password Atleast 1 Numberic character";
      return false;
    }
    if (password1.search(/[a-z]/) == -1) {
      document.getElementById("passwordSignIn").innerHTML =
        "*please write password Atleast 1 lower case character";
      return false;
    }
    if (password1.search(/[A-Z]/) == -1) {
      document.getElementById("passwordSignIn").innerHTML =
        "*please write password Atleast 1 upper case character";
      return false;
    }
    if (password1.search(/[!\@\#\$\%\^\&\*\(\)\_\-\+\=\<\>\,\?]/) == -1) {
      document.getElementById("passwordSignIn").innerHTML =
        "*please write password Atleast 1 special symbol in the character";
      return false;
    } else {
      document.getElementById("passwordSignIn").innerHTML = "";
      return true;
    }
  }

  // Function to show loading screen
  function showLoadingScreen() {
    const loadingOverlay = document.querySelector(".loading-overlay");
    loadingOverlay.style.display = "flex";
  }

  //Function to hide loading screen
  function hideLoadingScreen() {
    const loadingOverlay = document.querySelector(".loading-overlay");
    loadingOverlay.style.display = "none";
  }

  // -------------------------------------------------------------------------------------------------------

  // Event listener for sign-up form submission
  const signUpForm = document.querySelector("#signUp-form");
  signUpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (signupValidation()) {
      showLoadingScreen();
      const formData = new FormData(signUpForm);
      const name = formData.get("name");
      const email = formData.get("email");  
      const password1 = formData.get("password1");
 
      try {
        const response = await fetch("/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password1,
          }),
        });

        if (response.ok) {
          window.location.href = "/getotp";
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.message || "An error occurred";
          // document.querySelector(".error-message-signup").textContent = errorMessage;
          throw new Error(errorMessage);
        }
      } catch (error) {
        document.querySelector(".error-message-signup").textContent =
          error.message;
        setTimeout(() => {
          document.querySelector(".error-message-signup").textContent = null;
        }, 5000);
      } finally {
        hideLoadingScreen();
      }
    }
  });

  // Event listener for sign-in form submission
  const signInForm = document.querySelector("#login-form");
  signInForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (signInValidation()) {
      const formData = new FormData(signInForm);
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        if (response.ok) {
          window.location.href = "/";
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.message || "an error occurred";
          throw new Error(errorMessage);
        }
      } catch (error) {
        document.querySelector(".error-message").textContent = error.message;
        setTimeout(() => {
          document.querySelector(".error-message").textContent = null;
        }, 5000);
      } finally {
        hideLoadingScreen();
      }
    }
  });

  //google login
  const urlParams = new URLSearchParams(window.location.search);
  const errorMessage = urlParams.get('error');
  if (errorMessage) {
      document.querySelector(".error-message").innerText = errorMessage;
      // document.querySelector(".error-message-signup").innerText = errorMessage; 
      setTimeout(() => {
        document.querySelector(".error-message").textContent = null;
        // document.querySelector(".error-message-signup").innerText = null; 
      }, 5000);
  }
});
