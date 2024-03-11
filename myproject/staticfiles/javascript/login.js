
      const passwordInput = document.getElementById("password");
      const togglePassword = document.getElementById("togglePassword");
      const eyeIcon = document.getElementById("eyeIcon");
      let isPasswordVisible = false;

      togglePassword.addEventListener("click", function () {
          isPasswordVisible = !isPasswordVisible;

          if (isPasswordVisible) {
              passwordInput.type = "text";
              eyeIcon.src = eyeSolidPath;
          } else {
              passwordInput.type = "password";
              eyeIcon.src = eyeSlashPath;
          }
      });
