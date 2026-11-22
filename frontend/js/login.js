
const tabs = document.querySelectorAll(".tab");
const slider = document.querySelector(".tab-slider");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const registrationForm = document.getElementById("registration-form");

// HAMBURGER MENU

const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");

    const isOpen = navMenu.classList.contains("active");
    menuToggle.textContent = isOpen ? "✕" : "☰";
    menuToggle.setAttribute("aria-expanded", isOpen);
});

// Close menu after clicking a link

navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

// Default: Login tab

registerForm.style.display = "none";

// Login / Register tabs

tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
        tabs.forEach(item => item.classList.remove("active"));
        tab.classList.add("active");

        if (index === 1) {
            slider.classList.add("register");
            loginForm.style.display = "none";
            registerForm.style.display = "block";
        } else {
            slider.classList.remove("register");
            loginForm.style.display = "block";
            registerForm.style.display = "none";
        }
    });
});

// Show / Hide Password

function setupPasswordToggle(passwordId, toggleId) {
    const password = document.getElementById(passwordId);
    const toggle = document.getElementById(toggleId);

    if (!password || !toggle) return;

    toggle.addEventListener("click", () => {
        password.type = password.type === "password" ? "text" : "password";
        toggle.textContent = password.type === "password" ? "👁" : "🙈";
    });
}

setupPasswordToggle("password", "toggle-password");
setupPasswordToggle("register-password", "toggle-register-password");
setupPasswordToggle("confirm-password", "toggle-confirm-password");

// Switch to Register

document.querySelector(".switch-tect button").addEventListener("click", () => {
    tabs[1].click();
});

// Forgot Password

document.getElementById("forgot-password").addEventListener("click", (e) => {
    e.preventDefault();
    alert("Password reset feature will be available soon.");
});

// Get saved users

function getUsers() {
    return JSON.parse(localStorage.getItem("trimoraUsers")) || [];
}

// Register

registrationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim().toLowerCase();
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
        alert("Password and Confirm Password do not match!");
        return;
    }

    const users = getUsers();

    if (users.some(user => user.email === email)) {
        alert("This email is already registered. Please Login.");
        return;
    }

    users.push({ name, email, password });
    localStorage.setItem("trimoraUsers", JSON.stringify(users));

    alert("Registration successful! Please Login.");

    registrationForm.reset();
    tabs[0].click();
});

// Login

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    const users = getUsers();

    const user = users.find(
        user => user.email === email && user.password === password
    );

    if (!user) {
        alert("Invalid email or password!");
        return;
    }

    localStorage.setItem("trimoraLoggedInUser", JSON.stringify({
        name: user.name,
        email: user.email
    }));

    alert("Login successful! Welcome " + user.name);

    window.location.href = "user.html";
});
