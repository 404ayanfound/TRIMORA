const tabs = document.querySelectorAll(".tab");
const slider = document.querySelector(".tab-slider");
const loginForm = document.querySelector(".auth-card > form");
const registerForm = document.getElementById("register-form");

tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
        tabs.forEach(item => item.classList.remove("active"));
        tab.classList.add("active");

        if(index === 1){
            slider.classList.add("register");
            loginForm.style.display = "none";
            registerForm.style.display = "block";
        } else{
            slider.classList.remove("register");
            loginForm.style.display = "block";
            registerForm.style.display = "none";
        }
    });
});

const password = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");

togglePassword.addEventListener("click", () => {
    password.type = password.type === "password" ? "text" : "password";
});

const switchRegister = document.querySelector(".switch-tect button");

switchRegister.addEventListener("click", () => {
    tabs[1].click();
});

const forgotPassword = document.getElementById("forgot-password");

forgotPassword.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Password reset feature will be available soon.");
});