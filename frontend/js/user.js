
const loggedInUser = JSON.parse(
    localStorage.getItem("trimoraLoggedInUser") || "null"
);

if (!loggedInUser || !loggedInUser.email) {
    window.location.replace("login.html");
}

const serviceBarber = document.querySelector(".service-barber");
const serviceName = document.getElementById("service-name");
const barberName = document.getElementById("barber-name");
const servicePrice = document.getElementById("service-price");
const serviceImage = document.getElementById("service-image");
const barberImage = document.getElementById("barber-image");
const details = document.querySelectorAll(".appointment-details strong");
const status = document.querySelector(".status");
const cancelButton = document.querySelector(".cancel-btn");

const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");
const logoutButton = document.getElementById("logout-btn");

const barberImages = {
    arjun: "images/arjun.jpg",
    rahul: "images/rahul.jpg",
    vikash: "images/vikash.jpg"
};

menuToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("active");
    menuToggle.textContent = open ? "✕" : "☰";
    menuToggle.setAttribute("aria-expanded", open);
});

navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("trimoraLoggedInUser");
});

function getAppointments() {
    try {
        const data = JSON.parse(
            localStorage.getItem("trimoraAppointments") || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function getMyAppointment() {
    return getAppointments()
        .filter(item =>
            String(item.email || "").toLowerCase() ===
            loggedInUser.email.toLowerCase() &&
            !["cancelled", "canceled"].includes(
                String(item.status || "").toLowerCase()
            )
        )
        .sort((a, b) => Number(b.id) - Number(a.id))[0] || null;
}

function loadAppointment() {
    const appointment = getMyAppointment();

    if (!appointment) {
        serviceBarber.hidden = true;
        serviceName.textContent = "—";
        barberName.textContent = "—";
        servicePrice.textContent = "—";

        details.forEach(item => item.textContent = "—");

        status.textContent = "No Appointment";
        status.className = "status no-appointment";
        cancelButton.disabled = true;
        return;
    }

    serviceBarber.hidden = false;

    const service = String(appointment.service || "").toLowerCase();

    let serviceLabel = "Haircut";
    let imagePath = "images/haircut.jpg";
    let price = 150;

    if (service.includes("hair") && service.includes("beard")) {
        serviceLabel = "Hair + Beard";
        imagePath = "images/hair & beard.jpg";
        price = 200;
    } else if (service.includes("beard")) {
        serviceLabel = "Beard Trim";
        imagePath = "images/beard.jpg";
        price = 100;
    }

    serviceName.textContent = serviceLabel;
    servicePrice.textContent = "₹" + (Number(appointment.price) || price);
    serviceImage.src = imagePath;

    const selectedBarber = appointment.barber || appointment.barberName || "";
    barberName.textContent = selectedBarber;

    const barberKey = Object.keys(barberImages).find(name =>
        selectedBarber.toLowerCase().includes(name)
    );

    barberImage.onerror = function () {
        this.onerror = null;
        this.src = "images/barber.jpg";
    };

    barberImage.src = barberKey
        ? barberImages[barberKey]
        : "images/barber.jpg";

    details[0].textContent = appointment.date || "—";
    details[1].textContent = appointment.time || "—";
    details[2].textContent = appointment.queue
        ? "#" + String(appointment.queue).replace(/^#/, "")
        : "—";

    status.textContent = appointment.status || "Confirmed";
    status.className = "status confirmed";
    cancelButton.disabled =
        String(appointment.status).toLowerCase() === "completed";
}

loadAppointment();

cancelButton.addEventListener("click", () => {
    const appointment = getMyAppointment();

    if (!appointment) return;

    if (!confirm("Are you sure you want to cancel your appointment?")) {
        return;
    }

    const appointments = getAppointments().map(item =>
        String(item.id) === String(appointment.id)
            ? { ...item, status: "Cancelled" }
            : item
    );

    localStorage.setItem(
        "trimoraAppointments",
        JSON.stringify(appointments)
    );

    loadAppointment();
    alert("Appointment cancelled successfully!");
});
