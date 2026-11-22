/* TRIMORA BARBER LOGIN */

// ELEMENTS

const barberLoginForm = document.getElementById("barber-login-form");
const passwordInput = document.getElementById("barber-password");
const passwordToggle = document.getElementById("toggle-password");

// HAMBURGER MENU

const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("active");

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

// SHOW / HIDE PASSWORD

passwordToggle.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";
    passwordToggle.textContent = isPassword ? "🙈" : "👁";
    passwordToggle.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password"
    );
});

// GET BARBERS CREATED BY ADMIN

function getBarbers() {
    try {
        const savedBarbers = JSON.parse(
            localStorage.getItem("trimoraBarbers") || "[]"
        );

        return Array.isArray(savedBarbers) ? savedBarbers : [];
    } catch (error) {
        return [];
    }
}

// BARBER LOGIN

barberLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("barber-email")
        .value.trim().toLowerCase();

    const password = passwordInput.value;

    const barbers = getBarbers();

    const barber = barbers.find(item =>
        item &&
        typeof item === "object" &&
        typeof item.email === "string" &&
        item.email.trim().toLowerCase() === email &&
        item.password === password
    );

    if (!barber) {
        alert("Invalid email or password. Please contact Admin.");
        return;
    }

    if (!barber.name) {
        alert("Barber account details are incomplete. Please contact Admin.");
        return;
    }

    // SAVE BARBER SESSION

    localStorage.removeItem("trimoraLoggedInUser");

    localStorage.setItem("trimoraBarberName", barber.name);
    localStorage.setItem("trimoraBarberEmail", barber.email);

    localStorage.setItem("trimoraLoggedInBarber", JSON.stringify({
        name: barber.name,
        email: barber.email
    }));

    alert("Login successful! Welcome " + barber.name);

    window.location.href = "barber.html";
});
