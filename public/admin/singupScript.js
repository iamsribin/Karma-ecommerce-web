function validateUserName() {
    var usernamePattern = /^[a-zA-Z0-9_.\s]{3,16}$/;
    var name = document.getElementById("myInput1").value;
    var msg = document.getElementById("message1");
    var signupButton = document.getElementById("signupButton");
  
    if (usernamePattern.test(name)) {
        msg.innerHTML = "";
        signupButton.disabled = false; // Enable the button
    } else {
        msg.innerHTML = "Username must be 3-20 characters";
        msg.style.color = "red";
        signupButton.disabled = true; // Disable the button
    }
  }
  function validateUserEmail() {
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    var email = document.getElementById("myInput2").value;
    var isValid = emailPattern.test(email);
    var msg = document.getElementById("message2");
    var signupButton = document.getElementById("signupButton");
  
    if (isValid) {
        msg.innerHTML = "";
        signupButton.disabled = false; // Enable the button
    } else {
        msg.innerHTML = "Invalid email address";
        msg.style.color = "red";
        signupButton.disabled = true; // Disable the button
    }
  }
  function validatePassword() {
    var passwordPattern = /^.{8,}$/;
    var msg = document.getElementById("message3");
    var password = document.getElementById("password").value;
    var isValid = passwordPattern.test(password);
    var signupButton = document.getElementById("signupButton");
  
    if (isValid) {
        msg.innerHTML = "";
        signupButton.disabled = false; // Enable the button
    } else {
        msg.innerHTML = "Password must be at least 8 characters";
        msg.style.color = "red";
        signupButton.disabled = true; // Disable the button
    }
  }
  
  // JavaScript function to check password match
  function checkPasswordMatch() {
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmpass1").value;
    var message = document.getElementById("message");
    var signupButton = document.getElementById("signupButton");
  
    if (password === confirmPassword) {
        message.innerHTML = ""; // Clear the error message
        signupButton.disabled = false; // Enable the button
    } else {
        message.innerHTML = "Passwords do not match. Please try again.";
        message.style.color = "red";
        signupButton.disabled = true; // Disable the button
    }
  }