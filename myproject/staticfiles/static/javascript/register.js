
      const passwordInput = document.getElementById("password");
      const check_password = document.getElementById("check_password");
      const togglePassword = document.getElementById("togglePassword");
      const eyeIcon = document.getElementById("eyeIcon");
      let isPasswordVisible = false;

      togglePassword.addEventListener("click", function () {
          isPasswordVisible = !isPasswordVisible;

          if (isPasswordVisible) {
              passwordInput.type = "text";
              check_password.type = "text";
              eyeIcon.src = eyeSolidPath;
          } else {
              passwordInput.type = "password";
              check_password.type = "password";
              eyeIcon.src = eyeSlashPath;
          }
      });
