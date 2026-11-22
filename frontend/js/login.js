
/* TRIMORA LOGIN SYSTEM */

// ELEMENTS

const customerTab = document.getElementById("customer-tab");
const barberTab = document.getElementById("barber-tab");
const customerSection = document.getElementById("customer-section");
const barberLoginForm = document.getElementById("barber-login-form");

const customerLoginTab = document.getElementById("customer-login-tab");
const customerRegisterTab = document.getElementById("customer-register-tab");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const registrationForm = document.getElementById("registration-form");

const slider = document.querySelector(".tab-slider");

// HAMBURGER MENU

const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");

    const isOpen = navMenu.classList.contains("active");
    menuToggle.textContent = isOpen ? "✕" : "☰";
    menuToggle.setAttribute("aria-expanded", isOpen);
});

navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

// CUSTOMER LOGIN / REGISTER

function showCustomerLogin() {
    customerLoginTab.classList.add("active");
    customerRegisterTab.classList.remove("active");

    loginForm.style.display = "block";
    registerForm.style.display = "none";

    document.getElementById("customer-switch-text").innerHTML =
        `Don't have an account?
        <button type="button" id="customer-switch-btn">Register</button>`;

    document.getElementById("customer-switch-btn")
        .addEventListener("click", showCustomerRegister);
}

function showCustomerRegister() {
    customerRegisterTab.classList.add("active");
    customerLoginTab.classList.remove("active");

    loginForm.style.display = "none";
    registerForm.style.display = "block";

    document.getElementById("customer-switch-text").innerHTML =
        `Already have an account?
        <button type="button" id="customer-switch-btn">Login</button>`;

    document.getElementById("customer-switch-btn")
        .addEventListener("click", showCustomerLogin);
}

customerLoginTab.addEventListener("click", showCustomerLogin);
customerRegisterTab.addEventListener("click", showCustomerRegister);

// CUSTOMER / BARBER ROLE SWITCH

customerTab.addEventListener("click", () => {
    customerTab.classList.add("active");
    barberTab.classList.remove("active");

    slider.classList.remove("register");

    customerSection.style.display = "block";
    barberLoginForm.style.display = "none";
});

barberTab.addEventListener("click", () => {
    barberTab.classList.add("active");
    customerTab.classList.remove("active");

    slider.classList.add("register");

    customerSection.style.display = "none";
    barberLoginForm.style.display = "block";
});

// SHOW / HIDE PASSWORD

function setupPasswordToggle(passwordId, toggleId) {
    const password = document.getElementById(passwordId);
    const toggle = document.getElementById(toggleId);

    if (!password || !toggle) return;

    toggle.addEventListener("click", () => {
        password.type =
            password.type === "password" ? "text" : "password";

        toggle.textContent =
            password.type === "password" ? "👁" : "🙈";
    });
}

setupPasswordToggle("password", "toggle-password");
setupPasswordToggle("register-password", "toggle-register-password");
setupPasswordToggle("confirm-password", "toggle-confirm-password");
setupPasswordToggle("barber-password", "toggle-barber-password");

// FORGOT PASSWORD

document.getElementById("forgot-password").addEventListener("click", (e) => {
    e.preventDefault();
    alert("Password reset feature will be available soon.");
});

// GET SAVED CUSTOMERS

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem("trimoraUsers")) || [];
    } catch {
        return [];
    }
}

// GET SAVED BARBERS

function getBarbers() {
    try {
        return JSON.parse(localStorage.getItem("trimoraBarbers")) || [];
    } catch {
        return [];
    }
}

// CUSTOMER REGISTRATION

registrationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim().toLowerCase();
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password.length < 6) {
        alert("Password must be at least 6 characters long!");
        return;
    }

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
    showCustomerLogin();
});

// CUSTOMER LOGIN

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

    localStorage.removeItem("trimoraBarberName");
    localStorage.removeItem("trimoraBarberEmail");
    localStorage.removeItem("trimoraLoggedInBarber");

    localStorage.setItem("trimoraLoggedInUser", JSON.stringify({
        name: user.name,
        email: user.email
    }));

    alert("Login successful! Welcome " + user.name);

    window.location.href = "user.html";
});

// BARBER LOGIN

barberLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("barber-email").value.trim().toLowerCase();
    const password = document.getElementById("barber-password").value;

    const barbers = getBarbers();

    const barber = barbers.find(item =>
        typeof item === "object" &&
        item.email &&
        item.email.trim().toLowerCase() === email &&
        item.password === password
    );

    if (!barber) {
        alert("Invalid barber email or password! Please contact Admin.");
        return;
    }

    if (!barber.name) {
        alert("Barber account details are incomplete. Please contact Admin.");
        return;
    }

    localStorage.removeItem("trimoraLoggedInUser");

    localStorage.setItem("trimoraBarberName", barber.name);
    localStorage.setItem("trimoraBarberEmail", barber.email);

    localStorage.setItem("trimoraLoggedInBarber", JSON.stringify({
        name: barber.name,
        email: barber.email
    }));

    alert("Welcome " + barber.name + "!");

    window.location.href = "barber.html";
});

// INITIAL STATE

showCustomerLogin();
