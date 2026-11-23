/* TRIMORA ADMIN LOGIN - FRONTEND DEMO */
const ADMIN_EMAIL = "admin@trimora.com";
const ADMIN_PASSWORD = "Trimora@123";
if (localStorage.getItem("trimoraAdminLoggedIn") === "true") window.location.replace("admin.html");
const form = document.getElementById("admin-login-form");
const passwordInput = document.getElementById("admin-password");
const togglePassword = document.getElementById("toggle-password");
const errorMessage = document.getElementById("login-error");
togglePassword.addEventListener("click", () => {
 const show = passwordInput.type === "password";
 passwordInput.type = show ? "text" : "password";
 togglePassword.textContent = show ? "🙈" : "👁";
 togglePassword.setAttribute("aria-label", show ? "Hide password" : "Show password");
});
form.addEventListener("submit", event => {
 event.preventDefault();
 const email = document.getElementById("admin-email").value.trim().toLowerCase();
 if (email !== ADMIN_EMAIL || passwordInput.value !== ADMIN_PASSWORD) {
  errorMessage.textContent = "Invalid email or password. Please try again.";
  return;
 }
 localStorage.setItem("trimoraAdminLoggedIn", "true");
 window.location.href = "admin.html";
});