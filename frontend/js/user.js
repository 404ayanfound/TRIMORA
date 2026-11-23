// HTML Elements
const serviceBarber = document.querySelector(".service-barber");
const serviceName = document.getElementById("service-name");
const barberName = document.getElementById("barber-name");
const servicePrice = document.getElementById("service-price");
const serviceImage = document.getElementById("service-image");
const barberImage = document.getElementById("barber-image");

const details = document.querySelectorAll(".appointment-details strong");
const status = document.querySelector(".status");
const cancelButton = document.querySelector(".cancel-btn");

// Navigation Elements
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");
const logoutButton = document.getElementById("logout-btn");

// Barber Images
const barberImages = {
    arjun: "images/arjun.jpg",
    rahul: "images/rahul.jpg",
    vikash: "images/vikash.jpg"
};

// MOBILE HAMBURGER MENU
menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("active");

    menuToggle.textContent = isOpen ? "✕" : "☰";
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

// Close menu after clicking a navigation link
navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

// LOGOUT
logoutButton.addEventListener("click", () => {
    localStorage.removeItem("trimoraLoggedInUser");
});

// READ ALL APPOINTMENTS
function getAppointments() {
    const saved = localStorage.getItem("trimoraAppointments");

    if (saved !== null) {
        try {
            const appointments = JSON.parse(saved);
            return Array.isArray(appointments) ? appointments : [];
        } catch (error) {
            console.error("Could not read appointments:", error);
            return [];
        }
    }

    // Migrate old single appointment
    try {
        const oldAppointment = JSON.parse(
            localStorage.getItem("trimoraAppointment") || "null"
        );

        if (oldAppointment) {
            const appointments = [oldAppointment];

            localStorage.setItem(
                "trimoraAppointments",
                JSON.stringify(appointments)
            );

            return appointments;
        }
    } catch (error) {
        console.error("Could not migrate old appointment:", error);
    }

    return [];
}

// FIND LATEST APPOINTMENT
// Cancelled appointment is also retained so its red status can be shown.
function getLatestAppointment(appointments) {
    const sortedAppointments = [...appointments];

    sortedAppointments.sort((a, b) => Number(b.id) - Number(a.id));

    return sortedAppointments[0] || null;
}

// SYNC LATEST APPOINTMENT
function syncLatestAppointment(appointments) {
    const latest = getLatestAppointment(appointments);

    if (latest) {
        localStorage.setItem(
            "trimoraAppointment",
            JSON.stringify(latest)
        );
    } else {
        localStorage.removeItem("trimoraAppointment");
    }

    return latest;
}

// UPDATE STATUS BADGE
function updateStatusBadge(appointment) {
    const appointmentStatus =
        String(appointment.status || "Confirmed").toLowerCase();

    status.className = "status";

    if (["cancelled", "canceled"].includes(appointmentStatus)) {
        status.textContent = "Cancelled";
        status.classList.add("cancelled");
    } else {
        // Any existing non-cancelled appointment stays green.
        status.textContent = "Confirmed";
        status.classList.add("confirmed");
    }
}

// LOAD APPOINTMENT
function loadAppointment() {
    const appointments = getAppointments();
    const appointment = syncLatestAppointment(appointments);

    if (appointment && appointment.service) {

        serviceBarber.hidden = false;

        const fullService = String(appointment.service).trim();
        const service = fullService.toLowerCase();

        let serviceLabel;
        let defaultPrice;
        let imagePath;

        // IDENTIFY SERVICE
        if (service.includes("hair") && service.includes("beard")) {
            serviceLabel = "Hair + Beard";
            defaultPrice = 200;
            imagePath = "images/hair & beard.jpg";

        } else if (service.includes("beard")) {
            serviceLabel = "Beard Trim";
            defaultPrice = 100;
            imagePath = "images/beard.jpg";

        } else {
            serviceLabel = "Haircut";
            defaultPrice = 150;
            imagePath = "images/haircut.jpg";
        }

        // SERVICE DETAILS
        serviceName.textContent = serviceLabel;

        const price = Number(appointment.price);

        servicePrice.textContent =
            "₹" + (Number.isFinite(price) && price > 0
                ? price
                : defaultPrice);

        serviceImage.src = imagePath;

        // BARBER DETAILS
        const selectedBarber = String(
            appointment.barber || appointment.barberName || ""
        ).trim();

        barberName.textContent = selectedBarber || "—";

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

        // APPOINTMENT DETAILS
        details[0].textContent = appointment.date || "—";
        details[1].textContent = appointment.time || "—";
        details[2].textContent = appointment.queue
            ? "#" + String(appointment.queue).replace(/^#/, "")
            : "—";

        // STATUS
        updateStatusBadge(appointment);

        // CANCEL BUTTON
        const appointmentStatus =
            String(appointment.status || "").toLowerCase();

        cancelButton.disabled =
            ["completed", "cancelled", "canceled"].includes(
                appointmentStatus
            );

    } else {

        // NO APPOINTMENT
        serviceBarber.hidden = true;

        serviceName.textContent = "—";
        barberName.textContent = "—";
        servicePrice.textContent = "—";

        details.forEach(detail => {
            detail.textContent = "—";
        });

        status.textContent = "No Appointment";
        status.className = "status no-appointment";

        cancelButton.disabled = true;
    }
}

// INITIAL LOAD
loadAppointment();

// CANCEL APPOINTMENT
cancelButton.addEventListener("click", () => {

    const appointments = getAppointments();
    const appointment = getLatestAppointment(appointments);

    if (!appointment) {
        loadAppointment();
        return;
    }

    if (
        ["cancelled", "canceled", "completed"].includes(
            String(appointment.status || "").toLowerCase()
        )
    ) {
        return;
    }

    if (!confirm("Are you sure you want to cancel your appointment?")) {
        return;
    }

    // UPDATE APPOINTMENT STATUS
    const updatedAppointments = appointments.map(item => {
        if (String(item.id) === String(appointment.id)) {
            return {
                ...item,
                status: "Cancelled"
            };
        }

        return item;
    });

    localStorage.setItem(
        "trimoraAppointments",
        JSON.stringify(updatedAppointments)
    );

    // REFRESH DASHBOARD
    loadAppointment();

    alert("Appointment cancelled successfully!");
});
